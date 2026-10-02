import React, { useState, useEffect } from 'react';
import { useMusicPlayer } from './context/MusicPlayerContext';
import { initVisitorAnalytics } from './services/analyticsService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MasterPlayer from './components/MasterPlayer';
import QueueDrawer from './components/QueueDrawer';
import FullScreenPlayer from './components/FullScreenPlayer';
import PlaylistModal from './components/PlaylistModal';
import YouTubeBackgroundPlayer from './components/YouTubeBackgroundPlayer';
import MobileBottomNav from './components/MobileBottomNav';

// Views
import DiscoverView from './views/DiscoverView';
import SearchView from './views/SearchView';
import ArtistsView from './views/ArtistsView';
import ArtistDetailView from './views/ArtistDetailView';
import LikedSongsView from './views/LikedSongsView';
import PlaylistView from './views/PlaylistView';
import HistoryView from './views/HistoryView';
import CommunityView from './views/CommunityView';
import AdminView from './views/AdminView';
import NowPlayingView from './views/NowPlayingView';

export default function App() {
  const { currentView, setCurrentView } = useMusicPlayer();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize live presence tracking & visitor analytics on app mount
  useEffect(() => {
    initVisitorAnalytics();

    // Check if initial route is /admin or #admin
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || hash === '#admin') {
      setCurrentView('admin');
    }

    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p === '/admin' || h === '#admin') {
        setCurrentView('admin');
      } else if (currentView === 'admin') {
        setCurrentView('discover');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleExitAdmin = () => {
    setCurrentView('discover');
    if (window.location.pathname.toLowerCase() === '/admin' || window.location.hash.toLowerCase() === '#admin') {
      window.history.pushState({}, '', '/');
    }
  };

  // If in Admin Portal Mode, render full-page dedicated Admin Studio
  if (currentView === 'admin') {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-background-darkest text-slate-100 select-none">
        <AdminView onExitToWebsite={handleExitAdmin} />
      </div>
    );
  }

  // Render active view based on currentView state
  const renderActiveView = () => {
    switch (currentView) {
      case 'discover':
        return <DiscoverView />;
      case 'search':
        return <SearchView />;
      case 'artists':
        return <ArtistsView />;
      case 'artist-detail':
        return <ArtistDetailView />;
      case 'liked':
        return <LikedSongsView />;
      case 'playlist':
        return <PlaylistView />;
      case 'history':
        return <HistoryView />;
      case 'community':
        return <CommunityView />;
      case 'now-playing':
        return <NowPlayingView />;
      default:
        return <DiscoverView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-darkest text-slate-100 select-none">
      {/* 1. Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Main Content & Top Header Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-gradient-to-b from-[#0e1626] to-background-darkest pb-14 lg:pb-0">
        {/* Top Header Navbar */}
        <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        {/* Scrollable Main Views Canvas */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>

        {/* 3. Bottom Master Audio Player */}
        <MasterPlayer />
      </div>

      {/* 4. Background Audio Engines & Global Modals */}
      <YouTubeBackgroundPlayer />
      <QueueDrawer />
      <FullScreenPlayer />
      <PlaylistModal />
      <MobileBottomNav />
    </div>
  );
}
