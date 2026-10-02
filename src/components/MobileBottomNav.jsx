import React from 'react';
import { Compass, Search, Users, Heart, Globe2 } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

export default function MobileBottomNav() {
  const { currentView, setCurrentView, likedTracks, setSelectedPlaylistId } = useMusicPlayer();

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'liked', label: 'Liked', icon: Heart, badge: likedTracks.length > 0 ? likedTracks.length : null },
    { id: 'community', label: 'Community', icon: Globe2 }
  ];

  const handleNavClick = (viewId) => {
    setSelectedPlaylistId(null);
    setCurrentView(viewId);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background-darkest/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-accent-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {item.badge && (
                <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center font-mono">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-accent-cyan' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
