
import React, { useState, useRef } from 'react';
import { SavedRecipe, AppTheme, Folder, UIPreset, VSTPlugin, SharedSession } from '../types';

interface VaultProps {
  theme: AppTheme;
  recipes: SavedRecipe[];
  folders: Folder[];
  presets: UIPreset[];
  onRemove: (id: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onUpdateFolder: (id: string, folderId: string) => void;
  onUpdateLinkedPreset: (recipeId: string, presetId: string) => void;
  onAddFolder: (name: string) => void;
  onRemoveFolder: (id: string) => void;
  onUpdateFolderColor: (id: string, color: string) => void;
  onRemovePreset: (id: string) => void;
  onUpdatePresetColor: (id: string, color: string) => void;
  onOpen: (recipe: SavedRecipe) => void;
  onExportRig: (recipe?: SavedRecipe) => void;
  onImportRig: (session: SharedSession) => void;
  onShare: (session: SharedSession) => void;
  onClose: () => void;
  allPlugins: VSTPlugin[];
  userName: string;
}

const MagazineMockup: React.FC<{ theme: AppTheme }> = ({ theme }) => {
  const styles = {
    'coldest': {
      bg: 'bg-white/80 backdrop-blur-xl',
      border: 'border-white/60',
      text: 'text-[#082f49]',
      accent: 'bg-white/50 border-white/40',
      tag: 'bg-sky-500',
      title: 'BeatGenius Winter Quarterly'
    },
    'crazy-bird': {
      bg: 'bg-[#1a0505]',
      border: 'border-red-600',
      text: 'text-red-50',
      accent: 'bg-red-900/40 border-red-500',
      tag: 'bg-red-600',
      title: 'Wraith Production Monthly'
    },
    'hustle-time': {
      bg: 'bg-[#051a0d]',
      border: 'border-yellow-600',
      text: 'text-yellow-100',
      accent: 'bg-emerald-900/40 border-yellow-500',
      tag: 'bg-yellow-600',
      title: 'The Hustle & Grind Digest'
    },
    'chef-mode': {
      bg: 'bg-orange-50',
      border: 'border-orange-900',
      text: 'text-orange-950',
      accent: 'bg-white border-orange-400',
      tag: 'bg-red-600',
      title: 'The Master Chef Signal'
    }
  };

  const s = styles[theme] || styles.coldest;

  return (
    <div className={`w-full aspect-[4/3] ${s.bg} rounded-2xl border-4 ${s.border} shadow-2xl overflow-hidden relative group rotate-1 transition-all duration-500`}>
      <div className="absolute inset-0 p-4">
        <div className={`flex justify-between items-start mb-4 border-b-2 ${s.border} pb-2`}>
          <span className={`text-[10px] font-black uppercase italic tracking-tighter ${s.text}`}>{s.title}</span>
          <span className={`text-[10px] font-bold ${s.text}`}>Vol. 10.4</span>
        </div>
        <h4 className={`text-2xl font-black tracking-tighter leading-none mb-4 uppercase ${s.text}`}>The Rig Exchange Protocol</h4>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <div className={`h-20 ${s.accent} rounded-lg border-2 border-dashed flex items-center justify-center`}>
                 <span className={`text-[8px] font-black uppercase opacity-60 ${s.text}`}>Import Rig</span>
              </div>
              <p className={`text-[7px] leading-tight font-medium uppercase ${s.text}`}>Step 1: Your friend clicks "Friend Import" in their vault.</p>
           </div>
           <div className="space-y-2">
              <div className={`h-20 ${s.accent} rounded-lg border-2 flex items-center justify-center`}>
                 <span className="text-[18px]">Box</span>
              </div>
              <p className={`text-[7px] leading-tight font-medium uppercase ${s.text}`}>Step 2: They select the .json rig file you just generated.</p>
           </div>
        </div>
        <div className={`mt-4 p-2 ${s.tag} text-white rounded flex items-center justify-between`}>
           <span className="text-[8px] font-black uppercase tracking-widest">Neural Collab Sync</span>
           <span className="text-[10px] font-black italic">ACTIVE</span>
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 font-black text-[10px] rotate-[-12deg] shadow-lg">AUTHENTIC RIG</div>
    </div>
  );
};

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor.length < 7) return 'white';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

