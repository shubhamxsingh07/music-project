import React, { useState } from 'react';
import { Sparkles, Check, Globe2, Music, UserCheck, ArrowRight, ArrowLeft, X, Plus } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const AVAILABLE_LANGUAGES = [
  { id: 'hindi', label: 'Hindi (Bollywood)', icon: '🇮🇳', color: 'from-orange-500 to-amber-500', query: 'Hindi Bollywood' },
  { id: 'punjabi', label: 'Punjabi Hits', icon: '🔥', color: 'from-red-500 to-orange-600', query: 'Punjabi' },
  { id: 'bhojpuri', label: 'Bhojpuri', icon: '🪕', color: 'from-yellow-500 to-amber-600', query: 'Bhojpuri' },
  { id: 'english', label: 'English (Pop / Hip-Hop)', icon: '🌍', color: 'from-blue-500 to-indigo-600', query: 'Pop' },
  { id: 'haryanvi', label: 'Haryanvi', icon: '⚡', color: 'from-emerald-500 to-teal-600', query: 'Haryanvi' },
  { id: 'south', label: 'South (Tamil / Telugu)', icon: '🌴', color: 'from-purple-500 to-pink-600', query: 'Tamil Telugu' },
  { id: 'lofi', label: 'Lo-Fi & Chillout', icon: '☕', color: 'from-teal-400 to-cyan-500', query: 'Lo-Fi' },
  { id: 'edm', label: 'EDM & Electronic', icon: '🎧', color: 'from-cyan-500 to-blue-500', query: 'Electronic' },
  { id: 'rap', label: 'Desi Hip-Hop & Rap', icon: '🎤', color: 'from-fuchsia-500 to-rose-600', query: 'Hip Hop' },
  { id: 'sufi', label: 'Sufi & Acoustic', icon: '✨', color: 'from-amber-400 to-orange-500', query: 'Sufi Acoustic' },
];

const POPULAR_ARTIST_SUGGESTIONS = [
  { name: 'Arijit Singh', lang: 'Hindi' },
  { name: 'Diljit Dosanjh', lang: 'Punjabi' },
  { name: 'AP Dhillon', lang: 'Punjabi' },
  { name: 'Sidhu Moosewala', lang: 'Punjabi' },
  { name: 'Pawan Singh', lang: 'Bhojpuri' },
  { name: 'Khesari Lal Yadav', lang: 'Bhojpuri' },
  { name: 'Karan Aujla', lang: 'Punjabi' },
  { name: 'Badshah', lang: 'Hindi' },
  { name: 'Shreya Ghoshal', lang: 'Hindi' },
  { name: 'Taylor Swift', lang: 'English' },
  { name: 'Drake', lang: 'English' },
  { name: 'Alan Walker', lang: 'EDM' },
  { name: 'The Weeknd', lang: 'English' },
  { name: 'Skrillex', lang: 'EDM' },
  { name: 'Atif Aslam', lang: 'Hindi' },
];

export default function OnboardingModal() {
  const { isOnboardingOpen, setIsOnboardingOpen, userPreferences, saveUserPreferences } = useMusicPlayer();

  const [step, setStep] = useState(1);
  const [selectedLangs, setSelectedLangs] = useState(userPreferences.languages || ['hindi', 'punjabi']);
  const [selectedArtists, setSelectedArtists] = useState(userPreferences.artists || ['Arijit Singh', 'Diljit Dosanjh']);
  const [customArtistInput, setCustomArtistInput] = useState('');

  if (!isOnboardingOpen) return null;

  const toggleLanguage = (langId) => {
    setSelectedLangs(prev =>
      prev.includes(langId) ? prev.filter(l => l !== langId) : [...prev, langId]
    );
  };

  const toggleArtist = (artistName) => {
    setSelectedArtists(prev =>
      prev.includes(artistName) ? prev.filter(a => a !== artistName) : [...prev, artistName]
    );
  };

  const handleAddCustomArtist = (e) => {
    e.preventDefault();
    if (customArtistInput.trim() && !selectedArtists.includes(customArtistInput.trim())) {
      setSelectedArtists(prev => [...prev, customArtistInput.trim()]);
      setCustomArtistInput('');
    }
  };

  const handleFinish = () => {
    saveUserPreferences({
      languages: selectedLangs.length > 0 ? selectedLangs : ['hindi', 'punjabi', 'english'],
      artists: selectedArtists.length > 0 ? selectedArtists : ['Arijit Singh', 'Diljit Dosanjh'],
      isCompleted: true
    });
    setIsOnboardingOpen(false);
  };

  const handleSkip = () => {
    saveUserPreferences({
      languages: selectedLangs.length > 0 ? selectedLangs : ['hindi', 'punjabi', 'english'],
      artists: selectedArtists,
      isCompleted: true
    });
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300 select-none">
      <div
        className="w-full max-w-2xl bg-background-card/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-cyan/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent-purple/15 rounded-full filter blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-accent-cyan/15 text-accent-cyan text-xs font-bold font-mono">
              Step {step} of 2
            </span>
            <span className="text-xs text-slate-400 font-medium">Personalize Your Music Vibe</span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* STEP 1: Select Languages & Categories */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto space-y-6 relative z-10 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Globe2 className="w-7 h-7 text-accent-cyan" />
                What music languages do you like?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select your preferred languages and genres to customize your stream and recommendations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLangs.includes(lang.id);

                return (
                  <button
                    key={lang.id}
                    onClick={() => toggleLanguage(lang.id)}
                    className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-accent-cyan/15 border-accent-cyan shadow-lg shadow-accent-cyan/10 ring-1 ring-accent-cyan'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-2xl">{lang.icon}</span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-accent-cyan text-slate-950' : 'border border-white/20 opacity-40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold truncate ${
                      isSelected ? 'text-accent-cyan' : 'text-slate-200'
                    }`}>
                      {lang.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Select Favorite Artists */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto space-y-6 relative z-10 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Music className="w-7 h-7 text-accent-purple" />
                Who are your favorite artists?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Pick from popular creators or type your favorite singers & bands below.
              </p>
            </div>

            {/* Custom Artist Input */}
            <form onSubmit={handleAddCustomArtist} className="flex gap-2">
              <input
                type="text"
                value={customArtistInput}
                onChange={(e) => setCustomArtistInput(e.target.value)}
                placeholder="Type an artist name (e.g. Arijit Singh, Sidhu Moosewala)..."
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
              />
              <button
                type="submit"
                disabled={!customArtistInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>

            {/* Selected Artists Chips */}
            {selectedArtists.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Selected Artists ({selectedArtists.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedArtists.map(artist => (
                    <span
                      key={artist}
                      onClick={() => toggleArtist(artist)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-cyan text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent-cyan/20 hover:bg-rose-400 transition-colors group"
                      title="Click to remove"
                    >
                      <span>{artist}</span>
                      <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Artist Suggestions Grid */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Popular Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_ARTIST_SUGGESTIONS.map((item) => {
                  const isSelected = selectedArtists.includes(item.name);

                  return (
                    <button
                      key={item.name}
                      onClick={() => toggleArtist(item.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-accent-purple/20 border-accent-purple text-accent-purple font-bold'
                          : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({item.lang})</span>
                      {isSelected ? (
                        <Check className="w-3 h-3 text-accent-purple" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-accent-cyan/25 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-cyanGlow text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-accent-cyan/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Streaming Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
