import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Users,
  Eye,
  Headphones,
  ListMusic,
  Music,
  Plus,
  Link2,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Activity,
  Globe2,
  Radio,
  Sparkles,
  ArrowRight,
  LogOut,
  ExternalLink,
  Layers,
  BarChart3,
  Flame
} from 'lucide-react';
import {
  subscribeToAnalytics
} from '../services/analyticsService';
import {
  fetchCommunityPlaylists,
  fetchCommunityTracks,
  saveCommunityPlaylist,
  saveCommunityTrack,
  uploadCustomAudio,
  autoSyncDefaultPlaylistsToFirestore
} from '../services/communityService';
import { parseMusicUrl } from '../services/universalLinkParser';
import { db } from '../services/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

const ADMIN_PASSCODE_KEY = 'music_app_admin_passcode_v2';
const DEFAULT_PASSCODE = 'admin123';

export default function AdminView({ onExitToWebsite }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'import' | 'upload' | 'catalog' | 'settings'

  // Live Stats State
  const [stats, setStats] = useState({
    onlineUsers: 1,
    totalVisits: 1,
    totalStreams: 1
  });

  // Catalog State
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Importer Form State
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMsg, setImportMsg] = useState('');
  const [importError, setImportError] = useState('');

  // Uploader Form State
  const [uploadAudioFile, setUploadAudioFile] = useState(null);
  const [uploadImageFile, setUploadImageFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const [uploadGenre, setUploadGenre] = useState('Hindi');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMsg, setUploadMsg] = useState('');

  // Settings State
  const [currentPasscode, setCurrentPasscode] = useState(() => {
    return localStorage.getItem(ADMIN_PASSCODE_KEY) || DEFAULT_PASSCODE;
  });
  const [newPasscode, setNewPasscode] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  // Subscribe to real-time analytics
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = subscribeToAnalytics(setStats);
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Load catalog on auth
  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const [pl, tr] = await Promise.all([
        fetchCommunityPlaylists(50),
        fetchCommunityTracks(50)
      ]);
      setPlaylists(pl);
      setTracks(tr);
    } catch (err) {
      console.error('Catalog load error:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCatalog();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    const storedPasscode = localStorage.getItem(ADMIN_PASSCODE_KEY) || DEFAULT_PASSCODE;

    if (passcodeInput.trim() === storedPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect Admin Passcode. Try default: admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_logged_in');
  };

  // Handle URL Parsing & Publishing to Community
  const handleParseUrl = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImporting(true);
    setImportError('');
    setImportMsg('');
    setImportPreview(null);

    try {
      const data = await parseMusicUrl(importUrl.trim());
      setImportPreview(data);
    } catch (err) {
      setImportError(err.message || 'Failed to parse link.');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePublishImported = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    try {
      if (importPreview.type === 'playlist') {
        await saveCommunityPlaylist(importPreview.playlist);
        setImportMsg(`Playlist "${importPreview.playlist.name}" published to Community!`);
      } else {
        await saveCommunityTrack(importPreview.track);
        setImportMsg(`Track "${importPreview.track.title}" published to Community!`);
      }
      setImportPreview(null);
      setImportUrl('');
      loadCatalog();
    } catch (err) {
      setImportError('Failed to publish to Firebase Firestore.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle MP3 Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadAudioFile) return;

    setIsUploading(true);
    setUploadMsg('');
    setUploadProgress(0);

    try {
      const newTrack = await uploadCustomAudio({
        audioFile: uploadAudioFile,
        imageFile: uploadImageFile,
        metadata: {
          title: uploadTitle.trim() || uploadAudioFile.name,
          artist: uploadArtist.trim() || 'Admin Creator',
          genre: uploadGenre
        },
        onProgress: (p) => setUploadProgress(p)
      });

      setUploadMsg(`"${newTrack.title}" uploaded & live in Community!`);
      setUploadAudioFile(null);
      setUploadImageFile(null);
      setUploadTitle('');
      setUploadArtist('');
      loadCatalog();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete Items from Community
  const handleDeletePlaylist = async (playlistId) => {
    if (confirm('Delete this playlist from Community Firestore?')) {
      try {
        await deleteDoc(doc(db, 'community_playlists', playlistId));
        setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      } catch (e) {
        console.warn('Delete error:', e);
      }
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (confirm('Delete this track from Community Firestore?')) {
      try {
        await deleteDoc(doc(db, 'community_tracks', trackId));
        setTracks(prev => prev.filter(t => t.id !== trackId));
      } catch (e) {
        console.warn('Delete error:', e);
      }
    }
  };

  const handleSavePasscode = (e) => {
    e.preventDefault();
    if (newPasscode.trim().length >= 4) {
      localStorage.setItem(ADMIN_PASSCODE_KEY, newPasscode.trim());
      setCurrentPasscode(newPasscode.trim());
      setNewPasscode('');
      setSettingsMsg('Admin passcode updated successfully!');
      setTimeout(() => setSettingsMsg(''), 3000);
    }
  };

  // 1. LOGIN SCREEN (If not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-background-darkest flex items-center justify-center p-4 select-none relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-background-card/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-cyan to-accent-purple flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-accent-cyan/25 mb-4">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Secure area to manage music catalog, uploads, and live analytics
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Passcode / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter passcode (default: admin123)"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-cyanGlow text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-cyan/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Unlock Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <button
              onClick={onExitToWebsite}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Public Music App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen w-screen bg-background-darkest text-slate-100 flex flex-col select-none overflow-x-hidden">
      {/* Admin Top Navigation */}
      <header className="h-16 border-b border-white/10 bg-background-card/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-cyan to-accent-purple flex items-center justify-center text-slate-950 font-bold shadow-md">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
              M U S I C Admin Studio
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitToWebsite}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1 border border-rose-500/20 transition-colors"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8">
        {/* Top Real-Time Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Live Online Visitors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-background-card/80 to-background-darkest border border-emerald-500/30 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Live Active</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats.onlineUsers}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Online Users Right Now</p>
            </div>
          </div>

          {/* Total Website Visits */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background-card/80 border border-white/10 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Traffic</span>
              <Eye className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats.totalVisits}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Total Page Visits</p>
            </div>
          </div>

          {/* Total Song Plays */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background-card/80 border border-white/10 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Stream Plays</span>
              <Headphones className="w-4 h-4 text-accent-purple" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats.totalStreams}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Total Songs Streamed</p>
            </div>
          </div>

          {/* Total Community Playlists */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background-card/80 border border-white/10 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Playlists</span>
              <ListMusic className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
                {playlists.length}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Published Playlists</p>
            </div>
          </div>

          {/* Total Uploaded / Shared Tracks */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background-card/80 border border-white/10 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cloud Tracks</span>
              <Music className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
                {tracks.length}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Shared Songs in DB</p>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & Live Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'import'
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Import YouTube / Spotify</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload MP3 to Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manage Catalog ({playlists.length + tracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ACTIVITY */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Live Presence Box */}
              <div className="p-6 rounded-3xl bg-background-card/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Live Visitor Presence
                  </h3>
                  <span className="text-xs text-slate-400">Auto-refreshed via Firebase</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xl">
                    {stats.onlineUsers}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Active Listeners Online</p>
                    <p className="text-xs text-slate-400">Heartbeats monitored every 30 seconds</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Every visitor that loads the website is logged anonymously in Firebase Firestore so you can monitor live traffic anytime!
                </p>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-3xl bg-background-card/80 border border-white/10 space-y-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-cyan" />
                  Quick Admin Actions
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('import')}
                    className="p-4 rounded-2xl bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20 text-left transition-all"
                  >
                    <Link2 className="w-6 h-6 text-accent-cyan mb-2" />
                    <p className="font-bold text-xs text-white">Import YouTube Playlist</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Parse and add playlist</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('upload')}
                    className="p-4 rounded-2xl bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/20 text-left transition-all"
                  >
                    <Upload className="w-6 h-6 text-accent-purple mb-2" />
                    <p className="font-bold text-xs text-white">Upload Custom MP3</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Save to Firebase Storage</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT YOUTUBE / SPOTIFY PLAYLIST */}
        {activeTab === 'import' && (
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-background-card/90 border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Link2 className="w-6 h-6 text-accent-cyan" />
                Admin Music Importer
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Paste any YouTube video/playlist URL or Spotify link to publish for all website visitors.
              </p>
            </div>

            {importMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{importMsg}</span>
              </div>
            )}

            {importError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                {importError}
              </div>
            )}

            <form onSubmit={handleParseUrl} className="flex gap-2">
              <input
                type="url"
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste YouTube Playlist URL (e.g. youtube.com/playlist?list=...)"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
              />
              <button
                type="submit"
                disabled={isImporting || !importUrl.trim()}
                className="px-5 py-3 rounded-xl bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isImporting ? 'Scanning...' : 'Scan Link'}
              </button>
            </form>

            {/* Preview Card */}
            {importPreview && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={importPreview.type === 'playlist' ? importPreview.playlist.artwork : importPreview.track.artwork}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-accent-cyan/20 text-accent-cyan font-mono font-bold">
                      {importPreview.platform} {importPreview.type}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate mt-1">
                      {importPreview.type === 'playlist' ? importPreview.playlist.name : importPreview.track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {importPreview.type === 'playlist'
                        ? `${importPreview.playlist.tracks.length} tracks • By ${importPreview.playlist.author}`
                        : importPreview.track.artist}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePublishImported}
                  disabled={isImporting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-cyanGlow text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>Publish to Public Community Feed</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPLOAD MP3 TO FIREBASE */}
        {activeTab === 'upload' && (
          <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-background-card/90 border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Upload className="w-6 h-6 text-accent-purple" />
                Upload MP3 to Firebase Storage
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload audio files directly to your Firebase Storage bucket (`music-ebee4`).
              </p>
            </div>

            {uploadMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{uploadMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Audio File (.mp3, .wav) *</label>
                <input
                  type="file"
                  accept="audio/*"
                  required
                  onChange={(e) => setUploadAudioFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Cover Artwork (.jpg, .png)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Track Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Kesariya Remix"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={uploadArtist}
                    onChange={(e) => setUploadArtist(e.target.value)}
                    placeholder="e.g. Arijit Singh"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Language / Genre</label>
                <select
                  value={uploadGenre}
                  onChange={(e) => setUploadGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-card border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="Hindi">Hindi (Bollywood)</option>
                  <option value="Punjabi">Punjabi Hits</option>
                  <option value="Bhojpuri">Bhojpuri</option>
                  <option value="English">English Pop / Hip-Hop</option>
                  <option value="Haryanvi">Haryanvi</option>
                  <option value="South Indian">South (Tamil / Telugu)</option>
                  <option value="Lo-Fi">Lo-Fi & Chill</option>
                  <option value="EDM">EDM / Electronic</option>
                </select>
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Uploading to Storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-accent-cyan"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !uploadAudioFile}
                className="w-full py-3 rounded-xl bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
              >
                {isUploading ? `Uploading ${uploadProgress}%...` : 'Publish MP3 to Community'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: MANAGE CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg text-white">Community Playlists & Tracks Manager</h3>
                <p className="text-xs text-slate-400">Manage all artist playlists & songs stored in the database</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await autoSyncDefaultPlaylistsToFirestore();
                    await loadCatalog();
                    alert('Official artist playlists & songs successfully synced to Firebase Firestore database!');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 text-accent-cyan text-xs font-bold flex items-center gap-1.5 border border-accent-cyan/30 transition-all"
                  title="Sync all verified YouTube artist playlists to DB"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sync Official Artist Playlists</span>
                </button>

                <button
                  onClick={loadCatalog}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>
            </div>

            {/* Playlists list */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                Imported Playlists ({playlists.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {playlists.map(pl => (
                  <div key={pl.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={pl.artwork} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-800 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{pl.name}</h4>
                        <p className="text-[11px] text-slate-400">{pl.tracks?.length || 1} tracks • {pl.source}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePlaylist(pl.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracks list */}
            <div className="space-y-3 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-purple">
                Shared Songs in DB ({tracks.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tracks.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={t.artwork} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{t.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{t.artist} • {t.genre}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTrack(t.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Delete Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-background-card/90 border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Lock className="w-6 h-6 text-accent-cyan" />
                Admin Passcode Settings
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Change your admin login passcode anytime.
              </p>
            </div>

            {settingsMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{settingsMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Passcode</label>
                <input
                  type="password"
                  required
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode (min 4 characters)"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-accent-cyan text-slate-950 font-bold text-xs"
              >
                Update Admin Passcode
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
