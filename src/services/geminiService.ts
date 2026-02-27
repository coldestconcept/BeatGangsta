
import { GoogleGenAI, Type } from "@google/genai";
import { VSTPlugin, RecommendationResponse, BeatRecipe, RecipeParameters, SavedRecipe } from "../types";

const getAI = () => {
  const apiKey = localStorage.getItem('bg_gemini_api_key');
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const categorizeAndCompareLibraries = async (senderPlugins: VSTPlugin[], myPlugins: VSTPlugin[]) => {
  const ai = getAI();
  const senderStr = senderPlugins.map(p => `${p.vendor} - ${p.name}`).join('\n');
  const receiverStr = myPlugins.map(p => `${p.vendor} - ${p.name}`).join('\n');

  const prompt = `
    Compare these two VST plugin libraries. 
    Categorize all plugins from BOTH lists into these specific categories: 
    'Instruments', 'Dynamics (Compressors/Limiters)', 'Frequency (EQ/Filters)', 'Spacial (Reverb/Delay)', and 'Creative FX'.
    
    Sender's Library:
    ${senderStr}

    My Library:
    ${receiverStr}

    For each category, list the plugins the Sender has that I AM MISSING (similar names don't count as missing).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                categoryName: { type: Type.STRING },
                senderPlugins: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingFromReceiver: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["categoryName", "senderPlugins", "missingFromReceiver"]
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"categories": []}');
};

const ANALOG_DESCRIPTIONS: Record<string, string> = {
  'Fender Jazzmaster': 'Bright, chimy, and percussive "surf" tone.',
  'Fender Stratocaster': 'Glassy, quacky, and transparent bright tone.',
  'ESP EX-50 (LTD)': 'Heavy, dense, fat, and full sound with humbucker pickups.',
  'Fender Precision Bass': 'Characteristic punchy "galloping" style and mid-range growl.',
  'Alhambra 7FC': 'Bright, aggressive flamenco attack.',
  'Yamaha C40': 'Warm, mellow nylon string tone.',
  'Korg Minilogue XD': 'Modern polyphonic analog warmth with digital multi-engine grit.',
  'Behringer TD-3': 'Classic squelchy 303 acid bass lines.',
  'UNO Synth': 'Aggressive, raw analog monophonic leads.',
  'Shure SM57': 'Industry standard dynamic mic, great for aggressive vocals or snare drums.',
  'Electro-Harmonix Big Muff': 'Iconic thick, creamy fuzz for guitars or synths.',
  'Orange Micro Dark': 'High-gain, aggressive tube-hybrid tone.',
  'Ampeg V-4B': 'Classic all-tube bass grit and punch.',
  'Heritage Audio 73 JR II': 'Classic 1073-style preamp warmth and saturation.',
  'Warm Audio WA76-D': 'Fast, aggressive FET compression.'
};

const generateAnalogStr = (analogInstruments: string[], analogHardware: string[]): string => {
  if (analogInstruments.length === 0 && analogHardware.length === 0) {
    return '';
  }

  const selectedDescriptions: string[] = [];
  
  analogInstruments.forEach(instrument => {
    if (ANALOG_DESCRIPTIONS[instrument]) {
      selectedDescriptions.push(`- ${instrument}: ${ANALOG_DESCRIPTIONS[instrument]}`);
    }
  });

  analogHardware.forEach(hardware => {
    if (ANALOG_DESCRIPTIONS[hardware]) {
      selectedDescriptions.push(`- ${hardware}: ${ANALOG_DESCRIPTIONS[hardware]}`);
    }
  });

  if (selectedDescriptions.length === 0) {
    return `\nThe user has the following analog equipment, but no specific sonic characteristics were provided:\nInstruments: ${analogInstruments.join(', ')}\nHardware: ${analogHardware.join(', ')}`;
  }

  return `\nThe user also owns the following real analog equipment:\nInstruments: ${analogInstruments.join(', ')}\nHardware: ${analogHardware.join(', ')}\n\nIMPORTANT SONIC CHARACTERISTICS FOR ANALOG GEAR:\n${selectedDescriptions.join('\n')}\n\nPlease incorporate these real analog instruments and hardware into the beat recipes where appropriate, alongside the VST plugins. Use their specific sonic identities to inform the 'sourceSoundGoal' and 'loopGuide'.`;
};

export const enrichPluginLibrary = async (
  plugins: VSTPlugin[],
  onProgress: (progress: number, estimatedTimeLeft: number) => void
): Promise<VSTPlugin[]> => {
  let processedCount = 0;
  const startTime = Date.now();
  const ai = getAI();

  const updateProgress = (count: number) => {
    processedCount += count;
    const progress = Math.round((processedCount / plugins.length) * 100);
    const elapsedTime = Date.now() - startTime;
    const timePerPlugin = elapsedTime / processedCount;
    const remainingPlugins = plugins.length - processedCount;
    const estimatedTimeLeft = Math.round((remainingPlugins * timePerPlugin) / 1000);
    onProgress(progress, estimatedTimeLeft);
  };

  const processBatch = async (batch: VSTPlugin[]): Promise<VSTPlugin[]> => {
    const prompt = `
      You are a VST plugin expert. Research the following ${batch.length} plugins and provide a JSON array of objects.
      
      Plugins to research:
      ${batch.map((p, idx) => `${idx + 1}. ${p.vendor} - ${p.name} (v${p.version})`).join('\n')}

      For each plugin, provide:
      - description: A short, engaging summary (1-2 sentences).
      - features: An array of 2-3 unique features.
      - category: ONE of: 'Instruments', 'Dynamics', 'Equalizers', 'Reverb & Delay', 'Modulation', 'Distortion & Saturation', 'Utility & Metering', 'Creative FX'.

      INSTRUCTIONS:
      1. Use your internal knowledge first. 
      2. ONLY use the googleSearch tool if you are unsure about a plugin's specific category or features.
      3. If a specific version (e.g. v${batch[0].version}) is hard to find, provide info for the general plugin but note it.
      4. Return exactly ${batch.length} objects in the same order as the input list.
      5. If you absolutely cannot find info for a plugin, return an object with category: 'Uncategorized'.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                features: { type: Type.ARRAY, items: { type: Type.STRING } },
                category: { type: Type.STRING, enum: ['Instruments', 'Dynamics', 'Equalizers', 'Reverb & Delay', 'Modulation', 'Distortion & Saturation', 'Utility & Metering', 'Creative FX', 'Uncategorized'] }
              },
              required: ["category"]
            }
          }
        }
      });

      const results = JSON.parse(response.text || '[]');
      
      const enrichedBatch = batch.map((plugin, idx) => {
        const result = results[idx] || {};
        return {
          ...plugin,
          description: result.description || `A ${result.category?.toLowerCase() || 'plugin'} by ${plugin.vendor}.`,
          features: result.features || [],
          type: result.category || 'Uncategorized',
        };
      });

      updateProgress(batch.length);
      return enrichedBatch;
    } catch (error: any) {
      console.error(`Error enriching batch:`, error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
        throw new Error("QUOTA_EXCEEDED");
      }
      
      // If a batch fails, we can't easily recover without strictness issues, 
      // but let's try to return uncategorized for this batch to keep moving if it's not a quota issue
      // However, user wants strictness, so we throw.
      throw error;
    }
  };

  // Process plugins in batches of 5 with a concurrency of 3 batches (15 plugins at a time)
  const batchSize = 5;
  const concurrency = 3;
  const enrichedPlugins: VSTPlugin[] = [];
  
  for (let i = 0; i < plugins.length; i += batchSize * concurrency) {
    const chunk = plugins.slice(i, i + batchSize * concurrency);
    const batches = [];
    for (let j = 0; j < chunk.length; j += batchSize) {
      batches.push(chunk.slice(j, j + batchSize));
    }
    
    const results = await Promise.all(batches.map(processBatch));
    results.forEach(batchResult => enrichedPlugins.push(...batchResult));
  }

  return enrichedPlugins;
};

