
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { VSTPlugin, BeatRecipe, AppTheme, User, SavedRecipe, HistoryItem, Folder, KnifeStyle, PendantStyle, ChainStyle, RecipeParameters, UIPreset, SharedSession, DuragStyle, Hardware } from './types';
import { getBeatRecommendations, getDetailedParameters, getCustomBeatRecommendations, getSongBeatRecommendations, enrichPluginLibrary } from './services/geminiService';
import { enrichHardware } from './services/enrichmentService';
import { PluginCard } from './components/PluginCard';
import { HardwareCard } from './components/HardwareCard';
import { RecipeCard } from './components/RecipeCard';
import { Mascot, GrillStyle } from './components/Mascot';
import { AvianField } from './components/RavenField';
import { DAWGuide } from './components/DAWGuide';
import { Vault } from './components/Vault';
import { LeprechaunField } from './components/LeprechaunField';
import { FoodField } from './components/FoodField';
import { Hourglass } from './components/Hourglass';
import { RecipeViewerModal } from './components/RecipeViewerModal';
import { APIKeyModal } from './components/APIKeyModal';

import { CollaborationModal } from './components/CollaborationModal';
import { FriendsInfoModal } from './components/FriendsInfoModal';
import { AnalogEquipmentModal } from './components/AnalogEquipmentModal';
import { TrashModal } from './components/TrashModal';
import { AnimatePresence } from 'motion/react';
import { Star, X } from 'lucide-react';

// Moved outside to prevent remounting flashes
export interface LogoProps {
  size?: number;
  grillStyle: GrillStyle;
  knifeStyle: KnifeStyle;
  duragStyle: DuragStyle;
  pendantStyle: PendantStyle;
  chainStyle: ChainStyle;
  theme: AppTheme;
  saberColor?: string;
  showChain?: boolean;
  highEyes?: boolean;
  isCigarEquipped?: boolean;
  isTossingCigar?: boolean;
  showChefHat?: boolean;
  showSparkles?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, grillStyle, knifeStyle, duragStyle, pendantStyle, chainStyle, theme, saberColor, showChain, highEyes, isCigarEquipped, isTossingCigar, showChefHat, showSparkles, onClick }) => (
  <div 
    className="group relative flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer select-none" 
    onClick={onClick}
  >
    {showSparkles && (
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute bottom-1/4 right-0 w-3 h-3 bg-white rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-0 w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-200 rounded-full animate-pulse opacity-50" />
      </div>
    )}
    <Mascot 
      size={size} 
      grillStyle={grillStyle} 
      knifeStyle={knifeStyle} 
      duragStyle={duragStyle}
      pendantStyle={pendantStyle}
      chainStyle={chainStyle}
      saberColor={saberColor}
      showChain={showChain}
      highEyes={highEyes}
      isCigarEquipped={isCigarEquipped}
      isTossingCigar={isTossingCigar}
      showChefHat={showChefHat}
      glowColor={(theme as string) === 'hustle-time' ? '#facc15' : theme === 'chef-mode' ? '#ffffff' : '#0ea5e9'} 
      className="relative z-10" 
    />
  </div>
);

const RagIcon = ({ style, isActive }: { style: DuragStyle, isActive: boolean }) => {
  let mainColor = "black";
  if (style === 'royal-green') mainColor = isActive ? '#065f46' : 'black';
  if (style === 'dragonball-purple') mainColor = isActive ? '#4c1d95' : 'black';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4C4 4 6 12 12 12C18 12 20 4 20 4V20C20 20 18 16 12 16C6 16 4 20 4 20V4Z" fill={mainColor} />
        <path d="M12 12L12 16" stroke="white" strokeWidth="0.5" opacity="0.3" />
      </svg>
      {style === 'dragonball-purple' && isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full border-[0.5px] border-orange-600 scale-75" />
        </div>
      )}
    </div>
  );
};

