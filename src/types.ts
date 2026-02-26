
export interface VSTPlugin {
  vendor: string;
  name: string;
  type: string;
  version: string;
  lastModified: string;
}

export interface SignalChainStep {
  pluginName: string;
  purpose: string;
}

export interface ParameterSetting {
  parameter: string;
  value: string;
  explanation: string;
}

export interface PluginDeepDive {
  pluginName: string;
  settings: ParameterSetting[];
  proTip: string;
}

export interface RecipeParameters {
  recipeTitle: string;
  instrumentDives: {
    instrumentName: string;
    sourceSettings: ParameterSetting[];
    preFxAdvice: string;
  }[];
  dives: PluginDeepDive[];
  mixingAdvice: string;
}

export interface DrumPattern {
  kick: number[];
  snare: {
    isClap: boolean;
    steps: number[];
  };
  hiHat: {
    isDoubleTime: boolean;
    steps: number[];
  };
  velocityHumanized: boolean;
  swing: {
    kick: number;
    snare: number;
    hiHat: number;
  };
}

export interface BeatRecipe {
  title: string;
  style: string;
  bpm: number;
  description: string;
  ingredients: {
    instrument: string;
    sourceSoundGoal: string;
    processing: SignalChainStep[];
    loopGuide: string;
  }[];
  mastering: string[];
  artistTypes: string[];
  layeringStrategy: string;
  drumPatterns: {
    intro: DrumPattern;
    verse: DrumPattern;
    hook: DrumPattern;
    bridge: DrumPattern;
    outro: DrumPattern;
  };
  arrangement?: Record<string, string>;
  mixingAdvice?: string;
  deepDives?: {
    pluginName: string;
    whyItWorks: string;
    keySettings: {
      parameter: string;
      value: string;
    }[];
  }[];
  analogDives?: {
    instrumentName: string;
    technique: string;
    settings: {
      parameter: string;
      value: string;
    }[];
  }[];
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface UIPreset {
  id: string;
  name: string;
  theme: AppTheme;
  grillStyle: string;
  knifeStyle: string;
  duragStyle: string;
  pendantStyle: string;
  chainStyle: string;
  saberColor: string;
  showChain: boolean;
  highEyes: boolean;
  isCigarEquipped: boolean;
  showChefHat: boolean;
  bubbleColor: string;
  createdAt: string;
}

export interface SharedSession {
  recipe: SavedRecipe;
  senderPlugins: VSTPlugin[];
  preset: UIPreset;
  senderName: string;
}

export interface SavedRecipe extends BeatRecipe {
  id: string;
  savedAt: string;
  bubbleColor: string;
  folderId?: string;
  parameters?: RecipeParameters;
  linkedPresetId?: string;
}

export interface HistoryItem extends BeatRecipe {
  generatedAt: string;
}

export interface User {
  name: string;
  email: string;
  photo: string;
}

export interface RecommendationResponse {
  recipes: BeatRecipe[];
}

export type AppTheme = 'coldest' | 'crazy-bird' | 'hustle-time' | 'chef-mode';

export type KnifeStyle = 'standard' | 'gold' | 'bloody' | 'adamant' | 'mythril' | 'samuels-saber' | 'steak-knife';

export type PendantStyle = 'silver' | 'gold' | 'rose-gold';

export type ChainStyle = 'silver' | 'gold' | 'rose-gold';

export type DuragStyle = 'standard' | 'royal-green' | 'dragonball-purple';