export const getBeatRecommendations = async (plugins: VSTPlugin[], analogInstruments: string[] = [], analogHardware: string[] = [], excludeAnalog: boolean = false, dawType: string | null = null, starredPlugins: string[] = []): Promise<RecommendationResponse> => {
  const ai = getAI();
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');
  const analogStr = !excludeAnalog ? generateAnalogStr(analogInstruments, analogHardware) : '';
  const dawStr = dawType ? `\nThe user is using ${dawType} as their DAW. Include specific instructions or tips for ${dawType} where relevant in the guides or recipes.` : '';
  const starredStr = starredPlugins.length > 0 ? `\nCRITICAL: The user has STARRED (favorited) the following plugins. You MUST prioritize using these plugins in your recipes whenever possible:\n${starredPlugins.join(', ')}` : '';
  
  const hasSphereMic = analogHardware.some(h => ['Sphere DLX', 'Sphere LX', 'L22'].includes(h));
  const sphereMicStr = hasSphereMic ? `\nCRITICAL: The user owns a Universal Audio Sphere (DLX/LX) or Townsend Labs L22 microphone. If the recipe involves vocals or acoustic instruments, you MUST recommend using the 'UAD Sphere Mic Collection', 'Ocean Way Mic Collection', or 'Bill Putnam Mic Collection' plugins. For these plugins, specify the EXACT 'Mic Model' (e.g., LD-47K, LD-67, OW-47, BP-251E) and other relevant parameters (Pattern, Filter, Proximity, Axis) to achieve the desired sound character.` : '';

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" for the craziest rap beat.
    Only use plugins from this list:
    ${pluginListStr}
    ${analogStr}
    ${dawStr}
    ${starredStr}
    ${sphereMicStr}

    Focus on modern sub-genres: Melodic Trap, Dark Drill, High-Energy Rage.
    For each recipe, also identify 2-3 mainstream or commonly known artists who would typically use that specific beat type (e.g., "Lil Wayne type", "Lil Uzi type", "Travis Scott type").
    Include a recommended BPM for the beat.
    
    For each ingredient (instrument):
    - Describe the 'sourceSoundGoal': What specific sound/preset type should they look for in that instrument BEFORE adding any FX?
    - Provide a 'loopGuide': A specific tip on how to write the MIDI loop for this instrument (e.g., "Use syncopated triplets", "Keep it in the lower octaves").
    
    Provide a 'layeringStrategy': Explain how all these instruments should sit together in the frequency spectrum and how they complement each other.

    Also provide specific drum patterns for 5 sections: Intro, Verse, Hook, Bridge, and Outro.
    For each section, specify:
    - Kick pattern (step numbers 1-16)
    - Snare OR Clap pattern (choose one based on style, step numbers 1-16)
    - Hi-Hat pattern (step numbers 1-16, or 1-32 if double time/fast)
    - velocityHumanized (boolean): whether the velocity should be humanized/varied for this section
    - swing: an object with hiHat, snare, and kick properties, each with a swing percentage (1-100) for this section
  `;

  const drumPatternSchema = {
    type: Type.OBJECT,
    properties: {
      kick: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      snare: {
        type: Type.OBJECT,
        properties: {
          isClap: { type: Type.BOOLEAN },
          steps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
        },
        required: ["isClap", "steps"]
      },
      hiHat: {
        type: Type.OBJECT,
        properties: {
          isDoubleTime: { type: Type.BOOLEAN },
          steps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
        },
        required: ["isDoubleTime", "steps"]
      },
      velocityHumanized: { type: Type.BOOLEAN },
      swing: {
        type: Type.OBJECT,
        properties: {
          kick: { type: Type.NUMBER, minimum: 1, maximum: 100 },
          snare: { type: Type.NUMBER, minimum: 1, maximum: 100 },
          hiHat: { type: Type.NUMBER, minimum: 1, maximum: 100 }
        },
        required: ["kick", "snare", "hiHat"]
      }
    },
    required: ["kick", "snare", "hiHat", "velocityHumanized", "swing"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                style: { type: Type.STRING },
                bpm: { type: Type.NUMBER },
                description: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      instrument: { type: Type.STRING },
                      sourceSoundGoal: { type: Type.STRING },
                      processing: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            pluginName: { type: Type.STRING },
                            purpose: { type: Type.STRING }
                          },
                          required: ["pluginName", "purpose"]
                        }
                      },
                      loopGuide: { type: Type.STRING }
                    },
                    required: ["instrument", "sourceSoundGoal", "processing", "loopGuide"]
                  }
                },
                mastering: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                artistTypes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Mainstream artists who would use this beat type, e.g. 'Lil Wayne type'"
                },
                layeringStrategy: { type: Type.STRING },
                drumPatterns: {
                  type: Type.OBJECT,
                  properties: {
                    intro: drumPatternSchema,
                    verse: drumPatternSchema,
                    hook: drumPatternSchema,
                    bridge: drumPatternSchema,
                    outro: drumPatternSchema
                  },
                  required: ["intro", "verse", "hook", "bridge", "outro"]
                }
              },
              required: ["title", "style", "bpm", "description", "ingredients", "mastering", "artistTypes", "layeringStrategy", "drumPatterns"]
            }
          }
        },
        required: ["recipes"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{"recipes": []}';
  return JSON.parse(jsonStr);
};

export const getCustomBeatRecommendations = async (plugins: VSTPlugin[], query: string, analogInstruments: string[] = [], analogHardware: string[] = [], excludeAnalog: boolean = false, dawType: string | null = null, starredPlugins: string[] = []): Promise<RecommendationResponse> => {
  const ai = getAI();
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');
  const analogStr = !excludeAnalog ? generateAnalogStr(analogInstruments, analogHardware) : '';
  const dawStr = dawType ? `\nThe user is using ${dawType} as their DAW. Include specific instructions or tips for ${dawType} where relevant in the guides or recipes.` : '';
  const starredStr = starredPlugins.length > 0 ? `\nCRITICAL: The user has STARRED (favorited) the following plugins. You MUST prioritize using these plugins in your recipes whenever possible:\n${starredPlugins.join(', ')}` : '';

  const hasSphereMic = analogHardware.some(h => ['Sphere DLX', 'Sphere LX', 'L22'].includes(h));
  const sphereMicStr = hasSphereMic ? `\nCRITICAL: The user owns a Universal Audio Sphere (DLX/LX) or Townsend Labs L22 microphone. If the recipe involves vocals or acoustic instruments, you MUST recommend using the 'UAD Sphere Mic Collection', 'Ocean Way Mic Collection', or 'Bill Putnam Mic Collection' plugins. For these plugins, specify the EXACT 'Mic Model' (e.g., LD-47K, LD-67, OW-47, BP-251E) and other relevant parameters (Pattern, Filter, Proximity, Axis) to achieve the desired sound character.` : '';

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" specifically for a "${query} type beat".
    Only use plugins from this list:
    ${pluginListStr}
    ${analogStr}
    ${dawStr}
    ${starredStr}
    ${sphereMicStr}

    Ensure the recipes capture the signature sound, bounce, and atmospheric elements associated with ${query}.
    For each recipe, also identify 2-3 mainstream or commonly known artists who would typically use that specific beat type.
    Include a recommended BPM for the beat.

    For each ingredient (instrument):
    - Describe the 'sourceSoundGoal': What specific sound/preset type should they look for in that instrument BEFORE adding any FX?
    - Provide a 'loopGuide': A specific tip on how to write the MIDI loop for this instrument.
    
    Provide a 'layeringStrategy': Explain how all these instruments should sit together in the frequency spectrum.

    Also provide specific drum patterns for 5 sections: Intro, Verse, Hook, Bridge, and Outro.
    For each section, specify:
    - Kick pattern (step numbers 1-16)
    - Snare OR Clap pattern (choose one based on style, step numbers 1-16)
    - Hi-Hat pattern (step numbers 1-16, or 1-32 if double time/fast)
    - velocityHumanized (boolean): whether the velocity should be humanized/varied for this section
    - swing: an object with hiHat, snare, and kick properties, each with a swing percentage (1-100) for this section
  `;

  const drumPatternSchema = {
    type: Type.OBJECT,
    properties: {
      kick: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      snare: {
        type: Type.OBJECT,
        properties: {
          isClap: { type: Type.BOOLEAN },
          steps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
        },
        required: ["isClap", "steps"]
      },
      hiHat: {
        type: Type.OBJECT,
        properties: {
          isDoubleTime: { type: Type.BOOLEAN },
          steps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
        },
        required: ["isDoubleTime", "steps"]
      },
      velocityHumanized: { type: Type.BOOLEAN },
      swing: {
        type: Type.OBJECT,
        properties: {
          kick: { type: Type.NUMBER, minimum: 1, maximum: 100 },
          snare: { type: Type.NUMBER, minimum: 1, maximum: 100 },
          hiHat: { type: Type.NUMBER, minimum: 1, maximum: 100 }
        },
        required: ["kick", "snare", "hiHat"]
      }
    },
    required: ["kick", "snare", "hiHat", "velocityHumanized", "swing"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                style: { type: Type.STRING },
                bpm: { type: Type.NUMBER },
                description: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      instrument: { type: Type.STRING },
                      sourceSoundGoal: { type: Type.STRING },
                      processing: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            pluginName: { type: Type.STRING },
                            purpose: { type: Type.STRING }
                          },
                          required: ["pluginName", "purpose"]
                        }
                      },
                      loopGuide: { type: Type.STRING }
                    },
                    required: ["instrument", "sourceSoundGoal", "processing", "loopGuide"]
                  }
                },
                mastering: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                artistTypes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Mainstream artists who would use this beat type, e.g. 'Lil Wayne type'"
                },
                layeringStrategy: { type: Type.STRING },
                drumPatterns: {
                  type: Type.OBJECT,
                  properties: {
                    intro: drumPatternSchema,
                    verse: drumPatternSchema,
                    hook: drumPatternSchema,
                    bridge: drumPatternSchema,
                    outro: drumPatternSchema
                  },
                  required: ["intro", "verse", "hook", "bridge", "outro"]
                }
              },
              required: ["title", "style", "bpm", "description", "ingredients", "mastering", "artistTypes", "layeringStrategy", "drumPatterns"]
            }
          }
        },
        required: ["recipes"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{"recipes": []}';
  return JSON.parse(jsonStr);
};