const SnowFlurry: React.FC = () => {
  const snowflakes = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 6 + 4; // Slightly larger
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 10 + 10;
      const animationDelay = Math.random() * -20;
      const opacity = Math.random() * 0.6 + 0.4; // More opaque
      return { id: i, size, left, animationDuration, animationDelay, opacity };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] animate-snowfall"
          style={{
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            left: `${flake.left}%`,
            top: `-10vh`,
            opacity: flake.opacity,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [showSaveUIModal, setShowSaveUIModal] = useState(false);
  const [saveUIName, setSaveUIName] = useState('');
  const [saveUIRemember, setSaveUIRemember] = useState(true);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [showFriendsInfo, setShowFriendsInfo] = useState(false);

  const [activeUI] = useState(() => {
    const saved = localStorage.getItem('bg_active_ui');
    return saved ? JSON.parse(saved) : null;
  });

  const [csvInput, setCsvInput] = useState<string>('');
  const [plugins, setPlugins] = useState<VSTPlugin[]>(() => {
    const saved = localStorage.getItem('bg_library');
    return saved ? JSON.parse(saved) : [];
  });
  const [starredPlugins, setStarredPlugins] = useState<string[]>(() => {
    const saved = localStorage.getItem('bg_starred_plugins');
    return saved ? JSON.parse(saved) : [];
  });
  const [pluginToUnstar, setPluginToUnstar] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'vendor' | 'type'>('type');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderToRemove, setFolderToRemove] = useState<string | null>(null);
  const [deletedPlugins, setDeletedPlugins] = useState<VSTPlugin[]>(() => {
    const saved = localStorage.getItem('bg_deleted_plugins');
    return saved ? JSON.parse(saved) : [];
  });
  const [pendingPlaceholders, setPendingPlaceholders] = useState<any[]>([]);
  const deletionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showTrashModal, setShowTrashModal] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('bg_starred_plugins', JSON.stringify(starredPlugins));
  }, [starredPlugins]);

  useEffect(() => {
    localStorage.setItem('bg_library', JSON.stringify(plugins));
  }, [plugins]);

  useEffect(() => {
    localStorage.setItem('bg_deleted_plugins', JSON.stringify(deletedPlugins));
  }, [deletedPlugins]);

  const resetDeletionTimer = () => {
    if (deletionTimerRef.current) clearTimeout(deletionTimerRef.current);
    deletionTimerRef.current = setTimeout(() => {
      setPendingPlaceholders([]);
    }, 12000);
  };

  const handleUndo = (placeholderId: string) => {
    const placeholder = pendingPlaceholders.find(p => p.id === placeholderId);
    if (!placeholder) return;

    // Remove from deletedPlugins
    setDeletedPlugins(prev => prev.filter(dp => !placeholder.plugins.some((p: any) => p.name === dp.name && p.vendor === dp.vendor)));
    
    // Add back to plugins
    setPlugins(prev => [...prev, ...placeholder.plugins]);
    
    // Remove placeholder
    setPendingPlaceholders(prev => prev.filter(p => p.id !== placeholderId));
  };
  const [recipes, setRecipes] = useState<BeatRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEnrichingLibrary, setIsEnrichingLibrary] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [enrichEta, setEnrichEta] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeBeatSearch, setTypeBeatSearch] = useState<string>('');
  const [songSearch, setSongSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [grillStyle, setGrillStyle] = useState<GrillStyle>(activeUI?.grillStyle || 'iced-out');
  const [knifeStyle, setKnifeStyle] = useState<KnifeStyle>(activeUI?.knifeStyle || 'standard');
  const [duragStyle, setDuragStyle] = useState<DuragStyle>(activeUI?.duragStyle || 'standard');
  const [pendantStyle, setPendantStyle] = useState<PendantStyle>(activeUI?.pendantStyle || 'silver');
  const [chainStyle, setChainStyle] = useState<ChainStyle>(activeUI?.chainStyle || 'silver');
  const [theme, setTheme] = useState<AppTheme>(activeUI?.theme || 'coldest');
  const [saberColor, setSaberColor] = useState<string>(activeUI?.saberColor || '#a855f7'); 
  const [showSaberPicker, setShowSaberPicker] = useState(false);
  const [showChain, setShowChain] = useState(activeUI?.showChain ?? false);
  const [highEyes, setHighEyes] = useState(activeUI?.highEyes ?? false);
  const [isCigarEquipped, setIsCigarEquipped] = useState(activeUI?.isCigarEquipped ?? false);
  const [isTossingCigar, setIsTossingCigar] = useState(false);
  const [showChefHat, setShowChefHat] = useState(activeUI?.showChefHat ?? false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [hasUnlockedChefTheme, setHasUnlockedChefTheme] = useState(() => localStorage.getItem('bg_chef_unlocked') === 'true');
  const [showChefUnlockPopup, setShowChefUnlockPopup] = useState(false);
  const [hasUnlockedBluntToggle, setHasUnlockedBluntToggle] = useState(false);
  const [showAnalogModal, setShowAnalogModal] = useState(false);
  const [analogInstruments, setAnalogInstruments] = useState<Hardware[]>([]);
  const [analogHardware, setAnalogHardware] = useState<Hardware[]>([]);
  const [deletedInstruments, setDeletedInstruments] = useState<Hardware[]>([]);
  const [deletedHardware, setDeletedHardware] = useState<Hardware[]>([]);
  const [starredHardware, setStarredHardware] = useState<string[]>([]);

  useEffect(() => {
    const migrateAndEnrichHardware = async () => {
      const oldInstruments = localStorage.getItem('bg_analog_instruments');
      const oldHardware = localStorage.getItem('bg_analog_hardware');

      if (oldInstruments || oldHardware) {
        const apiKey = localStorage.getItem('bg_gemini_api_key');
        if (!apiKey) return; // Skip if no key yet, will be handled when user adds key

        const instrumentsToMigrate = oldInstruments ? JSON.parse(oldInstruments) : [];
        const hardwareToMigrate = oldHardware ? JSON.parse(oldHardware) : [];

        if (instrumentsToMigrate.length > 0 && typeof instrumentsToMigrate[0] === 'string') {
          try {
            const enrichedInstruments = await enrichHardware(instrumentsToMigrate);
            setAnalogInstruments(enrichedInstruments);
            localStorage.removeItem('bg_analog_instruments');
          } catch (e) {
            console.error("Migration enrichment failed", e);
          }
        }

        if (hardwareToMigrate.length > 0 && typeof hardwareToMigrate[0] === 'string') {
          try {
            const enrichedHardware = await enrichHardware(hardwareToMigrate);
            setAnalogHardware(enrichedHardware);
            localStorage.removeItem('bg_analog_hardware');
          } catch (e) {
            console.error("Migration enrichment failed", e);
          }
        }
      }
    };

    migrateAndEnrichHardware();
  }, []);
  const [excludeAnalog, setExcludeAnalog] = useState(false);
  const [dawType, setDawType] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<SavedRecipe | null>(null);
  const [activeSession, setActiveSession] = useState<SharedSession | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [pendingPluginsInput, setPendingPluginsInput] = useState<string | null>(null);

  const toggleStar = (itemName: string) => {
    if (starredPlugins.includes(itemName)) {
      setPluginToUnstar(itemName);
    } else if (starredHardware.includes(itemName)) {
      setStarredHardware(prev => prev.filter(n => n !== itemName));
    } else {
      if (plugins.some(p => p.name === itemName)) {
        if (starredPlugins.length < 10) {
          setStarredPlugins([...starredPlugins, itemName]);
        } else {
          setError("You can only star up to 10 plugins.");
          setTimeout(() => setError(null), 3000);
        }
      } else {
        if (starredHardware.length < 10) {
          setStarredHardware([...starredHardware, itemName]);
        } else {
          setError("You can only star up to 10 hardware items.");
          setTimeout(() => setError(null), 3000);
        }
      }
    }
  };



  const confirmUnstar = () => {
    if (pluginToUnstar) {
      setStarredPlugins(starredPlugins.filter(p => p !== pluginToUnstar));
      setPluginToUnstar(null);
    }
  };

  const currentAppName = highEyes ? "BeatRetard" : "BeatGangsta";
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(() => localStorage.getItem('bg_hustle_unlocked') === 'true');
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [vault, setVault] = useState<SavedRecipe[]>(() => {
    const saved = localStorage.getItem('bg_vault');
    return saved ? JSON.parse(saved) : [];
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('bg_folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [presets, setPresets] = useState<UIPreset[]>(() => {
    const saved = localStorage.getItem('bg_presets');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('bg_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (grillStyle === 'gold' && knifeStyle === 'gold' && !isSecretUnlocked) {
      setIsSecretUnlocked(true);
      setShowUnlockPopup(true);
      setTheme('hustle-time');
      localStorage.setItem('bg_hustle_unlocked', 'true');
    }
  }, [grillStyle, knifeStyle, isSecretUnlocked]);

  const canSeeChefHatToggle = isSecretUnlocked && knifeStyle === 'steak-knife' && !hasUnlockedChefTheme;

  const handleGetChefHat = () => {
    setShowChefHat(true);
    setShowSparkles(true);
    setHasUnlockedChefTheme(true);
    setShowChefUnlockPopup(true);
    localStorage.setItem('bg_chef_unlocked', 'true');
    
    setTimeout(() => {
      setShowSparkles(false);
    }, 4000);
  };

  useEffect(() => {
    document.title = `${currentAppName} ColdestConcept Edition`;
  }, [currentAppName]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bg_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bg_user');
    }
    localStorage.setItem('bg_vault', JSON.stringify(vault));
    localStorage.setItem('bg_folders', JSON.stringify(folders));
    localStorage.setItem('bg_history', JSON.stringify(history));
    localStorage.setItem('bg_presets', JSON.stringify(presets));
  }, [user, vault, folders, history, presets]);

  const handleSignUpClick = () => {
    if (user) return;
    setShowSignUpModal(true);
  };

  const handleSignIn = () => {
    if (!tempUsername.trim()) return;
    const newUser = {
      name: tempUsername.trim(),
      email: `${tempUsername.toLowerCase()}@coldestconcept.com`,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tempUsername}`
    };
    setUser(newUser);
    setShowSignUpModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const saveToVault = async (recipe: BeatRecipe) => {
    if (vault.some(r => r.title === recipe.title)) return;
    
    // Automatically capture current UI state as a preset for this favorited recipe
    const autoPresetId = Math.random().toString(36).substr(2, 9);
    const autoPreset: UIPreset = {
      id: autoPresetId,
      name: `${recipe.title} Studio Look`,
      theme,
      grillStyle,
      knifeStyle,
      duragStyle,
      pendantStyle,
      chainStyle,
      saberColor,
      showChain,
      highEyes,
      isCigarEquipped,
      showChefHat,
      bubbleColor: theme === 'chef-mode' ? '#fbbf24' : '#0ea5e9',
      createdAt: new Date().toISOString(),
    };
    setPresets(prev => [...prev, autoPreset]);

    const newId = Math.random().toString(36).substr(2, 9);
    const newSaved: SavedRecipe = {
      ...recipe,
      id: newId,
      savedAt: new Date().toISOString(),
      bubbleColor: '#0ea5e9',
      linkedPresetId: autoPresetId // Link the auto-captured UI to this recipe
    };
    
    setVault(prev => [...prev, newSaved]);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 2000);

    try {
      const parameters = await getDetailedParameters(recipe);
      setVault(prev => prev.map(r => r.id === newId ? { ...r, parameters } : r));
      setViewingRecipe(prev => prev?.id === newId ? { ...prev, parameters } : prev);
    } catch (e) {
      console.warn("Failed to fetch parameters", e);
    }
  };

  const handleDeleteAllData = () => {
    const confirmed = window.confirm("CRITICAL: This will permanently delete your profile, all saved presets, your entire vault, and all unlocked secret themes. You will start back at zero. Proceed?");
    
    if (confirmed) {
      // Clear all state to prevent any last-second syncs to localStorage
      setUser(null);
      setVault([]);
      setPresets([]);
      setFolders([]);
      setHistory([]);
      setIsSecretUnlocked(false);
      setHasUnlockedChefTheme(false);
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force a hard reload to the root origin
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const handleConfirmSaveUI = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newPreset: UIPreset = {
      id: newId,
      name: saveUIName || `Preset ${presets.length + 1}`,
      theme,
      grillStyle,
      knifeStyle,
      duragStyle,
      pendantStyle,
      chainStyle,
      saberColor,
      showChain,
      highEyes,
      isCigarEquipped,
      showChefHat,
      bubbleColor: theme === 'chef-mode' ? '#fbbf24' : '#0ea5e9',
      createdAt: new Date().toISOString(),
    };
    setPresets(prev => [...prev, newPreset]);

    if (saveUIRemember) {
      const activeUI = {
        theme, grillStyle, knifeStyle, duragStyle, pendantStyle, chainStyle,
        saberColor, showChain, highEyes, isCigarEquipped, showChefHat
      };
      localStorage.setItem('bg_active_ui', JSON.stringify(activeUI));
    }

    setShowSaveUIModal(false);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 2000);
  };

  const saveUIPreset = () => {
    setSaveUIName(`Preset ${presets.length + 1}`);
    setShowSaveUIModal(true);
  };

  const applyPreset = (preset: UIPreset) => {
    setTheme(preset.theme);
    setGrillStyle(preset.grillStyle as any);
    setKnifeStyle(preset.knifeStyle as any);
    setDuragStyle(preset.duragStyle as any);
    setPendantStyle(preset.pendantStyle as any);
    setChainStyle(preset.chainStyle as any);
    setSaberColor(preset.saberColor);
    setShowChain(preset.showChain);
    setHighEyes(preset.highEyes);
    setIsCigarEquipped(preset.isCigarEquipped);
    setShowChefHat(preset.showChefHat);
  };

  const handleShareSession = (session: SharedSession) => {
    const encoded = btoa(JSON.stringify(session));
    navigator.clipboard.writeText(encoded);
    alert("Sync Code copied! Share this with another producer.");
  };

  const handleExportRigFile = (targetRecipe?: SavedRecipe) => {
    const recipeToExport = targetRecipe || vault[0];
    if (!recipeToExport) {
        alert("You need at least one saved recipe in your vault to export a complete rig file.");
        return;
    }

    const currentPreset = presets.find(p => p.id === recipeToExport.linkedPresetId) || presets[0] || {
        id: 'default',
        name: 'Default',
        theme,
        grillStyle,
        knifeStyle,
        duragStyle,
        pendantStyle,
        chainStyle,
        saberColor,
        showChain,
        highEyes,
        isCigarEquipped,
        showChefHat,
        bubbleColor: '#0ea5e9',
        createdAt: new Date().toISOString()
    };

    const session: SharedSession = {
      recipe: recipeToExport,
      senderPlugins: plugins,
      preset: currentPreset,
      senderName: user?.name || "BeatGangsta Producer"
    };

    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name || 'Producer'}_BeatGangsta_Rig_${recipeToExport.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportRig = (session: SharedSession) => {
    setActiveSession(session);
    setShowVault(false);
  };

  const adoptSharedUI = () => {
    if (!activeSession) return;
    applyPreset(activeSession.preset);
    setActiveSession(null);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 2000);
  };

  const removeFromVault = (id: string) => {
    setVault(vault.filter(r => r.id !== id));
  };

  const updateVaultColor = (id: string, color: string) => {
    setVault(vault.map(r => r.id === id ? { ...r, bubbleColor: color } : r));
  };

  const updateVaultFolder = (id: string, folderId: string) => {
    setVault(vault.map(r => r.id === id ? { ...r, folderId: folderId || undefined } : r));
  };

  const updateRecipeLinkedPreset = (recipeId: string, presetId: string) => {
    setVault(vault.map(r => r.id === recipeId ? { ...r, linkedPresetId: presetId || undefined } : r));
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = { 
      id: Math.random().toString(36).substr(2, 9), 
      name,
      color: '#0ea5e9'
    };
    setFolders([...folders, newFolder]);
  };

  const removeFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setVault(vault.map(r => r.folderId === id ? { ...r, folderId: undefined } : r));
  };

  const updateFolderColor = (id: string, color: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, color } : f));
  };

  const removePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
    setVault(vault.map(r => r.linkedPresetId === id ? { ...r, linkedPresetId: undefined } : r));
  };

  const updatePresetColor = (id: string, color: string) => {
    setPresets(presets.map(p => p.id === id ? { ...p, bubbleColor: color } : p));
  };

  const cycleGrill = () => {
    const styles: GrillStyle[] = ['iced-out', 'aquabberry-diamond', 'gold', 'opal'];
    const currentIdx = styles.indexOf(grillStyle);
    const nextIdx = (currentIdx + 1) % styles.length;
    const nextGrill = styles[nextIdx];
    setGrillStyle(nextGrill);
    
    // Reset special rags when switching grills
    if (nextGrill !== 'aquabberry-diamond' && duragStyle === 'royal-green') {
      setDuragStyle('standard');
    }
    if (nextGrill !== 'opal' && duragStyle === 'dragonball-purple') {
      setDuragStyle('standard');
    }
  };

  const cycleKnife = () => {
    const styles: KnifeStyle[] = ['standard', 'gold', 'bloody', 'adamant', 'mythril', 'samuels-saber', 'steak-knife'];
    const currentIdx = styles.indexOf(knifeStyle);
    const nextIdx = (currentIdx + 1) % styles.length;
    setKnifeStyle(styles[nextIdx]);
  };

  const filteredPlugins = useMemo(() => {
    let filtered = plugins.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedFolder) {
      filtered = filtered.filter(p => 
        sortBy === 'vendor' ? p.vendor === selectedFolder : p.type === selectedFolder
      );
    }

    filtered.sort((a, b) => {
      const aFav = starredPlugins.includes(a.name);
      const bFav = starredPlugins.includes(b.name);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      if (sortBy === 'vendor') {
        return a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name);
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [plugins, searchTerm, sortBy, starredPlugins, selectedFolder]);

  const groupedPlugins = useMemo(() => {
    if (sortBy === 'name') return null;
    
    let filtered = plugins.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: Record<string, VSTPlugin[]> = {};
    filtered.forEach(p => {
      const key = sortBy === 'vendor' ? p.vendor : p.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    // Sort groups by key
    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)));
  }, [plugins, searchTerm, sortBy]);

  const parsePlugins = async (input: string) => {
    if (!input.trim()) return;

    // Check for API Key before proceeding
    const apiKey = localStorage.getItem('bg_gemini_api_key');
    if (!apiKey) {
      setPendingPluginsInput(input);
      setShowAPIKeyModal(true);
      return;
    }

    const lines = input.trim().split('\n');
    const isReaperIni = lines.some(l => l.includes('=') && (l.includes('.dll') || l.includes('.vst3')));
    let parsed: VSTPlugin[] = [];

    if (isReaperIni) {
      parsed = lines.map(line => {
        if (!line.includes('=')) return null;
        const [filename, rest] = line.split('=');
        if (!rest) return null;
        const parts = rest.split(',');
        const displayName = parts[2] || filename;
        const vendorMatch = displayName.match(/\(([^)]+)\)/);
        const vendor = vendorMatch ? vendorMatch[1] : 'Unknown';
        const name = displayName.split('(')[0].trim();
        return {
          vendor,
          name,
          type: filename.toLowerCase().includes('vst3') ? 'VST3' : 'VST2',
          version: 'N/A',
          lastModified: 'Found in INI',
        };
      }).filter((p): p is VSTPlugin => p !== null && p.name !== '');
    } else {
      const startIndex = lines[0] && lines[0].toLowerCase().includes('vendor') ? 1 : 0;
      parsed = lines.slice(startIndex).map(line => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const rawName = parts[1]?.replace(/"/g, '').trim() || 'Unknown';
        const rawVendor = parts[0]?.replace(/"/g, '').trim() || 'Unknown';
        return {
          vendor: rawVendor,
          name: rawName,
          type: parts[2]?.replace(/"/g, '').trim() || 'Unknown',
          version: parts[3]?.replace(/"/g, '').trim() || 'Unknown',
          lastModified: parts[4]?.replace(/"/g, '').trim() || 'Unknown',
        };
      }).filter(p => p.name !== 'Unknown');
    }

    if (parsed.length === 0) {
      setError("I couldn't find any plugins. Make sure you copied the list or uploaded the right file!");
      return;
    }

    setError(null);
    setIsEnrichingLibrary(true);
    setEnrichProgress(0);
    setEnrichEta(0);

    try {
      const enriched = await enrichPluginLibrary(parsed, (progress, eta) => {
        setEnrichProgress(progress);
        setEnrichEta(eta);
      });
      setPlugins(enriched);
      setShowAnalogModal(true); // Only show the next screen if enrichment succeeds
    } catch (err: any) {
      console.error("Failed to enrich library:", err);
      
      let detailedError = "Failed to research your plugins. ";
      if (err.message === "QUOTA_EXCEEDED") {
        detailedError = "AI Research Quota Exceeded. Your free Gemini API key has a limit on how many requests it can make per minute. You can wait a few minutes and try again, or use 'Fast Import' to skip the research phase.";
      } else {
        detailedError += err.message || "An unexpected error occurred during the research process.";
      }
      
      setError(detailedError);
      // We don't clear plugins here anymore, so the user can still use 'Fast Import'
    } finally {
      setIsEnrichingLibrary(false);
      setPendingPluginsInput(null);
    }
  };

  const handleAPIKeySave = (key: string) => {
    setShowAPIKeyModal(false);
    if (pendingPluginsInput) {
      parsePlugins(pendingPluginsInput);
    }
  };

  const processFile = async (file: File) => {
    const fileName = file.name.toLowerCase();
    if (fileName.includes('reaper')) {
      setDawType('Reaper');
    } else if (fileName.includes('studio one') || fileName.includes('studioone')) {
      setDawType('Studio One');
    } else {
      setDawType(null);
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvInput(content);
        await parsePlugins(content);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleGenerate = async () => {
    if (plugins.length === 0) return;

    const apiKey = localStorage.getItem('bg_gemini_api_key');
    if (!apiKey) {
      setShowAPIKeyModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Safety timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("The architect is taking too long. Please try again!");
    }, 45000);

    try {
      const response = await getBeatRecommendations(plugins, analogInstruments, analogHardware, excludeAnalog, dawType, starredPlugins);
      clearTimeout(timeoutId);
      setRecipes(response.recipes);
      const newHistory: HistoryItem[] = response.recipes.map(r => ({
        ...r,
        generatedAt: new Date().toISOString()
      }));
      setHistory(prev => [...newHistory, ...prev].slice(0, 50));
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.message === "API_KEY_MISSING") {
        setShowAPIKeyModal(true);
      } else {
        setError("Couldn't think of any beats right now. Try again in a second!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTypeBeatSearch = async () => {
    if (plugins.length === 0 || !typeBeatSearch.trim()) return;

    const apiKey = localStorage.getItem('bg_gemini_api_key');
    if (!apiKey) {
      setShowAPIKeyModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Search timed out. Try a different vibe!");
    }, 45000);

    try {
      const response = await getCustomBeatRecommendations(plugins, typeBeatSearch.trim(), analogInstruments, analogHardware, excludeAnalog, dawType, starredPlugins);
      clearTimeout(timeoutId);
      setRecipes(response.recipes);
      const newHistory: HistoryItem[] = response.recipes.map(r => ({
        ...r,
        generatedAt: new Date().toISOString()
      }));
      setHistory(prev => [...newHistory, ...prev].slice(0, 50));
      setTypeBeatSearch('');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.message === "API_KEY_MISSING") {
        setShowAPIKeyModal(true);
      } else {
        setError("Couldn't find any recipes for that vibe. Try a different search!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSongSearch = async () => {
    if (plugins.length === 0 || !songSearch.trim()) return;

    const apiKey = localStorage.getItem('bg_gemini_api_key');
    if (!apiKey) {
      setShowAPIKeyModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Song search timed out. Try a different track!");
    }, 45000);

    try {
      const response = await getSongBeatRecommendations(plugins, songSearch.trim(), analogInstruments, analogHardware, excludeAnalog, dawType, starredPlugins);
      clearTimeout(timeoutId);
      setRecipes(response.recipes);
      const newHistory: HistoryItem[] = response.recipes.map(r => ({
        ...r,
        generatedAt: new Date().toISOString()
      }));
      setHistory(prev => [...newHistory, ...prev].slice(0, 50));
      setSongSearch('');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.message === "API_KEY_MISSING") {
        setShowAPIKeyModal(true);
      } else {
        setError("Couldn't find any recipes for that song. Try a different track!");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'coldest') return 'crazy-bird';
      if (prev === 'crazy-bird') {
        if (isSecretUnlocked) return 'hustle-time';
        if (hasUnlockedChefTheme) return 'chef-mode';
        return 'coldest';
      }
      if (prev === 'hustle-time') {
        if (hasUnlockedChefTheme) return 'chef-mode';
        return 'coldest';
      }
      if (prev === 'chef-mode') return 'coldest';
      return 'coldest';
    });
  };

  const toggleHighEyes = () => {
    const nextHigh = !highEyes;
    setHighEyes(nextHigh);
    if (nextHigh) {
      setIsCigarEquipped(true);
      setIsTossingCigar(false);
      setHasUnlockedBluntToggle(true);
    }
  };

  const handleCigarToggle = () => {
    if (isCigarEquipped) {
      setIsTossingCigar(true);
      setTimeout(() => {
        setIsCigarEquipped(false);
        setIsTossingCigar(false);
      }, 1000);
    } else {
      setIsCigarEquipped(true);
      setIsTossingCigar(false);
    }
  };

  const cyclePendantMaterial = () => {
    const materials: PendantStyle[] = ['silver', 'gold', 'rose-gold'];
    const currentIdx = materials.indexOf(pendantStyle);
    const nextIdx = (currentIdx + 1) % materials.length;
    setPendantStyle(materials[nextIdx]);
    setChainStyle(materials[nextIdx] as any);
  };

  const grillLabel = grillStyle === 'iced-out' ? 'Iced Out' : grillStyle === 'aquabberry-diamond' ? 'Aquabberry' : grillStyle === 'gold' ? 'Gold' : 'Opal';
  const knifeLabel = { 
    standard: 'Standard', gold: 'Gold', bloody: 'Bloody', adamant: 'Adamant', mythril: 'Mythril', 'samuels-saber': "Samuel L's Saber", 'steak-knife': 'Steak Knife'
  }[knifeStyle];

  const themeClasses = theme === 'coldest' 
    ? "bg-sky-400 text-sky-900"
    : theme === 'crazy-bird'
    ? "bg-red-500 text-red-50"
    : theme === 'chef-mode'
    ? "bg-yellow-400 text-orange-900"
    : "bg-emerald-500 text-emerald-50";

  const actionBtnClasses = `text-[9px] px-3 py-1.5 rounded-full font-black uppercase border transition-all truncate whitespace-nowrap flex items-center gap-1.5 hover:scale-105 active:scale-95`;
  const mobileToolbarBtnClasses = `flex flex-col items-center justify-center gap-1 p-2 flex-1 transition-all active:scale-90`;
  const mobileTrayBtnClasses = `flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 whitespace-nowrap`;
  
  const mainBlurClass = 'backdrop-blur-2xl';

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-all duration-700 flex flex-col ${themeClasses} font-sans selection:bg-sky-200 pb-20 sm:pb-0`}>
      {theme === 'coldest' && <SnowFlurry />}
      <div className={`h-8 flex items-center justify-between px-3 text-[11px] font-bold select-none backdrop-blur-md border-b transition-all duration-500 z-[100] ${theme === 'coldest' ? 'bg-white/30 text-[#0c4a6e] border-white/20' : 'bg-black/40 text-red-100 border-red-900/30'}`}>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => {
              setRecipes([]);
              setCsvInput('');
              setError(null);
            }}
            className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 transition-all opacity-70 hover:opacity-100"
            title="Go Home"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button 
            onClick={() => setShowBrandMenu(!showBrandMenu)}
            className="flex items-center gap-2 hover:opacity-70 transition-all group"
          >
            <span className="tracking-wide uppercase whitespace-nowrap">{currentAppName} x ColdestConcept</span>
            <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${showBrandMenu ? 'rotate-180' : ''} opacity-30 group-hover:opacity-100`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showBrandMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBrandMenu(false)} />
              <div className={`absolute top-full left-0 mt-1 w-64 p-2 rounded-2xl border shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200 ${theme === 'coldest' ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111] border-white/10 text-white'}`}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTrashModal(true);
                    setShowBrandMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group ${theme === 'coldest' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${theme === 'coldest' ? 'bg-slate-100 group-hover:bg-slate-200' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Show Deleted Items</div>
                    <div className="text-[9px] opacity-50 mt-0.5">Restore plugins and hardware</div>
                  </div>
                </button>
                <div className={`h-px w-full my-1 ${theme === 'coldest' ? 'bg-slate-100' : 'bg-white/10'}`} />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlugins([]);
                    setCsvInput('');
                    setError(null);
                    setShowBrandMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group ${theme === 'coldest' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${theme === 'coldest' ? 'bg-slate-100 group-hover:bg-slate-200' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Update Plugin List</div>
                    <div className="text-[9px] opacity-50 mt-0.5">Upload a new plugin file</div>
                  </div>
                </button>
                <div className={`h-px w-full my-1 ${theme === 'coldest' ? 'bg-slate-100' : 'bg-white/10'}`} />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAllData();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group ${theme === 'coldest' ? 'hover:bg-slate-100 text-black' : 'hover:bg-white/10 text-white'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${theme === 'coldest' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider">Delete Browser Data</span>
                    <span className="text-[8px] font-bold opacity-50">Removes plugins, instruments, presets & recipes</span>
                  </div>
                </button>
                
                <div className="h-[1px] bg-current opacity-5 my-1" />
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFriendsInfo(true);
                    setShowBrandMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider">ColdestConcept x Friends</span>
                    <span className="text-[8px] font-bold opacity-50">The Collective & Credits</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <button onClick={handleSignUpClick} className="hover:opacity-70 transition-all uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 bg-orange-500 text-white px-4 py-1 rounded-full shadow-lg">Sign Up</button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <img src={user.photo} alt={user.name} className="w-4 h-4 rounded-full border border-white/40" />
                <span className="opacity-90 truncate max-w-[80px] sm:max-w-[120px]">{user.name}</span>
              </div>
              <button onClick={handleSignOut} className="opacity-60 hover:opacity-100 text-[9px] uppercase font-black">Out</button>
            </div>
          )}
        </div>
      </div>

      {/* Top Promotional Banner */}
      <a 
        href="https://www.youtube.com/channel/UC8gMzSxHRWzMzfIjdcqKvQw" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`w-full h-8 flex items-center justify-center bg-black/10 backdrop-blur-md border-b border-white/5 hover:bg-black/20 transition-colors z-[60] text-current text-[10px] font-black uppercase tracking-[0.4em] select-none overflow-hidden relative group`}
      >
        <span className="relative z-10">Best Beats in the Universe</span>
        <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </a>

      {theme === 'crazy-bird' && <AvianField />}
      {(theme as string) === 'hustle-time' && <LeprechaunField />}
      {theme === 'chef-mode' && <FoodField />}
      {showGuide && <DAWGuide theme={theme} onClose={() => setShowGuide(false)} />}
      
      {showVault && (
        <Vault 
          theme={theme === 'chef-mode' ? 'coldest' : theme} 
          recipes={vault} 
          folders={folders}
          presets={presets}
          onClose={() => setShowVault(false)} 
          onRemove={removeFromVault} 
          onUpdateColor={updateVaultColor}
          onUpdateFolder={updateVaultFolder}
          onUpdateLinkedPreset={updateRecipeLinkedPreset}
          onAddFolder={addFolder}
          onRemoveFolder={removeFolder}
          onUpdateFolderColor={updateFolderColor}
          onRemovePreset={removePreset}
          onUpdatePresetColor={updatePresetColor}
          onShare={handleShareSession}
          onExportRig={handleExportRigFile}
          onImportRig={handleImportRig}
          allPlugins={plugins}
          userName={user?.name || "BeatGangsta Producer"}
          onOpen={async (r) => {
            if (r.linkedPresetId) {
              const linked = presets.find(p => p.id === r.linkedPresetId);
              if (linked) applyPreset(linked);
            }

            // If parameters are missing, fetch them now.
            if (!r.parameters) {
              setViewingRecipe(r); // Show modal with loading state immediately
              try {
                const parameters = await getDetailedParameters(r);
                // Update the recipe in the main vault state
                setVault(prev => prev.map(recipe => recipe.id === r.id ? { ...recipe, parameters } : recipe));
                // Update the recipe currently being viewed to re-render the modal
                setViewingRecipe(prev => prev && prev.id === r.id ? { ...prev, parameters } : prev);
              } catch (e) {
                console.warn("Failed to fetch parameters on open", e);
                // TODO: Optionally show an error to the user in the modal
              }
            } else {
              // Parameters already exist, just show the recipe
              setViewingRecipe(r);
            }
          }}
        />
      )}

      {viewingRecipe && (
        <RecipeViewerModal 
          recipe={vault.find(r => r.id === viewingRecipe.id) || viewingRecipe} 
          onClose={() => setViewingRecipe(null)}
          presets={presets}
          onLinkPreset={(pid) => updateRecipeLinkedPreset(viewingRecipe.id, pid)}
        />
      )}

      <APIKeyModal 
        isOpen={showAPIKeyModal}
        onClose={() => {
          setShowAPIKeyModal(false);
          setPendingPluginsInput(null);
        }}
        onSave={handleAPIKeySave}
        theme={theme}
      />

      {activeSession && (
        <CollaborationModal 
          session={activeSession} 
          myPlugins={plugins} 
          onClose={() => setActiveSession(null)} 
          onAdoptUI={adoptSharedUI}
        />
      )}

      {showSaveUIModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
          <div className={`w-full max-w-md p-8 sm:p-10 rounded-[3rem] border shadow-2xl ${theme === 'coldest' ? 'bg-white border-slate-200' : 'bg-[#0a0a0a] text-white border-white/10'}`}>
             <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Logo size={80} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={showChefHat} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">Save Studio Look</h2>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mt-1">Archive your current drip</p>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Look Name</label>
                  <input 
                    type="text" 
                    value={saveUIName} 
                    onChange={(e) => setSaveUIName(e.target.value)}
                    className={`w-full rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 outline-none transition-all ${theme === 'coldest' ? 'bg-slate-100 focus:ring-sky-500/20' : 'bg-white/5 focus:ring-white/10'}`}
                    placeholder="Name your look..."
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 border border-white/5">
                  <input 
                    type="checkbox" 
                    id="remember-ui"
                    checked={saveUIRemember}
                    onChange={(e) => setSaveUIRemember(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-0"
                  />
                  <label htmlFor="remember-ui" className="text-[11px] font-bold cursor-pointer select-none">
                    Make this my default look (Remember on load)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowSaveUIModal(false)}
                    className={`flex-1 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${theme === 'coldest' ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/60'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmSaveUI}
                    className="flex-1 bg-sky-500 text-white font-black py-4 rounded-full shadow-lg active:scale-95 transition-all uppercase text-[10px] tracking-widest"
                  >
                    Save Look
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showUnlockPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
           <div className="text-center p-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[5rem] shadow-[0_0_100px_rgba(234,179,8,0.5)] border-4 border-white/20">
              <div className="mb-8 flex justify-center scale-150"><LeprechaunField /></div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase italic">Secret Theme Unlocked!</h2>
              <p className="text-2xl font-bold text-yellow-100 mb-10 tracking-tight">Hustle Time has begun.</p>
              <button 
                onClick={() => setShowUnlockPopup(false)}
                className="bg-white text-yellow-600 font-black px-12 py-5 rounded-full shadow-2xl uppercase tracking-[0.4em] text-sm hover:scale-105 transition-all active:scale-95"
              >
                Let's Get The Gold
              </button>
           </div>
        </div>
      )}

      {showChefUnlockPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in zoom-in duration-700">
           <div className="text-center p-8 sm:p-10 bg-white rounded-[3rem] border-4 border-red-500 shadow-2xl max-w-lg w-full">
              <div className="mb-6 flex justify-center">
                <Logo size={80} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={true} showSparkles={true} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-red-600 tracking-tighter mb-3 uppercase italic">Chef Theme Unlocked!</h2>
              <p className="text-base sm:text-lg font-bold text-slate-800 mb-8 tracking-tight">Master of the kitchen! You can now cycle to the Chef theme.</p>
              <button 
                onClick={() => {
                  setShowChefUnlockPopup(false);
                  setTheme('chef-mode');
                }}
                className="bg-red-600 text-white font-black px-10 py-4 rounded-full shadow-lg uppercase tracking-[0.2em] text-[10px] sm:text-xs hover:scale-105 transition-all active:scale-95"
              >
                Start Cooking
              </button>
           </div>
        </div>
      )}

      <AnimatePresence>
        {showFriendsInfo && (
          <FriendsInfoModal 
            theme={theme} 
            onClose={() => setShowFriendsInfo(false)} 
          />
        )}
      </AnimatePresence>

      {showSaberPicker && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
           <div className="bg-[#111] border-2 border-yellow-500/30 p-10 rounded-[4rem] text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 italic">Forge Your Blade</h2>
              <div className="flex flex-col items-center gap-8">
                 <input 
                   type="color" 
                   value={saberColor} 
                   onChange={(e) => setSaberColor(e.target.value)}
                   className="w-32 h-32 rounded-full border-4 border-white/10 cursor-pointer bg-transparent"
                 />
                 <button 
                   onClick={() => setShowSaberPicker(false)}
                   className="bg-yellow-500 text-black font-black px-8 py-3 rounded-full uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
                 >
                   Ignite Blade
                 </button>
              </div>
           </div>
        </div>
      )}

      {showSignUpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[3rem] border shadow-2xl ${theme === 'coldest' ? 'bg-white' : 'bg-[#111] text-white border-red-900/40'}`}>
             <div className="text-center mb-8">
                <Logo size={80} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={showChefHat} onClick={cycleGrill} />
                <h2 className="text-3xl font-black tracking-tighter mt-4">Join the Club</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Make a profile to save beats</p>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Choose a name</label>
                  <input 
                    type="text" 
                    value={tempUsername} 
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-full bg-black/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                    placeholder="Producer name..."
                  />
                </div>
                <button 
                  onClick={handleSignIn}
                  className="w-full bg-orange-500 text-white font-black py-4 rounded-full shadow-lg shadow-orange-900/20 active:scale-95 transition-all uppercase text-xs tracking-widest"
                >
                  Join Now
                </button>
             </div>
          </div>
        </div>
      )}

      <header className={`sticky top-16 z-50 px-6 py-4 border-b transition-all duration-500 ${mainBlurClass} shadow-lg ${theme === 'coldest' ? 'bg-white/20 border-white/30' : theme === 'crazy-bird' ? 'bg-black/30 border-red-900/40' : theme === 'chef-mode' ? 'bg-white/40 border-white/30' : 'bg-black/30 border-yellow-900/40'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size={42} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={showChefHat} showSparkles={showSparkles} onClick={cycleGrill} />
            <div className="flex flex-col">
              <h1 className={`text-xl font-black tracking-tighter leading-none select-none ${theme === 'coldest' ? 'text-[#0c4a6e]' : theme === 'chef-mode' ? 'text-orange-950' : 'text-white'}`}>{currentAppName}</h1>
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] select-none ${theme === 'coldest' ? 'text-sky-700' : (theme as string) === 'hustle-time' ? 'text-yellow-500' : theme === 'chef-mode' ? 'text-orange-600' : 'text-red-500'}`}>
                ColdestConcept
              </span>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-wrap items-center justify-end gap-2">
            <button onClick={cycleGrill} className={`${actionBtnClasses} ${theme === 'coldest' ? 'bg-white/20 border-slate-200 text-slate-800' : theme === 'chef-mode' ? 'bg-white/5 border-orange-200 text-orange-950 shadow-none' : 'bg-black/40 border-white/10 text-white'}`}>
              <span className="text-sm">💎</span> {grillLabel}
            </button>
            
            {isSecretUnlocked && grillStyle === 'aquabberry-diamond' && (
              <button 
                onClick={() => setDuragStyle(prev => prev === 'standard' ? 'royal-green' : 'standard')} 
                className={`${actionBtnClasses} ${duragStyle === 'royal-green' ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg' : 'bg-black/20 border-white/5 text-slate-400'}`}
              >
                <RagIcon style="royal-green" isActive={duragStyle === 'royal-green'} /> {duragStyle === 'royal-green' ? 'Royal Rag' : 'Standard Rag'}
              </button>
            )}

            {isSecretUnlocked && grillStyle === 'opal' && (
              <button 
                onClick={() => setDuragStyle(prev => prev === 'standard' ? 'dragonball-purple' : 'standard')} 
                className={`${actionBtnClasses} ${duragStyle === 'dragonball-purple' ? 'bg-purple-600 text-white border-purple-400 shadow-lg' : 'bg-black/20 border-white/5 text-slate-400'}`}
              >
                <RagIcon style="dragonball-purple" isActive={duragStyle === 'dragonball-purple'} /> {duragStyle === 'dragonball-purple' ? 'Dragonball Rag' : 'Standard Rag'}
              </button>
            )}

            <button onClick={cycleKnife} className={`${actionBtnClasses} ${theme === 'coldest' ? 'bg-white/20 border-slate-200 text-slate-800' : theme === 'chef-mode' ? 'bg-white/5 border-orange-200 text-orange-950 shadow-none' : 'bg-black/40 border-white/10 text-white'}`}>
              <span className="text-sm">🔪</span> {knifeLabel}
            </button>

            <div className="flex items-center gap-2 p-1 rounded-full bg-black/5 border border-white/5">
                {isSecretUnlocked && knifeStyle === 'samuels-saber' && (
                  <button onClick={() => setShowSaberPicker(true)} className={`${actionBtnClasses} bg-yellow-500 text-black border-yellow-400`}>
                    <span className="text-sm">🎨</span> Forge Saber
                  </button>
                )}

                {isSecretUnlocked && canSeeChefHatToggle && (
                  <button onClick={handleGetChefHat} className={`${actionBtnClasses} bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-bounce`}>
                    <span className="text-sm">👨‍🍳</span> Get Chef Hat
                  </button>
                )}

                {isSecretUnlocked && hasUnlockedChefTheme && theme === 'chef-mode' && (
                  <button onClick={() => setShowChefHat(!showChefHat)} className={`${actionBtnClasses} ${showChefHat ? 'bg-white/30 text-black border-slate-300 shadow-lg' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                    <span className="text-sm">👨‍🍳</span> {showChefHat ? 'Hat On' : 'Hat Off'}
                  </button>
                )}

                {isSecretUnlocked && theme === 'crazy-bird' && (
                  <>
                    <button onClick={toggleHighEyes} className={`${actionBtnClasses} ${highEyes ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                      <span className="text-sm">👁️</span> {highEyes ? 'Sober Up' : 'Get High'}
                    </button>
                    {isSecretUnlocked && (hasUnlockedBluntToggle || theme === 'crazy-bird') && (
                      <button onClick={handleCigarToggle} className={`${actionBtnClasses} ${isCigarEquipped ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.3)]' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                        <span className="text-sm">🚬</span> {isCigarEquipped ? 'Toss Blunt' : 'Got Blunt?'}
                      </button>
                    )}
                  </>
                )}

                {isSecretUnlocked && ((theme as string) === 'hustle-time' || (isSecretUnlocked && (theme as string) === 'hustle-time')) && (
                  <>
                    <button onClick={() => setShowChain(!showChain)} className={`${actionBtnClasses} ${showChain ? 'bg-sky-500 text-white border-sky-400' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                      <span className="text-sm">💎</span> {showChain ? 'Bling On' : 'No Chain'}
                    </button>
                    {showChain && (
                      <button onClick={cyclePendantMaterial} className={`${actionBtnClasses} bg-yellow-600 border-yellow-400 text-white`}>
                        <span className="text-sm">⛓️</span> {pendantStyle}
                      </button>
                    )}
                  </>
                )}
            </div>

            <div className="w-[1px] h-6 bg-current opacity-10 mx-1" />

            <button onClick={toggleTheme} className={`${actionBtnClasses} ${theme === 'coldest' ? 'bg-white/60 border-sky-200 text-[#0c4a6e]' : theme === 'chef-mode' ? 'bg-white/10 text-orange-950 border-orange-500 shadow-none' : theme === 'crazy-bird' ? 'bg-red-600 border-red-500 text-white hover:bg-red-500' : 'bg-yellow-600 border-yellow-500 text-white'}`}>
              {theme === 'coldest' ? 'Coldest' : theme === 'chef-mode' ? 'Chef Mode' : theme === 'crazy-bird' ? 'Crazy Bird' : 'Hustle Mode'}
            </button>
            
            <button onClick={() => setShowVault(true)} className={`${actionBtnClasses} relative ${theme === 'coldest' || theme === 'chef-mode' ? 'bg-sky-500 border-sky-600 text-white' : 'bg-black border-white/10 text-white hover:bg-white/10'}`}>
              Vault
              {(vault.length > 0 || presets.length > 0) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-white text-orange-500 rounded-full flex items-center justify-center text-[7px] font-black shadow-sm">{vault.length + presets.length}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[100] flex flex-col">
        {isSecretUnlocked && (
          <div className={`px-4 py-3 flex gap-4 overflow-x-auto no-scrollbar items-center border-t ${mainBlurClass} animate-in slide-in-from-bottom-full duration-500 ${theme === 'coldest' ? 'bg-white/60 border-slate-200' : theme === 'chef-mode' ? 'bg-white/40 border-orange-200' : 'bg-black/80 border-red-900/30'}`}>
            {isSecretUnlocked && grillStyle === 'aquabberry-diamond' && (
              <button 
                onClick={() => setDuragStyle(prev => prev === 'standard' ? 'royal-green' : 'standard')} 
                className={`${mobileTrayBtnClasses} ${duragStyle === 'royal-green' ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg' : 'bg-black/40 border-white/10 text-slate-400'}`}
              >
                <RagIcon style="royal-green" isActive={duragStyle === 'royal-green'} /> {duragStyle === 'royal-green' ? 'Royal Rag' : 'Standard Rag'}
              </button>
            )}
            {isSecretUnlocked && grillStyle === 'opal' && (
              <button 
                onClick={() => setDuragStyle(prev => prev === 'standard' ? 'dragonball-purple' : 'standard')} 
                className={`${mobileTrayBtnClasses} ${duragStyle === 'dragonball-purple' ? 'bg-purple-600 text-white border-purple-400 shadow-lg' : 'bg-black/40 border-white/10 text-slate-400'}`}
              >
                <RagIcon style="dragonball-purple" isActive={duragStyle === 'dragonball-purple'} /> {duragStyle === 'dragonball-purple' ? 'Dragonball Rag' : 'Standard Rag'}
              </button>
            )}
            {isSecretUnlocked && knifeStyle === 'samuels-saber' && (
              <button onClick={() => setShowSaberPicker(true)} className={`${mobileTrayBtnClasses} bg-yellow-500 text-black border-yellow-400`}>🎨 Saber</button>
            )}
            {isSecretUnlocked && canSeeChefHatToggle && (
              <button onClick={handleGetChefHat} className={`${mobileTrayBtnClasses} bg-red-600 text-white border-red-400 animate-bounce`}>👨‍🍳 Get Chef Hat</button>
            )}
            {isSecretUnlocked && hasUnlockedChefTheme && theme === 'chef-mode' && (
              <button onClick={() => setShowChefHat(!showChefHat)} className={`${mobileTrayBtnClasses} ${showChefHat ? 'bg-white/20 text-black border-slate-300' : 'bg-black/40 border-white/10 text-slate-400'}`}>👨‍🍳 {showChefHat ? 'Hat On' : 'Hat Off'}</button>
            )}
            {isSecretUnlocked && theme === 'crazy-bird' && (
              <>
                <button onClick={toggleHighEyes} className={`${mobileTrayBtnClasses} ${highEyes ? 'bg-red-500 text-white border-red-400' : 'bg-black/40 border-white/10 text-slate-400'}`}>👁️ {highEyes ? 'Sober Up' : 'Get High'}</button>
                <button onClick={handleCigarToggle} className={`${mobileTrayBtnClasses} ${isCigarEquipped ? 'bg-orange-600 text-white border-orange-500' : 'bg-black/40 border-white/10 text-slate-400'}`}>🚬 {isCigarEquipped ? 'Toss Blunt' : 'Got Blunt?'}</button>
              </>
            )}
          </div>
        )}
        <div className={`border-t transition-all duration-500 ${mainBlurClass} shadow-2xl ${theme === 'coldest' ? 'bg-white/80 border-slate-200 text-slate-800' : theme === 'chef-mode' ? 'bg-white/60 border-orange-100 text-orange-950' : 'bg-black/90 border-red-900/50 text-red-50'}`}>
          <div className="flex items-stretch justify-around h-20 px-4">
            <button onClick={cycleGrill} className={mobileToolbarBtnClasses}><span className="text-xl">💎</span><span className="text-[9px] font-black uppercase truncate max-w-[80px]">{grillLabel}</span></button>
            <button onClick={cycleKnife} className={mobileToolbarBtnClasses}><span className="text-xl">🔪</span><span className="text-[9px] font-black uppercase truncate max-w-[80px]">{knifeLabel}</span></button>
            <button onClick={toggleTheme} className={mobileToolbarBtnClasses}><span className="text-xl">{theme === 'coldest' ? '❄️' : theme === 'chef-mode' ? '👨‍🍳' : theme === 'crazy-bird' ? '🐦' : '💰'}</span><span className="text-[9px] font-black uppercase truncate max-w-[80px]">{theme === 'chef-mode' ? 'Chef' : 'Theme'}</span></button>
            <button onClick={() => setShowVault(true)} className={mobileToolbarBtnClasses}><span className="text-xl">📁</span><span className="text-[9px] font-black uppercase">Vault</span></button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-4 sm:py-12 relative z-10">
        <div className="absolute top-4 left-6 sm:top-6 sm:left-6 z-40 pointer-events-none w-full">
            <button 
              onClick={saveUIPreset}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border shadow-xl transition-all hover:scale-105 active:scale-95 group ${mainBlurClass} ${theme === 'coldest' ? 'bg-white/40 border-sky-100 text-sky-800' : theme === 'chef-mode' ? 'bg-white/60 border-orange-100 text-orange-950 shadow-orange-900/10' : 'bg-black/40 border-white/10 text-white'}`}
            >
               <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
               </svg>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Save UI</span>
            </button>
        </div>

        {error && <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-2xl text-red-400 text-sm font-bold text-center">{error}</div>}
        
        {isEnrichingLibrary ? (
          <div className="max-w-3xl mx-auto mt-16 sm:mt-12 animate-in fade-in zoom-in duration-1000">
            <div className={`p-8 sm:p-16 transition-all ${mainBlurClass} border rounded-[3rem] sm:rounded-[4rem] shadow-2xl flex flex-col items-center text-center ${theme === 'coldest' ? 'bg-white/30 border-white/40' : theme === 'chef-mode' ? 'bg-white/40 border-white/40' : 'bg-black/40 border-white/10'}`}>
              <Logo size={160} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={showChefHat} showSparkles={showSparkles} onClick={cycleGrill} />
              
              <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter mt-8 mb-4 ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-800' : 'text-white'}`}>
                Building Your Library...
              </h2>
              
              <p className={`text-sm font-bold mb-8 max-w-md ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-600' : 'text-slate-400'}`}>
                We're researching your unique plugins to find out what makes them special. This is a lot of work, but we'll automatically save your library so you won't have to do this again until you get new plugins!
              </p>

              <div className="w-full max-w-md bg-black/10 rounded-full h-4 mb-4 overflow-hidden relative">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${theme === 'coldest' ? 'bg-sky-500' : theme === 'chef-mode' ? 'bg-orange-500' : 'bg-white'}`}
                  style={{ width: `${enrichProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between w-full max-w-md text-xs font-black uppercase tracking-widest opacity-60 mb-8">
                <span>{enrichProgress}% Complete</span>
                <span>~{enrichEta}s remaining</span>
              </div>

              <button 
                onClick={() => {
                  // We don't have a direct way to 'stop' the async function, 
                  // but we can force the state to move forward with what we have.
                  // For now, we'll just alert the user that they can refresh or we can try to 
                  // implement a more robust cancellation.
                  // Actually, let's just allow them to 'Force Finish'
                  const confirmed = window.confirm("This will stop the AI research and import your plugins as 'Uncategorized'. You can still use them, but recipes might be less accurate. Proceed?");
                  if (confirmed) {
                    setIsEnrichingLibrary(false);
                    // The plugins state already has the raw parsed plugins from parsePlugins
                    // but they might be overwritten by the enrichment if it finishes.
                    // To be safe, we'll just let the current state stand.
                    setShowAnalogModal(true);
                  }
                }}
                className={`px-8 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'coldest' ? 'bg-white/50 border-slate-300 text-slate-700 hover:bg-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
              >
                Skip Research & Fast Import
              </button>
            </div>
          </div>
        ) : plugins.length === 0 && !isEnrichingLibrary ? (
          <div className="max-w-3xl mx-auto mt-16 sm:mt-12 animate-in fade-in zoom-in duration-1000">
            <div className={`p-6 sm:p-12 transition-all ${mainBlurClass} border rounded-[3rem] sm:rounded-[4rem] shadow-2xl ${theme === 'coldest' ? 'bg-white/30 border-white/40' : theme === 'chef-mode' ? 'bg-white/40 border-white/40' : 'bg-black/40 border-white/10'}`}>
              <div className="flex flex-col items-center mb-10 text-center">
                <Logo size={240} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={showChefHat} showSparkles={showSparkles} onClick={cycleGrill} />
                <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter select-none ${theme === 'chef-mode' ? 'mt-4 sm:mt-8' : 'mt-8'} ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-800' : 'text-white'}`}>
                  {theme === 'chef-mode' ? "Let's cook up some fire!" : highEyes ? "Let's get high!" : theme === 'coldest' ? "The coldest beats in the streets." : "Let's go to the top!"}
                </h2>
                {theme === 'coldest' && !highEyes && (
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-2 text-slate-600 select-none">
                    only with BeatGangsta
                  </p>
                )}
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  if (window.innerWidth >= 640) handleDragOver(e);
                }}
                onDragLeave={(e) => {
                  if (window.innerWidth >= 640) handleDragLeave(e);
                }}
                onDrop={(e) => {
                  if (window.innerWidth >= 640) handleDrop(e);
                }}
                className={`w-full h-80 p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 outline-none ${mainBlurClass} border shadow-inner rounded-[2rem] sm:rounded-[3rem] ${isDragging ? 'scale-[1.02] border-sky-500 bg-sky-500/10' : ''} ${theme === 'coldest' ? 'bg-white/40 border-white text-slate-800 hover:bg-white/60' : theme === 'chef-mode' ? 'bg-white/60 border-white text-slate-900 hover:bg-white/80' : 'bg-black/60 border-white/10 text-white hover:bg-black/80'}`}
              >
                <div className="text-4xl mb-4 opacity-50">{theme === 'coldest' ? '❄️' : theme === 'chef-mode' ? '👨‍🍳' : theme === 'crazy-bird' ? '🐦' : '💰'}</div>
                <p className="hidden sm:block text-lg font-black tracking-tight mb-2">Drag & Drop your plugin file here</p>
                <p className="hidden sm:block text-sm font-bold opacity-60 mb-6">or click to browse</p>
                <p className="sm:hidden text-lg font-black tracking-tight mb-6">Tap to upload your plugin file</p>
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Click the Help button below to find your file</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button 
                  onClick={() => {
                    const pasted = window.prompt("Paste your plugin list here (CSV or Reaper INI format):");
                    if (pasted) {
                      setCsvInput(pasted);
                      parsePlugins(pasted);
                    }
                  }}
                  className={`font-black py-4 px-12 rounded-full border text-xs uppercase tracking-widest transition-all select-none ${theme === 'coldest' || theme === 'chef-mode' ? 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                >
                  Paste List
                </button>
                <button 
                  onClick={() => setShowGuide(true)}
                  className={`font-black py-4 px-12 rounded-full border text-xs uppercase tracking-widest transition-all select-none ${theme === 'coldest' || theme === 'chef-mode' ? 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                >
                  Help?
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt,.ini" onChange={handleFileUpload} />
            </div>
          </div>
        ) : !isEnrichingLibrary && plugins.length > 0 ? (
          <div className="space-y-12 mt-12 sm:mt-0">
            <section className={`flex flex-col gap-8 p-6 sm:p-10 transition-all ${mainBlurClass} border rounded-[3rem] sm:rounded-[4rem] shadow-xl ${theme === 'coldest' ? 'bg-white/20 border-white/30' : theme === 'chef-mode' ? 'bg-white/40 border-white/30' : 'bg-black/40 border-white/10'}`}>
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-6">
                  <Logo size={120} grillStyle={grillStyle} knifeStyle={knifeStyle} duragStyle={duragStyle} pendantStyle={pendantStyle} chainStyle={chainStyle} theme={theme} saberColor={saberColor} showChain={showChain} highEyes={highEyes} isCigarEquipped={isCigarEquipped} isTossingCigar={isTossingCigar} showChefHat={showChefHat} showSparkles={showSparkles} onClick={cycleGrill} />
                  <div><h2 className={`text-2xl font-black select-none ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-800' : 'text-white'}`}>Studio Info</h2><p className="text-xs font-bold opacity-70 select-none">Loaded {plugins.length} plugins.</p></div>
                </div>
                <button onClick={handleGenerate} disabled={loading} className={`py-4 px-12 rounded-full font-black text-xs select-none shadow-lg hover:scale-105 active:scale-95 transition-all ${theme === 'coldest' || theme === 'chef-mode' ? 'bg-sky-500 text-white' : 'bg-white text-black'}`}>{loading ? "Architecting..." : "Get Random Recipes"}</button>
              </div>

              <div className="h-[1px] bg-current opacity-10" />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group overflow-hidden rounded-full">
                  <input 
                    type="text" 
                    value={typeBeatSearch}
                    onChange={(e) => setTypeBeatSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTypeBeatSearch()}
                    className={`w-full py-5 pl-8 pr-32 sm:pr-40 rounded-full text-sm font-black focus:outline-none transition-all border-2 ${theme === 'coldest' ? 'bg-white/40 border-sky-100 focus:border-sky-400 text-slate-900' : theme === 'chef-mode' ? 'bg-white/60 border-orange-100 focus:border-orange-400 text-slate-900' : 'bg-black/60 border-white/10 focus:border-white/30 text-white'}`}
                  />
                  {!typeBeatSearch && (
                    <div className="absolute inset-y-0 left-8 right-32 sm:right-40 flex items-center overflow-hidden pointer-events-none">
                      <div className={`whitespace-nowrap animate-marquee text-sm font-black ${theme === 'coldest' ? 'text-slate-600' : theme === 'chef-mode' ? 'text-slate-600' : 'text-white/50'}`}>
                        Enter artist, genre, or vibe (e.g. Cyberpunk Phonk, Ethereal Cloud Rap)... &nbsp;&nbsp;&nbsp;&nbsp; Enter artist, genre, or vibe (e.g. Cyberpunk Phonk, Ethereal Cloud Rap)...
                      </div>
                    </div>
                  )}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-900' : 'text-white'}`}>Vibe Search</span>
                  </div>
                </div>
                <button 
                  onClick={handleTypeBeatSearch} 
                  disabled={loading || !typeBeatSearch.trim()} 
                  className={`py-5 px-12 rounded-full font-black text-xs select-none shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 ${theme === 'coldest' || theme === 'chef-mode' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                >
                  {loading ? "Searching..." : "Search Vibe"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group overflow-hidden rounded-full">
                  <input 
                    type="text" 
                    value={songSearch}
                    onChange={(e) => setSongSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSongSearch()}
                    className={`w-full py-5 pl-8 pr-32 sm:pr-40 rounded-full text-sm font-black focus:outline-none transition-all border-2 ${theme === 'coldest' ? 'bg-white/40 border-sky-100 focus:border-sky-400 text-slate-900' : theme === 'chef-mode' ? 'bg-white/60 border-orange-100 focus:border-orange-400 text-slate-900' : 'bg-black/60 border-white/10 focus:border-white/30 text-white'}`}
                  />
                  {!songSearch && (
                    <div className="absolute inset-y-0 left-8 right-32 sm:right-40 flex items-center overflow-hidden pointer-events-none">
                      <div className={`whitespace-nowrap animate-marquee text-sm font-black ${theme === 'coldest' ? 'text-slate-600' : theme === 'chef-mode' ? 'text-slate-600' : 'text-white/50'}`}>
                        Enter a song (e.g. Killa Cam by Cam'ron, Sicko Mode by Travis Scott)... &nbsp;&nbsp;&nbsp;&nbsp; Enter a song (e.g. Killa Cam by Cam'ron, Sicko Mode by Travis Scott)...
                      </div>
                    </div>
                  )}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-900' : 'text-white'}`}>Song Search</span>
                  </div>
                </div>
                <button 
                  onClick={handleSongSearch} 
                  disabled={loading || !songSearch.trim()} 
                  className={`py-5 px-12 rounded-full font-black text-xs select-none shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 ${theme === 'coldest' || theme === 'chef-mode' ? 'bg-sky-600 text-white' : 'bg-white/20 text-white'}`}
                >
                  {loading ? "Searching..." : "Search Song"}
                </button>
              </div>

              {(analogInstruments.length > 0 || analogHardware.length > 0) && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 sm:mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={excludeAnalog} 
                      onChange={(e) => setExcludeAnalog(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className={`text-sm font-bold ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Exclude my analog equipment from recipes
                    </span>
                  </label>
                  <button 
                    onClick={() => setShowAnalogModal(true)}
                    className={`text-xs font-bold underline opacity-70 hover:opacity-100 transition-opacity ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-700' : 'text-slate-300'}`}
                  >
                    (Edit Equipment)
                  </button>
                </div>
              )}
            </section>

            {recipes.length > 0 && (
              <section className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                {recipes.map((recipe, idx) => (
                  <RecipeCard key={idx} recipe={recipe} isSaved={vault.some(r => r.title === recipe.title)} onSave={saveToVault} theme={theme} />
                ))}
              </section>
            )}
            <section className={`p-6 sm:p-10 transition-all ${mainBlurClass} border rounded-[3rem] sm:rounded-[4rem] shadow-xl mb-16 ${theme === 'coldest' ? 'bg-white/20 border-white/30' : theme === 'chef-mode' ? 'bg-white/40 border-white/30' : 'bg-black/40 border-white/10'}`}>
              <div className="flex flex-col gap-4 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedFolder && (
                      <button 
                        onClick={() => setSelectedFolder(null)}
                        className={`p-2 rounded-full transition-all hover:scale-105 active:scale-95 ${theme === 'coldest' ? 'bg-sky-100 text-sky-800 hover:bg-sky-200' : theme === 'chef-mode' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <h3 className={`text-2xl font-black select-none ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-800' : 'text-white'}`}>
                      {selectedFolder ? selectedFolder : 'Gear Rack'}
                    </h3>
                  </div>
                  <div className="flex gap-4 items-center">
                    <select 
                      value={sortBy} 
                      onChange={(e) => { setSortBy(e.target.value as any); setSelectedFolder(null); }}
                      className={`py-2 px-4 rounded-full text-xs font-bold focus:outline-none transition-all ${theme === 'coldest' ? 'bg-white/40 text-slate-800' : theme === 'chef-mode' ? 'bg-white/60 text-slate-900' : 'bg-black/60 text-white'}`}
                    >
                      <option value="type">Group by Type</option>
                      <option value="vendor">Group by Brand</option>
                      <option value="name">Display All</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Search the rack..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className={`py-4 px-8 text-sm font-bold focus:outline-none transition-all w-64 sm:w-96 rounded-full ${theme === 'coldest' ? 'bg-white/40 border-white text-slate-800' : theme === 'chef-mode' ? 'bg-white/60 border-white text-slate-900' : 'bg-black/60 border-white/10 text-white'}`} 
                    />
                  </div>
                </div>
                
                {/* Starred Items Bar */}
                {pluginToUnstar && (
                  <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
                    <div className={`w-full max-w-sm p-8 sm:p-10 rounded-[3rem] border shadow-2xl text-center ${theme === 'coldest' ? 'bg-white border-slate-200' : 'bg-[#0a0a0a] text-white border-white/10'}`}>
                      <h2 className="text-2xl font-black tracking-tighter mb-2">Remove Starred Plugin?</h2>
                      <p className="text-sm font-bold opacity-60 mb-8">Are you sure you want to un-star <span className="font-extrabold">{pluginToUnstar}</span>?</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setPluginToUnstar(null)}
                          className={`flex-1 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${theme === 'coldest' ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/60'}`}
                        >
                          Keep Starred
                        </button>
                        <button 
                          onClick={confirmUnstar}
                          className="flex-1 bg-red-500 text-white font-black py-4 rounded-full shadow-lg active:scale-95 transition-all uppercase text-[10px] tracking-widest"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {starredPlugins.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pt-4 pb-2 scrollbar-hide -mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 shrink-0">Starred ({starredPlugins.length + starredHardware.length}/20):</span>
                    {[...starredPlugins, ...starredHardware].map((name, index) => {
                      const themeStyles = {
                        coldest: {
                          border: 'border-sky-400/50',
                          shades: [
                            'bg-sky-100/50 text-sky-700', 'bg-sky-200/50 text-sky-800',
                            'bg-sky-300/50 text-sky-900', 'bg-sky-400/50 text-sky-950',
                            'bg-sky-500/50 text-sky-950'
                          ]
                        },
                        'chef-mode': {
                          border: 'border-orange-400/50',
                          shades: [
                            'bg-orange-100/50 text-orange-700', 'bg-orange-200/50 text-orange-800',
                            'bg-orange-300/50 text-orange-900', 'bg-orange-400/50 text-orange-950',
                            'bg-orange-500/50 text-orange-950'
                          ]
                        },
                        'crazy-bird': {
                          border: 'border-red-500/50',
                          shades: [
                            'bg-red-200/20 text-red-100', 'bg-red-300/20 text-red-100',
                            'bg-red-400/20 text-red-50', 'bg-red-500/20 text-red-50',
                            'bg-red-600/20 text-red-50'
                          ]
                        },
                        'hustle-time': {
                          border: 'border-emerald-500/50',
                          shades: [
                            'bg-emerald-200/20 text-emerald-100', 'bg-emerald-300/20 text-emerald-100',
                            'bg-emerald-400/20 text-emerald-50', 'bg-emerald-500/20 text-emerald-50',
                            'bg-emerald-600/20 text-emerald-50'
                          ]
                        }
                      };
                      const styles = (themeStyles[theme as keyof typeof themeStyles] || themeStyles['hustle-time']);
                      const colorClass = styles.shades[index % styles.shades.length];
                      const borderClass = styles.border;

                      return (
                        <div key={name} className="relative group shrink-0">
                          <button
                            onClick={() => {
                              setSearchTerm(name);
                              setTimeout(() => setSearchTerm(''), 3000);
                            }}
                            className={`flex items-center gap-1.5 text-sm font-bold px-5 py-1.5 rounded-full whitespace-nowrap transition-all hover:scale-105 active:scale-95 border ${borderClass} ${colorClass}`}>
                            <Star size={12} className="fill-current" />
                            {name}
                          </button>
                          <button
                            onClick={() => {
                            if (plugins.some(p => p.name === name)) {
                              toggleStar(name);
                            } else {
                              setStarredHardware(prev => prev.filter(n => n !== name));
                            }
                          }}
                            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg border-2 border-white/50"
                            title={`Remove ${name}`}>
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Analog Equipment Section */}
              {!selectedFolder && !searchTerm && (analogInstruments.length > 0 || analogHardware.length > 0) && (
                <div className="mb-12">
                  <h4 className={`text-sm font-black uppercase tracking-widest mb-6 opacity-70 ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-800' : 'text-white'}`}>Real Instruments & Hardware</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[...analogInstruments, ...analogHardware].map((item, idx) => (
                      <HardwareCard 
                        key={`hw-${idx}`}
                        item={item}
                        theme={theme}
                        isFavorite={starredHardware.includes(item.name)}
                        onToggleFavorite={(itemName) => {
                          setStarredHardware(prev => 
                            prev.includes(itemName) 
                              ? prev.filter(n => n !== itemName) 
                              : [...prev, itemName]
                          );
                        }}
                        onRemove={(itemToRemove) => {
                          if (itemToRemove.type === 'instrument') {
                            setAnalogInstruments(prev => prev.filter(i => i.name !== itemToRemove.name));
                            setDeletedInstruments(prev => [...prev, itemToRemove]);
                          } else {
                            setAnalogHardware(prev => prev.filter(h => h.name !== itemToRemove.name));
                            setDeletedHardware(prev => [...prev, itemToRemove]);
                          }
                          setStarredHardware(prev => prev.filter(n => n !== itemToRemove.name));
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-12">
                <h4 className={`text-sm font-black uppercase tracking-widest mb-6 opacity-70 ${theme === 'coldest' || theme === 'chef-mode' ? 'text-slate-800' : 'text-white'}`}>Plugins</h4>
                {groupedPlugins && !selectedFolder ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {(() => {
                      const items: any[] = Object.entries(groupedPlugins).map(([groupName, groupPlugins]) => ({ type: 'folder', name: groupName, plugins: groupPlugins }));
                    const placeholders = pendingPlaceholders.filter(p => p.type === 'folder').sort((a, b) => a.index - b.index);
                    placeholders.forEach(p => {
                      items.splice(p.index, 0, { type: 'folder', name: p.name, plugins: p.plugins, isPlaceholder: true, placeholderId: p.id });
                    });
                    
                    return items.map((item, idx) => {
                      if (item.isPlaceholder) {
                        return (
                          <div key={`placeholder-${item.placeholderId}`} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border border-dashed transition-all ${theme === 'coldest' ? 'border-sky-300 bg-sky-50' : theme === 'chef-mode' ? 'border-orange-300 bg-orange-50' : 'border-white/20 bg-white/5'} h-full min-h-[12rem]`}>
                            <p className={`text-xs font-bold opacity-50 mb-4 text-center ${theme === 'coldest' ? 'text-sky-800' : theme === 'chef-mode' ? 'text-orange-800' : 'text-white'}`}>Removed {item.name}</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUndo(item.placeholderId); }}
                              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all ${theme === 'coldest' ? 'bg-sky-500 text-white' : theme === 'chef-mode' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                            >
                              Undo
                            </button>
                          </div>
                        );
                      }
                      
                      const groupName = item.name;
                      const groupPlugins = item.plugins;
                      return (
                        <div 
                          key={groupName}
                          onClick={() => setSelectedFolder(groupName)}
                          className={`cursor-pointer group relative flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-xl ${theme === 'coldest' ? 'bg-white/60 border-sky-100 hover:bg-white/80' : theme === 'chef-mode' ? 'bg-white/60 border-orange-100 hover:bg-white/80' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                          {/* Top Actions */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setFolderToRemove(groupName); }}
                              className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md transition-all"
                              title={`Remove ${sortBy === 'vendor' ? 'Brand' : 'Type'}`}
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Confirmation Popup */}
                          {folderToRemove === groupName && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-[2rem] p-4 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                              <div className="text-center">
                                <p className="text-white text-xs font-bold mb-3">Remove all {groupName}?</p>
                                <div className="flex justify-center gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setFolderToRemove(null); }}
                                    className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold hover:bg-white/30 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const pluginsInFolder = plugins.filter(p => (sortBy === 'vendor' ? p.vendor : p.type) === groupName);
                                      const folderIndex = Object.keys(groupedPlugins).indexOf(groupName);
                                      
                                      setPlugins(prev => prev.filter(p => (sortBy === 'vendor' ? p.vendor : p.type) !== groupName));
                                      setDeletedPlugins(prev => [...prev, ...pluginsInFolder]);
                                      setStarredPlugins(prev => {
                                        const names = pluginsInFolder.map(p => p.name);
                                        return prev.filter(name => !names.includes(name));
                                      });
                                      
                                      setPendingPlaceholders(prev => [
                                        ...prev, 
                                        { id: Date.now().toString() + Math.random(), type: 'folder', name: groupName, index: folderIndex, plugins: pluginsInFolder }
                                      ]);
                                      resetDeletionTimer();
                                      setFolderToRemove(null);
                                    }}
                                    className="px-3 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center shadow-inner ${theme === 'coldest' ? 'bg-sky-100 text-sky-600' : theme === 'chef-mode' ? 'bg-orange-100 text-orange-600' : 'bg-black/40 text-white'}`}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-black text-center truncate w-full px-2">{groupName}</h4>
                          <span className="text-[10px] font-bold opacity-50 mt-1 uppercase tracking-widest">{groupPlugins.length} items</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {(() => {
                    const items: any[] = filteredPlugins.map(p => ({ type: 'plugin', plugin: p }));
                    const placeholders = pendingPlaceholders.filter(p => p.type === 'plugin').sort((a, b) => a.index - b.index);
                    placeholders.forEach(p => {
                      items.splice(p.index, 0, { type: 'plugin', plugin: p.plugins[0], isPlaceholder: true, placeholderId: p.id });
                    });

                    return items.map((item, idx) => {
                      if (item.isPlaceholder) {
                        return (
                          <div key={`placeholder-${item.placeholderId}`} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border border-dashed transition-all ${theme === 'coldest' ? 'border-sky-300 bg-sky-50' : theme === 'chef-mode' ? 'border-orange-300 bg-orange-50' : 'border-white/20 bg-white/5'} h-full min-h-[12rem]`}>
                            <p className={`text-xs font-bold opacity-50 mb-4 text-center ${theme === 'coldest' ? 'text-sky-800' : theme === 'chef-mode' ? 'text-orange-800' : 'text-white'}`}>Removed {item.plugin.name}</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUndo(item.placeholderId); }}
                              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all ${theme === 'coldest' ? 'bg-sky-500 text-white' : theme === 'chef-mode' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                            >
                              Undo
                            </button>
                          </div>
                        );
                      }

                      const plugin = item.plugin;
                      return (
                        <PluginCard 
                          key={`${plugin.vendor}-${plugin.name}-${idx}`} 
                          plugin={plugin} 
                          isFavorite={starredPlugins.includes(plugin.name)}
                          onToggleFavorite={(p) => toggleStar(p.name)}
                          onRemove={(p) => {
                            const pluginIndex = filteredPlugins.findIndex(pl => pl.name === p.name && pl.vendor === p.vendor);
                            setPlugins(prev => prev.filter(pl => pl.name !== p.name || pl.vendor !== p.vendor));
                            setDeletedPlugins(prev => [...prev, p]);
                            setStarredPlugins(prev => prev.filter(n => n !== p.name));
                            
                            setPendingPlaceholders(prev => [
                              ...prev, 
                              { id: Date.now().toString() + Math.random(), type: 'plugin', index: pluginIndex, plugins: [p] }
                            ]);
                            resetDeletionTimer();
                          }}
                        />
                      );
                    });
                  })()}
                </div>
              )}
              </div>
            </section>
          </div>
        ) : null}
      </main>
      <footer className="py-16 text-center opacity-40 select-none"><p className="text-[10px] font-black uppercase tracking-[0.8em]">{currentAppName} x ColdestConcept / 2026</p></footer>
      
      <AnalogEquipmentModal 
        isOpen={showAnalogModal} 
        onClose={() => setShowAnalogModal(false)} 
        theme={theme}
        onSave={async (instrumentNames, hardwareNames) => {
          const newInstruments = await enrichHardware(instrumentNames);
          const newHardware = await enrichHardware(hardwareNames);

          const removedInstruments = analogInstruments.filter(i => !newInstruments.some(ni => ni.name === i.name));
          const removedHardware = analogHardware.filter(h => !newHardware.some(nh => nh.name === h.name));

          setDeletedInstruments(prev => [...prev, ...removedInstruments]);
          setDeletedHardware(prev => [...prev, ...removedHardware]);

          setAnalogInstruments(newInstruments);
          setAnalogHardware(newHardware);
        }}
      />
      <TrashModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        deletedPlugins={deletedPlugins}
        deletedInstruments={deletedInstruments}
        deletedHardware={deletedHardware}
        onRestorePlugin={(plugin) => {
          setDeletedPlugins(prev => prev.filter(p => p.name !== plugin.name || p.vendor !== plugin.vendor));
          setPlugins(prev => [...prev, plugin]);
        }}
        onRestoreInstrument={(inst) => {
          setDeletedInstruments(prev => prev.filter(i => i !== inst));
          setAnalogInstruments(prev => [...prev, inst]);
        }}
        onRestoreHardware={(hw) => {
          setDeletedHardware(prev => prev.filter(h => h !== hw));
          setAnalogHardware(prev => [...prev, hw]);
        }}
        onEmptyTrash={() => {
          setDeletedPlugins([]);
          setDeletedInstruments([]);
          setDeletedHardware([]);
        }}
        theme={theme}
      />
    </div>
  );
};

export default App;