export const Vault: React.FC<VaultProps> = ({ 
  theme, 
  recipes, 
  folders,
  presets,
  onRemove, 
  onUpdateColor, 
  onUpdateFolder,
  onUpdateLinkedPreset,
  onAddFolder,
  onRemoveFolder,
  onUpdateFolderColor,
  onRemovePreset,
  onUpdatePresetColor,
  onOpen, 
  onExportRig,
  onImportRig,
  onShare,
  onClose,
  allPlugins,
  userName
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'presets'>('recipes');
  const [activeFolderId, setActiveFolderId] = useState<string | 'all'>('all');
  const [showShareGuide, setShowShareGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerClasses = theme === 'coldest' 
    ? "bg-white/80 backdrop-blur-2xl border-white/60 text-[#082f49] shadow-[0_8px_30px_rgba(0,0,0,0.12)]" 
    : theme === 'crazy-bird'
    ? "bg-[#0a0000]/95 border-red-900/50 text-red-50"
    : theme === 'hustle-time'
    ? "bg-[#000a05]/95 border-yellow-900/50 text-yellow-50"
    : "bg-[#fef3c7]/95 border-orange-200 text-orange-950";

  const filteredRecipes = activeFolderId === 'all' 
    ? recipes 
    : recipes.filter(r => r.folderId === activeFolderId);

  const handleShareClick = (recipe: SavedRecipe) => {
    onExportRig(recipe);
    setShowShareGuide(true);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const session: SharedSession = JSON.parse(content);
        if (session.recipe && session.senderPlugins && session.preset) {
          onImportRig(session);
        } else {
          alert("Invalid rig file format.");
        }
      } catch (err) {
        alert("Could not read rig file. Make sure it's a valid .json exported from BeatGenius.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper for dynamic guide modal styling
  const guideThemeStyles = {
    'coldest': {
      bg: 'bg-white/90 backdrop-blur-2xl',
      border: 'border-white/60',
      btn: 'bg-gradient-to-b from-sky-400 to-sky-500 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]',
      tag: 'text-sky-600',
      sub: 'bg-white/50 text-[#082f49] border border-white/40 shadow-inner',
      icon: '❄️'
    },
    'crazy-bird': {
      bg: 'bg-black',
      border: 'border-red-600',
      btn: 'bg-red-600 text-white',
      tag: 'text-red-400',
      sub: 'bg-red-950/40 text-red-300',
      icon: '🦅'
    },
    'hustle-time': {
      bg: 'bg-[#001208]',
      border: 'border-yellow-500',
      btn: 'bg-yellow-500 text-black',
      tag: 'text-yellow-400',
      sub: 'bg-emerald-950/40 text-yellow-200',
      icon: '💰'
    },
    'chef-mode': {
      bg: 'bg-white',
      border: 'border-orange-600',
      btn: 'bg-red-600 text-white',
      tag: 'text-orange-600',
      sub: 'bg-orange-50 text-orange-700',
      icon: '👨‍🍳'
    }
  };

  const g = guideThemeStyles[theme] || guideThemeStyles.coldest;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
      
      {showShareGuide && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-12 bg-black/80 backdrop-blur-3xl animate-in zoom-in duration-500">
           <div className={`w-full max-w-2xl ${g.bg} p-8 sm:p-12 rounded-[4rem] border-8 ${g.border} shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col items-center text-center overflow-hidden`}>
              {/* Background Flourishes */}
              {theme === 'crazy-bird' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,red_0,transparent_70%)]" />
                </div>
              )}
              
              <button onClick={() => setShowShareGuide(false)} className={`absolute top-8 right-8 p-3 rounded-full ${g.sub} hover:opacity-70 transition-all`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h3 className={`text-4xl font-black tracking-tighter uppercase italic mb-2 ${theme === 'coldest' || theme === 'chef-mode' ? 'text-[#082f49]' : 'text-white'}`}>
                {g.icon} Rig Packaged!
              </h3>
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${g.tag} mb-8`}>Secure Protocol Engaged</p>
              
              <div className="w-full max-w-sm mb-10">
                <MagazineMockup theme={theme} />
              </div>

              <div className="space-y-4 max-w-md">
                 <p className={`text-sm font-bold leading-relaxed ${theme === 'coldest' || theme === 'chef-mode' ? 'text-[#082f49]' : 'text-white'}`}>
                   Your studio session has been encrypted into the rig file. 
                   <span className={g.tag}> Send this intel to your producer ally!</span>
                 </p>
                 <div className={`p-4 ${g.sub} rounded-2xl text-[10px] font-black uppercase tracking-widest text-left space-y-2`}>
                    <p>• Instruction: Tell them to click "Friend Import"</p>
                    <p>• Purpose: side-by-side gear rack comparison</p>
                    <p>• Action: Adopt your Visual Persona instantly</p>
                 </div>
              </div>

              <button 
                onClick={() => setShowShareGuide(false)}
                className={`mt-10 w-full py-5 ${g.btn} rounded-full font-black uppercase tracking-[0.4em] text-xs hover:scale-105 active:scale-95 transition-all shadow-xl`}
              >
                Return to Control Center
              </button>
           </div>
        </div>
      )}

      <div className={`w-full max-w-6xl h-[95vh] lg:max-h-[90vh] overflow-hidden flex flex-col rounded-[2rem] sm:rounded-[4rem] border shadow-2xl relative ${containerClasses} transition-colors duration-700`}>
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-full hover:bg-black/5 transition-all z-20">
           <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-black/5 p-4 sm:p-6 lg:p-8 flex flex-col gap-4 lg:gap-6 flex-shrink-0">
            <header className="pr-10 lg:pr-0">
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter mb-1">Vault</h2>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Session Records</p>
            </header>

            <div className="flex flex-col gap-2">
               <div className="flex gap-2 p-1 bg-black/5 rounded-2xl">
                 <button 
                   onClick={() => setActiveTab('recipes')} 
                   className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'recipes' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-black/5'}`}
                 >
                   Recipes
                 </button>
                 <button 
                   onClick={() => setActiveTab('presets')} 
                   className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'presets' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-black/5'}`}
                 >
                   UI Presets
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                  >
                    Friend Import
                  </button>
                  <button 
                    onClick={() => handleShareClick(recipes[0] || {} as any)}
                    className="py-2.5 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-md active:scale-95 px-2"
                  >
                    Download Rig and Share
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
               </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
            {activeTab === 'recipes' ? (
              <>
                <header className="mb-6 sm:mb-12">
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 sm:mb-2">
                    Studio Vault
                  </h2>
                  <p className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] opacity-60">Architecture Repository</p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {filteredRecipes.length === 0 ? (
                    <div className="py-20 text-center opacity-40">
                      <p className="text-xl font-black italic">No recipes in this sector.</p>
                    </div>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <div key={recipe.id} className="group relative flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div 
                          onClick={() => onOpen(recipe)}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0 cursor-pointer transition-transform hover:scale-110 shadow-xl border-4 border-white/40 flex items-center justify-center"
                          style={{ backgroundColor: recipe.bubbleColor }}
                        >
                          <span className="text-sm sm:text-xl font-black" style={{ color: getContrastColor(recipe.bubbleColor) }}>
                            {recipe.title.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <h3 onClick={() => onOpen(recipe)} className="text-sm sm:text-lg font-black tracking-tight truncate cursor-pointer hover:underline">
                            {recipe.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-80">
                            <span>{recipe.style}</span>
                            {recipe.artistTypes && recipe.artistTypes.length > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-current opacity-20" />
                                <span className="italic text-orange-500">{recipe.artistTypes.join(', ')}</span>
                              </>
                            )}
                            <span className="w-1 h-1 rounded-full bg-current opacity-20" />
                            <select 
                              value={recipe.linkedPresetId || ''} 
                              onChange={(e) => onUpdateLinkedPreset(recipe.id, e.target.value)}
                              className="bg-black/5 rounded-lg px-2 py-1 font-black uppercase border-none outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            >
                              <option value="">No UI Linked</option>
                              {presets.map(p => <option key={p.id} value={p.id}>Tie to: {p.name}</option>)}
                            </select>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-black/10">
                              <input type="color" value={recipe.bubbleColor} onChange={(e) => onUpdateColor(recipe.id, e.target.value)} className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer bg-transparent border-none p-0" />
                            </div>
                            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-50">RGB Shift</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                           <button onClick={() => handleShareClick(recipe)} className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-lg active:scale-90 transition-all" title="Download Rig for Friend">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                           </button>
                           <button onClick={() => onRemove(recipe.id)} className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <header className="mb-6 sm:mb-12">
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 sm:mb-2">UI Presets</h2>
                  <p className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] opacity-60">Visual Config Archives</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {presets.length === 0 ? (
                    <div className="sm:col-span-2 py-20 text-center opacity-40">
                      <p className="text-xl font-black italic">No UI configurations archived.</p>
                      <p className="text-xs uppercase tracking-widest mt-2 font-black">Use the 'Save UI' button in the main studio.</p>
                    </div>
                  ) : (
                    presets.map((preset) => (
                      <div key={preset.id} className="group relative flex flex-col p-6 rounded-[2.5rem] bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                          <div 
                            className="w-14 h-14 rounded-full flex-shrink-0 shadow-xl border-4 border-white/40 flex items-center justify-center"
                            style={{ backgroundColor: preset.bubbleColor }}
                          >
                             <div className="relative w-full h-full overflow-hidden rounded-full">
                                <input 
                                  type="color" 
                                  value={preset.bubbleColor} 
                                  onChange={(e) => onUpdatePresetColor(preset.id, e.target.value)} 
                                  className="absolute inset-[-20px] w-[300%] h-[300%] cursor-pointer opacity-0"
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xl font-black" style={{ color: getContrastColor(preset.bubbleColor) }}>
                                  {preset.name.charAt(0)}
                                </span>
                             </div>
                          </div>
                          <div>
                            <h3 className="text-base font-black tracking-tight">{preset.name}</h3>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{preset.theme} theme</p>
                          </div>
                          <button onClick={() => onRemovePreset(preset.id)} className="ml-auto p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-50">
                              <span>Grill</span>
                              <span>{preset.grillStyle}</span>
                           </div>
                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-50">
                              <span>Blade</span>
                              <span>{preset.knifeStyle}</span>
                           </div>
                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-50">
                              <span>Extras</span>
                              <span>{preset.highEyes ? 'High' : 'Sober'} • {preset.showChefHat ? 'Hat' : 'No Hat'}</span>
                           </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                           <span className="text-[7px] font-black opacity-30 uppercase">Added {new Date(preset.createdAt).toLocaleDateString()}</span>
                           <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ background: preset.saberColor }} />
                              <div className="w-2 h-2 rounded-full" style={{ background: preset.bubbleColor }} />
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