export const getSongBeatRecommendations = async (plugins: VSTPlugin[], songQuery: string, analogInstruments: string[] = [], analogHardware: string[] = [], excludeAnalog: boolean = false, dawType: string | null = null, starredPlugins: string[] = []): Promise<RecommendationResponse> => {
  const ai = getAI();
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');
  const analogStr = !excludeAnalog ? generateAnalogStr(analogInstruments, analogHardware) : '';
  const dawStr = dawType ? `\nThe user is using ${dawType} as their DAW. Include specific instructions or tips for ${dawType} where relevant in the guides or recipes.` : '';
  const starredStr = starredPlugins.length > 0 ? `\nCRITICAL: The user has STARRED (favorited) the following plugins. You MUST prioritize using these plugins in your recipes whenever possible:\n${starredPlugins.join(', ')}` : '';

  const hasSphereMic = analogHardware.some(h => ['Sphere DLX', 'Sphere LX', 'L22'].includes(h));
  const sphereMicStr = hasSphereMic ? `\nCRITICAL: The user owns a Universal Audio Sphere (DLX/LX) or Townsend Labs L22 microphone. If the recipe involves vocals or acoustic instruments, you MUST recommend using the 'UAD Sphere Mic Collection', 'Ocean Way Mic Collection', or 'Bill Putnam Mic Collection' plugins. For these plugins, specify the EXACT 'Mic Model' (e.g., LD-47K, LD-67, OW-47, BP-251E) and other relevant parameters (Pattern, Filter, Proximity, Axis) to achieve the desired sound character.` : '';

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" that recreate the production style, bounce, and sonic atmosphere of the song "${songQuery}".
    Only use plugins from this list:
    ${pluginListStr}
    ${analogStr}
    ${dawStr}
    ${starredStr}
    ${sphereMicStr}

    Ensure the recipes capture the signature sound, instrumentation, and mixing techniques of that specific song.
    For each recipe, also identify 2-3 mainstream or commonly known artists who would typically use that specific beat type.
    Include a recommended BPM for the beat.

    For each ingredient (instrument):
    - Describe the 'sourceSoundGoal': What specific sound/preset type should they look for in that instrument BEFORE adding any FX?
    - Provide a 'loopGuide': A specific tip on how to write the MIDI loop for this instrument.
    
    Provide a 'layeringStrategy': Explain how all these instruments should sit together in the frequency spectrum.

    Also provide specific drum patterns for 5 sections: Intro, Verse, Hook, Bridge, and Outro.
    For each section, specify:
    - Kick pattern (step numbers 1-16)
    - Snare OR Clap pattern (choose one based on style, step numbers 1-16)
    - Hi-Hat pattern (step numbers 1-16, or 1-32 if double time/fast)
    - velocityHumanized (boolean): whether the velocity should be humanized/varied for this section
    - swing: an object with hiHat, snare, and kick properties, each with a swing percentage (1-100) for this section
  `;

  const drumPatternSchema = {
    type: Type.OBJECT,
    properties: {
      kick: { type: Type.ARRAY, items: { type: Type.NUMBER } },
      snare: {
        type: Type.OBJECT,
        properties: {
          isClap: { type: Type.BOOLEAN },
          steps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
        },
        required: ["isClap", "steps"]
      },
      hiHat: {
        type: Type.OBJECT,
        properties: {
          isDoubleTime: { type: Type.BOOLEAN },
          steps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
        },
        required: ["isDoubleTime", "steps"]
      },
      velocityHumanized: { type: Type.BOOLEAN },
      swing: {
        type: Type.OBJECT,
        properties: {
          kick: { type: Type.NUMBER, minimum: 1, maximum: 100 },
          snare: { type: Type.NUMBER, minimum: 1, maximum: 100 },
          hiHat: { type: Type.NUMBER, minimum: 1, maximum: 100 }
        },
        required: ["kick", "snare", "hiHat"]
      }
    },
    required: ["kick", "snare", "hiHat", "velocityHumanized", "swing"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                style: { type: Type.STRING },
                bpm: { type: Type.NUMBER },
                description: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      instrument: { type: Type.STRING },
                      sourceSoundGoal: { type: Type.STRING },
                      processing: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            pluginName: { type: Type.STRING },
                            purpose: { type: Type.STRING }
                          },
                          required: ["pluginName", "purpose"]
                        }
                      },
                      loopGuide: { type: Type.STRING }
                    },
                    required: ["instrument", "sourceSoundGoal", "processing", "loopGuide"]
                  }
                },
                mastering: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                artistTypes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Mainstream artists who would use this beat type, e.g. 'Lil Wayne type'"
                },
                layeringStrategy: { type: Type.STRING },
                drumPatterns: {
                  type: Type.OBJECT,
                  properties: {
                    intro: drumPatternSchema,
                    verse: drumPatternSchema,
                    hook: drumPatternSchema,
                    bridge: drumPatternSchema,
                    outro: drumPatternSchema
                  },
                  required: ["intro", "verse", "hook", "bridge", "outro"]
                }
              },
              required: ["title", "style", "bpm", "description", "ingredients", "mastering", "artistTypes", "layeringStrategy", "drumPatterns"]
            }
          }
        },
        required: ["recipes"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{"recipes": []}';
  return JSON.parse(jsonStr);
};

export const adaptRecipeToMyPlugins = async (recipe: SavedRecipe, myPlugins: VSTPlugin[]): Promise<SavedRecipe> => {
  const ai = getAI();
  const receiverStr = myPlugins.map(p => `${p.vendor} - ${p.name}`).join('\n');

  const prompt = `
    I have a beat recipe shared by a friend, but I might not own all the plugins used in it.
    My available plugins are:
    ${receiverStr}

    Here is the shared recipe:
    Title: ${recipe.title}
    Style: ${recipe.style}
    BPM: ${recipe.bpm}
    Description: ${recipe.description}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Mastering: ${JSON.stringify(recipe.mastering)}
    Artist Types: ${JSON.stringify(recipe.artistTypes)}
    Parameters: ${JSON.stringify(recipe.parameters)}

    Please adapt this recipe so that it ONLY uses plugins from my available plugins list. 
    If I don't own a plugin used in the recipe, replace it with the most similar plugin I own, and provide new similar parameters for that beat style.
    If I do own the plugin, keep it and keep its parameters.
    Keep the original BPM.
    
    Return the adapted recipe in the exact same JSON structure as the original recipe, including the 'parameters' field if it was present.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          style: { type: Type.STRING },
          bpm: { type: Type.NUMBER },
          description: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instrument: { type: Type.STRING },
                processing: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pluginName: { type: Type.STRING },
                      purpose: { type: Type.STRING }
                    },
                    required: ["pluginName", "purpose"]
                  }
                }
              },
              required: ["instrument", "processing"]
            }
          },
          mastering: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          artistTypes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          parameters: {
            type: Type.OBJECT,
            properties: {
              recipeTitle: { type: Type.STRING },
              dives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pluginName: { type: Type.STRING },
                    settings: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          parameter: { type: Type.STRING },
                          value: { type: Type.STRING },
                          explanation: { type: Type.STRING }
                        },
                        required: ["parameter", "value", "explanation"]
                      }
                    },
                    proTip: { type: Type.STRING }
                  },
                  required: ["pluginName", "settings", "proTip"]
                }
              },
              mixingAdvice: { type: Type.STRING }
            }
          }
        },
        required: ["title", "style", "bpm", "description", "ingredients", "mastering", "artistTypes"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{}';
  const adapted = JSON.parse(jsonStr);
  
  return {
    ...recipe,
    ...adapted,
    id: Math.random().toString(36).substr(2, 9),
    savedAt: new Date().toISOString()
  };
};

