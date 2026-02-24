
import { GoogleGenAI, Type } from "@google/genai";
import { VSTPlugin, RecommendationResponse, BeatRecipe, RecipeParameters, SavedRecipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const categorizeAndCompareLibraries = async (senderPlugins: VSTPlugin[], myPlugins: VSTPlugin[]) => {
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

export const getBeatRecommendations = async (plugins: VSTPlugin[]): Promise<RecommendationResponse> => {
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" for the craziest rap beat.
    Only use plugins from this list:
    ${pluginListStr}

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
    - swingPercentage (number): the recommended swing percentage (0-100) for this section
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
      swingPercentage: { type: Type.NUMBER }
    },
    required: ["kick", "snare", "hiHat", "velocityHumanized", "swingPercentage"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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

export const getCustomBeatRecommendations = async (plugins: VSTPlugin[], query: string): Promise<RecommendationResponse> => {
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" specifically for a "${query} type beat".
    Only use plugins from this list:
    ${pluginListStr}

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
    - swingPercentage (number): the recommended swing percentage (0-100) for this section
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
      swingPercentage: { type: Type.NUMBER }
    },
    required: ["kick", "snare", "hiHat", "velocityHumanized", "swingPercentage"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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

export const getSongBeatRecommendations = async (plugins: VSTPlugin[], songQuery: string): Promise<RecommendationResponse> => {
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" that recreate the production style, bounce, and sonic atmosphere of the song "${songQuery}".
    Only use plugins from this list:
    ${pluginListStr}

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
    - swingPercentage (number): the recommended swing percentage (0-100) for this section
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
      swingPercentage: { type: Type.NUMBER }
    },
    required: ["kick", "snare", "hiHat", "velocityHumanized", "swingPercentage"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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
    model: "gemini-3-pro-preview",
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

export const getDetailedParameters = async (recipe: BeatRecipe): Promise<RecipeParameters> => {
  const prompt = `
    For the following Beat Recipe, provide in-depth plugin parameters and beginner-friendly explanations for EVERY plugin mentioned.
    
    IMPORTANT: You must also provide 'instrumentDives'. For each instrument used in the recipe:
    1. 'sourceSettings': Specific internal parameters of the instrument plugin itself (e.g., Oscillator settings, ADSR, Filter Cutoff within the synth).
    2. 'preFxAdvice': What the user should do to the raw instrument sound to get it ready BEFORE they even touch the FX chain.

    Recipe: ${recipe.title} (${recipe.style})
    Description: ${recipe.description}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Mastering: ${recipe.mastering.join(', ')}
    Layering Strategy: ${recipe.layeringStrategy}

    Be specific. For a Compressor, mention Threshold, Ratio, Attack, Release. For EQ, mention Frequencies.
    Explain the settings so a beginner understands WHY they are being adjusted.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipeTitle: { type: Type.STRING },
          instrumentDives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instrumentName: { type: Type.STRING },
                sourceSettings: {
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
                preFxAdvice: { type: Type.STRING }
              },
              required: ["instrumentName", "sourceSettings", "preFxAdvice"]
            }
          },
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
        },
        required: ["recipeTitle", "instrumentDives", "dives", "mixingAdvice"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{"dives": []}';
  return JSON.parse(jsonStr);
};
