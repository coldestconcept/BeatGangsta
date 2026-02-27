import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ExternalLink, HelpCircle } from 'lucide-react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  theme: 'coldest' | 'chef-mode' | 'crazy-bird' | 'hustle-time';
}

export const APIKeyModal: React.FC<APIKeyModalProps> = ({ isOpen, onClose, onSave, theme }) => {
  const [step, setStep] = useState<'intro' | 'input'>('intro');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setApiKey('');
      setError(null);
      setShowHelp(false);
      
      // Check for existing key in localStorage
      const savedKey = localStorage.getItem('bg_gemini_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }

    // Basic validation (Gemini keys usually start with AIza)
    if (!apiKey.trim().startsWith('AIza')) {
      setError("Invalid API Key format. It should start with 'AIza'.");
      return;
    }

    localStorage.setItem('bg_gemini_api_key', apiKey.trim());
    onSave(apiKey.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-md p-8 rounded-[2rem] border shadow-2xl relative overflow-hidden ${theme === 'coldest' ? 'bg-white border-slate-200 text-slate-900' : theme === 'chef-mode' ? 'bg-white border-orange-200 text-slate-900' : 'bg-[#0a0a0a] border-white/10 text-white'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all ${theme === 'coldest' ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
        >
          <X size={20} />
        </button>

        {step === 'intro' ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-black tracking-tighter">Hi, Producer! 👋</h2>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              Thank you for using BeatGangsta x ColdestConcept. We are a small startup, and using advanced AI models to analyze your plugins and generate recipes is costly.
            </p>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              To keep this service free and working for everyone, we require you to use your own <span className="font-bold text-sky-500">Gemini API Key</span>.
            </p>
            <p className="text-xs font-bold opacity-50 uppercase tracking-widest">
              It's free, easy to get, and keeps your data private.
            </p>
            <button 
              onClick={() => setStep('input')}
              className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${theme === 'coldest' ? 'bg-sky-500 text-white shadow-sky-200' : theme === 'chef-mode' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white text-black shadow-white/20'} shadow-lg`}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tighter mb-2">Enter Your API Key</h2>
              <p className="text-xs font-bold opacity-50">Your key is stored locally in your browser.</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                  }}
                  placeholder="Paste your Gemini API Key here..."
                  className={`w-full py-4 pl-6 pr-12 rounded-xl text-sm font-bold outline-none border-2 transition-all ${theme === 'coldest' ? 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900' : 'bg-white/5 border-white/10 focus:border-white/30 text-white'}`}
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showKey ? (theme === 'coldest' ? 'bg-sky-500 border-sky-500' : 'bg-white border-white') : 'border-current opacity-30'}`}>
                    {showKey && <div className={`w-2 h-2 rounded-sm ${theme === 'coldest' ? 'bg-white' : 'bg-black'}`} />}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={showKey} 
                    onChange={(e) => setShowKey(e.target.checked)}
                    className="hidden" 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 group-hover:opacity-80 transition-opacity">
                    {showKey ? 'Hide Entry' : 'Show Entry'}
                  </span>
                </label>

                <a 
                  href="https://aistudio.google.com/app/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:underline ${theme === 'coldest' ? 'text-sky-600' : theme === 'chef-mode' ? 'text-orange-600' : 'text-sky-400'}`}
                >
                  Get free API Key <ExternalLink size={10} />
                </a>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave}
                className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${theme === 'coldest' ? 'bg-sky-500 text-white shadow-sky-200' : theme === 'chef-mode' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white text-black shadow-white/20'} shadow-lg`}
              >
                Save & Continue
              </button>
              
              <button 
                onClick={() => setShowHelp(true)}
                className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
              >
                <HelpCircle size={12} />
                What do I do on that link?
              </button>
            </div>

            <div className="pt-4 border-t border-dashed border-current/10">
              <p className="text-[10px] font-medium opacity-40 text-center leading-tight">
                <span className="font-bold text-red-500">Security Warning:</span> Never use this on a public computer without clearing your browser data afterwards. Your key is saved in this browser's Local Storage.
              </p>
            </div>
          </div>
        )}

        {/* Help Popup Overlay */}
        {showHelp && (
          <div className="absolute inset-0 z-20 bg-inherit flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex items-center justify-between sticky top-0 bg-inherit pb-4 border-b border-current/10 z-10">
                <h3 className="text-lg font-black">How to get a Key</h3>
                <button onClick={() => setShowHelp(false)} className="p-1 opacity-50 hover:opacity-100"><X size={16} /></button>
              </div>
              
              <div className="space-y-4 text-sm opacity-80">
                <p>1. Click the <span className="font-bold">"Get free API Key"</span> link. It will open Google AI Studio.</p>
                <p>2. Sign in with your Google account.</p>
                <p>3. Click the blue <span className="font-bold">"Create API key"</span> button.</p>
                <p>4. Select any project (or create a new one).</p>
                <p>5. Copy the key that starts with <code className="bg-black/10 px-1 rounded">AIza...</code></p>
                <p>6. Paste it back here!</p>
                
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 mt-4">
                  <p className="text-xs font-bold text-sky-500 mb-1">Why do I need this?</p>
                  <p className="text-xs opacity-80">
                    We use Google's Gemini Pro model to analyze your plugins. It's powerful but costs money per request. By using your own free tier key, you get the same powerful features without us having to charge a subscription fee!
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-current/10 bg-inherit">
              <button 
                onClick={() => setShowHelp(false)}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${theme === 'coldest' ? 'border-slate-200 hover:bg-slate-50' : 'border-white/20 hover:bg-white/10'}`}
              >
                Close Help
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