export const getDetailedParameters = async (recipe: BeatRecipe): Promise<any> => {
  const ai = getAI();
  const prompt = `
    For the following Beat Recipe, provide in-depth plugin parameters and beginner-friendly explanations for EVERY plugin mentioned.
    
    Also provide a 'mixingAdvice' section and an 'arrangement' guide for the beat (Intro, Verse, Hook, Bridge, Outro).
    
    IMPORTANT: If the recipe includes any analog instruments (like Fender Stratocaster, Korg Minilogue XD, etc.), provide a 'analogDives' section.
    For each analog instrument:
    1. 'instrumentName': The name of the instrument.
    2. 'technique': Specific playing technique or advice (e.g., "Use the neck pickup for a warmer tone", "Play with an aggressive flamenco attack").
    3. 'settings': Recommended physical knob/switch settings on the hardware itself.

    Recipe: ${recipe.title} (${recipe.style})
    Description: ${recipe.description}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Mastering: ${recipe.mastering.join(', ')}
    Layering Strategy: ${recipe.layeringStrategy}

    Be specific. For a Compressor, mention Threshold, Ratio, Attack, Release. For EQ, mention Frequencies.
    Explain the settings so a beginner understands WHY they are being adjusted.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          arrangement: {
            type: Type.OBJECT,
            properties: {
              intro: { type: Type.STRING },
              verse: { type: Type.STRING },
              hook: { type: Type.STRING },
              bridge: { type: Type.STRING },
              outro: { type: Type.STRING }
            },
            required: ["intro", "verse", "hook", "bridge", "outro"]
          },
          mixingAdvice: { type: Type.STRING },
          deepDives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pluginName: { type: Type.STRING },
                whyItWorks: { type: Type.STRING },
                keySettings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      parameter: { type: Type.STRING },
                      value: { type: Type.STRING }
                    },
                    required: ["parameter", "value"]
                  }
                }
              },
              required: ["pluginName", "whyItWorks", "keySettings"]
            }
          },
          analogDives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instrumentName: { type: Type.STRING },
                technique: { type: Type.STRING },
                settings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      parameter: { type: Type.STRING },
                      value: { type: Type.STRING }
                    },
                    required: ["parameter", "value"]
                  }
                }
              },
              required: ["instrumentName", "technique", "settings"]
            }
          }
        },
        required: ["arrangement", "mixingAdvice", "deepDives"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{"deepDives": []}';
  return JSON.parse(jsonStr);
};
