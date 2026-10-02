/**
 * YouTube Data API v3 Service
 * - Search songs (DB first, then API)
 * - Fetch India trending music
 * - Auto-save songs to Firebase so future plays work without API
 */

import { db } from './firebase';
import {
  doc, getDoc, setDoc, collection,
  query, orderBy, limit as fbLimit,
  getDocs, serverTimestamp, increment, updateDoc
} from 'firebase/firestore';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const BASE    = 'https://www.googleapis.com/youtube/v3';

// Collection where all YT songs are cached
const SONGS_COL = 'yt_songs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** HD thumbnail (hqdefault 480×360) displayed in a small card */
function thumb(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Convert ISO 8601 duration (PT3M45S) → seconds */
function parseDuration(iso) {
  if (!iso) return 210;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 210;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-');
}

/**
 * Intelligent Music Metadata Cleaner
 * Transforms messy raw YouTube video titles into clean, elegant Spotify/Apple Music titles & artists.
 */
export function cleanMusicMetadata(rawTitle, rawArtist) {
  if (!rawTitle) return { title: 'Unknown Track', artist: rawArtist || 'Various Artists' };

  let title = decodeHtml(rawTitle);
  let artist = decodeHtml(rawArtist || '').replace(/ - Topic/gi, '').trim();

  // 1. Remove emojis and special aesthetic symbols
  title = title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}❤️💥♫✓🎧]/gu, '').trim();

  // 2. Remove common YouTube noise phrases
  const noisePhrases = [
    /\b(full video song|official video song|official music video|official video|official audio|lyrical video|lyric video|lyrics video|audio song|video song|full song|full audio|full video|4k video|hd video|hd audio|8k video|4k|hd|hq)\b/gi,
    /\b(new haryanvi song \d{4}|new punjabi song \d{4}|new bhojpuri song \d{4}|new hindi song \d{4}|new song \d{4})\b/gi,
    /\b(superhit audio jukebox \d{4}|superhit songs|nonstop audio|audio jukebox|video jukebox|all hit songs|superhit song|top \d+ songs|hit \d+ song)\b/gi,
    /\b(slowed \+ reverb|slowed reverb|slowed and reverb|lofi remix|lofi mix|lo-fi mix|chill mix|night chills|bass boosted)\b/gi
  ];

  for (const regex of noisePhrases) {
    title = title.replace(regex, '');
  }

  // 3. Remove bracketed promotional noise, empty brackets, and hashtags
  title = title
    .replace(/\s*\((?:official|video|audio|lyric|full|4k|hd|prod|feat|ft\.|music).*?\)/gi, '')
    .replace(/\s*\[(?:official|video|audio|lyric|full|4k|hd|prod|feat|ft\.|music).*?\]/gi, '')
    .replace(/\s*#[a-zA-Z0-9_]+/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 4. Popular singers dictionary for auto-detection in titles
  const POPULAR_ARTISTS = [
    'Arijit Singh', 'Shreya Ghoshal', 'Atif Aslam', 'Neha Kakkar', 'Jubin Nautiyal',
    'Diljit Dosanjh', 'Sonu Nigam', 'Sunidhi Chauhan', 'Badshah', 'Yo Yo Honey Singh',
    'Armaan Malik', 'B Praak', 'Kishore Kumar', 'Lata Mangeshkar', 'Kumar Sanu',
    'Alka Yagnik', 'Anuv Jain', 'AP Dhillon', 'Karan Aujla', 'Sidhu Moose Wala',
    'Pritam', 'A.R. Rahman', 'Vishal Mishra', 'Darshan Raval', 'Sachin-Jigar',
    'Pawan Singh', 'Khesari Lal Yadav', 'Shilpi Raj', 'Masoom Sharma', 'Sapna Choudhary',
    'Renuka Panwar', 'Akhil', 'Parmish Verma', 'Gurnam Bhullar', 'Surjit Bhullar',
    'Alan Walker', 'The Weeknd', 'Bruno Mars', 'Lady Gaga', 'Dua Lipa', 'Ed Sheeran'
  ];

  let detectedArtist = '';
  for (const pa of POPULAR_ARTISTS) {
    if (new RegExp(`\\b${pa}\\b`, 'i').test(rawTitle)) {
      detectedArtist = pa;
      break;
    }
  }

  // 5. Split title by dividers: | , - , /
  const parts = title.split(/[|/]/).map(p => p.trim()).filter(Boolean);
  let cleanTitle = parts[0] || title;

  if (cleanTitle.includes(' - ')) {
    const dashParts = cleanTitle.split(' - ').map(p => p.trim()).filter(Boolean);
    cleanTitle = dashParts[0];
  }

  cleanTitle = cleanTitle.replace(/[-|:,_]+$/, '').replace(/^[-|:,_]+/, '').trim();
  cleanTitle = cleanTitle.replace(/\s+Song$/i, '').trim();

  const isLabel = /t-?series|sony|zee|yrf|tips|saregama|speed|eros|geet|white hill|venus|aditya|lahari|speed records|folk station|vats records|crown records|sleepnest/i.test(artist);

  let finalArtist = artist;
  if (detectedArtist) {
    finalArtist = detectedArtist;
  } else if (isLabel) {
    if (parts.length > 1 && parts[1].length < 30) {
      finalArtist = parts[1];
    } else {
      finalArtist = 'Bollywood Hits';
    }
  }

  return {
    title: cleanTitle || rawTitle,
    artist: finalArtist || 'Various Artists'
  };
}

/** Format any track object with clean metadata */
export function formatTrack(track) {
  if (!track) return track;
  const cleaned = cleanMusicMetadata(track.title, track.artist);
  return {
    ...track,
    title: cleaned.title,
    artist: cleaned.artist,
    rawTitle: track.rawTitle || track.title,
    rawArtist: track.rawArtist || track.artist
  };
}

/** Map raw YouTube snippet → internal track object */
function toTrack(videoId, snippet, contentDetails) {
  const rawTitle = decodeHtml(snippet.title || '');
  const rawArtist = decodeHtml(snippet.channelTitle || '');
  const cleaned = cleanMusicMetadata(rawTitle, rawArtist);

  return {
    id:          videoId,
    youtubeId:   videoId,
    source:      'youtube',
    title:       cleaned.title,
    artist:      cleaned.artist,
    rawTitle:    rawTitle,
    rawArtist:   rawArtist,
    album:       '',
    thumbnail:   thumb(videoId),
    duration:    parseDuration(contentDetails?.duration),
    publishedAt: snippet.publishedAt,
    tags:        snippet.tags || [],
  };
}

// ─── Save to DB (Deduplication Guaranteed via unique youtubeId doc key) ──────

/**
 * Save a track to Firebase so it can be played later without the API.
 * Uses track.youtubeId as Document ID — guarantees NO DUPLICATE copies even if 1000 users click.
 */
export async function saveSongToDB(track, genre = '') {
  if (!track?.youtubeId) return;
  const cleaned = cleanMusicMetadata(track.title, track.artist);

  try {
    const ref = doc(db, SONGS_COL, track.youtubeId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // Already saved — simply bump playCount, no duplicate document is created
      await updateDoc(ref, {
        playCount: increment(1),
        lastPlayedAt: serverTimestamp(),
        title: cleaned.title,
        artist: cleaned.artist,
        ...(genre ? { genre } : {})
      });
    } else {
      await setDoc(ref, {
        id:          track.youtubeId,
        youtubeId:   track.youtubeId,
        source:      'youtube',
        title:       cleaned.title,
        artist:      cleaned.artist,
        rawTitle:    track.rawTitle || track.title || 'Unknown',
        rawArtist:   track.rawArtist || track.artist || '',
        thumbnail:   track.thumbnail || thumb(track.youtubeId),
        duration:    track.duration || 210,
        genre:       genre || track.genre || 'Hindi',
        playCount:   1,
        savedAt:     serverTimestamp(),
        lastPlayedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn('saveSongToDB error:', e);
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

function detectGenreFromQuery(query, channel = '') {
  const q = `${query} ${channel}`.toLowerCase();
  if (q.includes('bhojpuri') || q.includes('pawan') || q.includes('khesari') || q.includes('shutter') || q.includes('satar')) return 'Bhojpuri';
  if (q.includes('punjabi') || q.includes('diljit') || q.includes('karan') || q.includes('sidhu') || q.includes('dhillon')) return 'Punjabi';
  if (q.includes('haryanvi') || q.includes('sapna')) return 'Haryanvi';
  if (q.includes('english') || q.includes('pop') || q.includes('hip hop')) return 'English';
  if (q.includes('lofi') || q.includes('lo-fi')) return 'Lo-Fi';
  if (q.includes('tamil') || q.includes('telugu')) return 'South Indian';
  return 'Hindi';
}

/**
 * Search for songs across Bollywood, Bhojpuri, Punjabi, and all genres.
 * Strategy:
 *   1. Check Firebase DB for cached results (Instant 0ms, Quota-Proof).
 *   2. If 0 DB matches, search live YouTube via /api/yt-search or YouTube Data API.
 *   3. Auto-cache freshly discovered songs into Firebase DB so subsequent plays & searches load from DB instantly.
 */
export async function searchYouTubeSongs(rawQuery) {
  const query_ = rawQuery.trim();
  if (!query_) return [];

  // ── Step 1: DB check (Fast, 0ms, Quota-Proof) ─────────────────────────────
  let dbMatches = [];
  try {
    const snap = await getDocs(collection(db, SONGS_COL));
    const lower = query_.toLowerCase();
    const allTracks = [];
    snap.forEach(d => allTracks.push(d.data()));

    // 1. Exact phrase / substring match
    dbMatches = allTracks.filter(t => {
      const title = (t.title || '').toLowerCase();
      const artist = (t.artist || '').toLowerCase();
      const rawTitle = (t.rawTitle || '').toLowerCase();
      const genre = (t.genre || '').toLowerCase();
      return (
        title.includes(lower) ||
        artist.includes(lower) ||
        rawTitle.includes(lower) ||
        genre.includes(lower)
      );
    });

    // 2. Word-by-word token matching if no exact phrase match
    if (dbMatches.length === 0) {
      const words = lower
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length >= 3 && !['song', 'songs', 'hit', 'hits', 'video', 'music'].includes(w));

      if (words.length > 0) {
        dbMatches = allTracks.filter(t => {
          const haystack = `${t.title || ''} ${t.artist || ''} ${t.rawTitle || ''} ${t.genre || ''}`.toLowerCase();
          return words.some(w => haystack.includes(w));
        });
      }
    }

    if (dbMatches.length > 0) {
      return dbMatches.map(formatTrack).slice(0, 8);
    }
  } catch (err) {
    console.warn('DB search error:', err);
  }

  // ── Step 2: Live YouTube Search (/api/yt-search proxy or YouTube Data API) ──
  const detectedGenre = detectGenreFromQuery(query_);

  // A) Try /api/yt-search (unlimited, zero-quota, direct YouTube search)
  try {
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(query_)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.items && json.items.length > 0) {
        const liveTracks = json.items.map(t => ({
          ...t,
          genre: detectedGenre
        }));

        // Auto-save to Firestore in background
        liveTracks.forEach(track => {
          saveSongToDB(track, detectedGenre).catch(() => {});
        });

        return liveTracks.map(formatTrack).slice(0, 8);
      }
    }
  } catch (e) {
    console.warn('Live /api/yt-search error, attempting YouTube API:', e);
  }

  // B) Fallback to YouTube Data API (without forcing 'bollywood song')
  try {
    const searchRes = await fetch(
      `${BASE}/search?part=snippet&type=video&videoCategoryId=10&regionCode=IN` +
      `&q=${encodeURIComponent(query_ + ' song')}&maxResults=8` +
      `&key=${API_KEY}`
    );
    const searchJson = await searchRes.json();
    if (searchJson.items && searchJson.items.length > 0) {
      const videoIds = searchJson.items.map(i => i.id.videoId).filter(Boolean).join(',');
      if (videoIds) {
        const detailRes = await fetch(
          `${BASE}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${API_KEY}`
        );
        const detailJson = await detailRes.json();

        const tracks = (detailJson.items || [])
          .filter(v => v.status?.embeddable !== false)
          .map(v => toTrack(v.id, v.snippet, v.contentDetails));

        tracks.forEach(track => {
          saveSongToDB(track, detectedGenre).catch(() => {});
        });

        return tracks.map(formatTrack).slice(0, 8);
      }
    }
  } catch (e) {
    console.warn('YouTube search API error:', e);
  }

  // If literally no results anywhere, return empty list (do not show unrelated songs)
  return [];
}

// ─── Trending ─────────────────────────────────────────────────────────────────

/**
 * Fetch trending Bollywood songs.
 * Merges:
 *   A) YouTube India trending (videoCategoryId=10 = Music)
 *   B) DB most-played songs
 * Deduplicates and returns up to 20.
 */
export async function fetchTrendingSongs(maxResults = 20) {
  const results = [];
  const seen    = new Set();

  // ── A) YouTube trending India ─────────────────────────────────────────────
  try {
    const ytRes = await fetch(
      `${BASE}/videos?part=snippet,contentDetails,status` +
      `&chart=mostPopular&videoCategoryId=10&regionCode=IN` +
      `&maxResults=10&key=${API_KEY}`
    );
    const ytJson = await ytRes.json();
    (ytJson.items || [])
      .filter(v => v.status?.embeddable !== false)
      .forEach(v => {
        const t = toTrack(v.id, v.snippet, v.contentDetails);
        if (!seen.has(t.youtubeId)) {
          seen.add(t.youtubeId);
          results.push({ ...t, _source: 'youtube_trending' });
        }
      });
  } catch (e) {
    console.warn('Trending API error:', e);
  }

  // ── B) DB most-played songs ───────────────────────────────────────────────
  try {
    const snap = await getDocs(
      query(collection(db, SONGS_COL), orderBy('playCount', 'desc'), fbLimit(10))
    );
    snap.forEach(d => {
      const t = d.data();
      if (!seen.has(t.youtubeId)) {
        seen.add(t.youtubeId);
        results.push({ ...t, _source: 'db_popular' });
      }
    });
  } catch (e) {
    console.warn('DB trending fetch error:', e);
  }

  return results.slice(0, maxResults);
}

// ─── Artist Discography / Playlist ────────────────────────────────────────────

/**
 * Fetch top tracks / playlist for a specific artist
 */
export async function fetchArtistDiscography(artistName, maxResults = 15) {
  if (!artistName?.trim()) return [];
  const query_ = artistName.trim();

  // 1. Try DB first for any cached tracks of this artist
  const dbTracks = [];
  try {
    const snap = await getDocs(collection(db, SONGS_COL));
    const lower = query_.toLowerCase();
    snap.forEach(d => {
      const t = d.data();
      if (
        t.artist?.toLowerCase().includes(lower) ||
        t.title?.toLowerCase().includes(lower)
      ) {
        dbTracks.push(t);
      }
    });
    if (dbTracks.length > 0) {
      return dbTracks.map(formatTrack).slice(0, maxResults);
    }
  } catch (_) {}

  // 2. Fetch from API
  try {
    const searchRes = await fetch(
      `${BASE}/search?part=snippet&type=video&videoCategoryId=10&regionCode=IN` +
      `&q=${encodeURIComponent(query_ + ' best songs hits')}&maxResults=${maxResults}` +
      `&key=${API_KEY}`
    );
    const searchJson = await searchRes.json();
    if (!searchJson.items?.length) return dbTracks.map(formatTrack).slice(0, maxResults);

    const videoIds = searchJson.items.map(i => i.id.videoId).join(',');

    const detailRes = await fetch(
      `${BASE}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${API_KEY}`
    );
    const detailJson = await detailRes.json();

    const apiTracks = (detailJson.items || [])
      .filter(v => v.status?.embeddable !== false)
      .map(v => toTrack(v.id, v.snippet, v.contentDetails));

    apiTracks.forEach(track => {
      saveSongToDB(track, 'Hindi').catch(() => {});
    });

    const combined = [...dbTracks, ...apiTracks];
    const unique = combined.filter((t, idx, self) =>
      idx === self.findIndex(x => x.youtubeId === t.youtubeId)
    );

    return unique.map(formatTrack).slice(0, maxResults);
  } catch (e) {
    console.warn('Artist discography API error:', e);
    return dbTracks.map(formatTrack).slice(0, maxResults);
  }
}

// ─── Genre Songs Fetcher & Deduplicated DB Storer ────────────────────────────

/**
 * Fetch songs for a given genre / tab (Hindi, Punjabi, Bhojpuri, Romance, etc.)
 * DB-FIRST: Loads directly from Firestore yt_songs so Discover & Charts loads instantly without API quota issues.
 */
export async function fetchGenreSongs(genreName, maxResults = 30) {
  const targetGenre = (!genreName || genreName === 'All') ? 'Hindi' : genreName.trim();
  const lowerGenre = targetGenre.toLowerCase();

  // ── Step 1: Fetch directly from Firestore DB (Instant & 0 Quota) ───────────
  try {
    const snap = await getDocs(collection(db, SONGS_COL));
    const allTracks = [];
    snap.forEach(d => allTracks.push(d.data()));

    const matched = allTracks.filter(t => {
      const tGenre = (t.genre || '').toLowerCase();
      const tTitle = (t.title || '').toLowerCase();
      const tArtist = (t.artist || '').toLowerCase();

      if (lowerGenre === 'all') {
        return true;
      }
      if (lowerGenre === 'hindi') {
        return tGenre === 'hindi' || tGenre.includes('hindi') || tGenre === 'bollywood' || tTitle.includes('hindi');
      }
      if (lowerGenre === 'punjabi') {
        return tGenre === 'punjabi' || tTitle.includes('punjabi');
      }
      if (lowerGenre === 'bhojpuri') {
        return tGenre === 'bhojpuri' || tTitle.includes('bhojpuri');
      }
      if (lowerGenre === 'english') {
        return tGenre === 'english';
      }
      if (lowerGenre === 'lo-fi' || lowerGenre === 'lofi') {
        return tGenre.includes('lo-fi') || tGenre.includes('lofi') || tTitle.includes('lofi') || tTitle.includes('lo-fi');
      }
      if (lowerGenre === 'haryanvi') {
        return tGenre === 'haryanvi' || tTitle.includes('haryanvi');
      }
      if (lowerGenre === 'romance') {
        return (
          tGenre === 'romance' ||
          tTitle.includes('romantic') ||
          tTitle.includes('love') ||
          tTitle.includes('romance') ||
          (tGenre === 'hindi' && (tTitle.includes('dil') || tTitle.includes('tum') || tTitle.includes('san') || tTitle.includes('tere')))
        );
      }
      if (lowerGenre === 'party') {
        return (
          tGenre === 'party' ||
          tTitle.includes('party') ||
          tTitle.includes('dance') ||
          tTitle.includes('dj') ||
          tTitle.includes('remix') ||
          tTitle.includes('dhoom') ||
          tGenre === 'punjabi'
        );
      }
      if (lowerGenre === 'sad') {
        return (
          tGenre === 'sad' ||
          tTitle.includes('sad') ||
          tTitle.includes('dard') ||
          tTitle.includes('alone') ||
          tTitle.includes('slow')
        );
      }
      if (lowerGenre === 'edm') {
        return (
          tGenre === 'edm' ||
          tTitle.includes('edm') ||
          tTitle.includes('dj') ||
          tTitle.includes('remix') ||
          tGenre === 'english'
        );
      }
      if (lowerGenre.includes('south')) {
        return (
          tGenre.includes('south') ||
          tTitle.includes('tamil') ||
          tTitle.includes('telugu') ||
          tGenre === 'hindi'
        );
      }
      return tGenre === lowerGenre || tTitle.includes(lowerGenre) || tArtist.includes(lowerGenre);
    });

    if (matched.length > 0) {
      return matched.map(formatTrack).slice(0, maxResults);
    }

    // Fallback: If 0 matched for a specific genre, return general Hindi hits from DB
    const fallbackHindi = allTracks.filter(t => (t.genre || '').toLowerCase() === 'hindi');
    if (fallbackHindi.length > 0) {
      return fallbackHindi.map(formatTrack).slice(0, maxResults);
    }
  } catch (dbErr) {
    console.warn('Error reading genre songs from DB:', dbErr);
  }

  // ── Step 2: Fallback to YouTube API only if DB had zero songs ───────────────
  try {
    const searchRes = await fetch(
      `${BASE}/search?part=snippet&type=video&videoCategoryId=10&regionCode=IN` +
      `&q=${encodeURIComponent(targetGenre + ' hit songs audio')}&maxResults=${maxResults}` +
      `&key=${API_KEY}`
    );
    const searchJson = await searchRes.json();
    if (!searchJson.items?.length) return [];

    const videoIds = searchJson.items.map(i => i.id.videoId).join(',');

    const detailRes = await fetch(
      `${BASE}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${API_KEY}`
    );
    const detailJson = await detailRes.json();

    const tracks = (detailJson.items || [])
      .filter(v => v.status?.embeddable !== false)
      .map(v => ({
        ...toTrack(v.id, v.snippet, v.contentDetails),
        genre: targetGenre
      }));

    tracks.forEach(track => {
      saveSongToDB(track, targetGenre).catch(() => {});
    });

    return tracks.map(formatTrack).slice(0, maxResults);
  } catch (e) {
    console.warn('fetchGenreSongs API error:', e);
    return [];
  }
}

// ─── Related Songs & Up Next Suggestions ──────────────────────────────────────

/**
 * Extract clean query for suggestions based on track title and artist
 */
function getSuggestionsQuery(currentTrack) {
  if (!currentTrack) return 'bollywood hit songs';

  const rawTitle = decodeHtml(currentTrack.title || '');
  const rawArtist = decodeHtml(currentTrack.artist || '');

  // Strip brackets and common YouTube junk
  let clean = rawTitle
    .replace(/\(.*?\)/gi, '')
    .replace(/\[.*?\]/gi, '')
    .replace(/full video song/gi, '')
    .replace(/official video/gi, '')
    .replace(/lyrical video/gi, '')
    .replace(/video song/gi, '')
    .replace(/audio song/gi, '')
    .replace(/4k video/gi, '')
    .replace(/hd video/gi, '')
    .replace(/full song/gi, '')
    .replace(/lyrics/gi, '')
    .replace(/remix/gi, '')
    .trim();

  // Divide title by separators |, -, :, /
  const parts = clean.split(/[|\-:/]/).map(p => p.trim()).filter(Boolean);
  const songName = parts[0] || clean;

  const KNOWN_SINGERS = [
    'Arijit Singh', 'Shreya Ghoshal', 'Atif Aslam', 'Neha Kakkar', 'Jubin Nautiyal',
    'Diljit Dosanjh', 'Sonu Nigam', 'Sunidhi Chauhan', 'Badshah', 'Yo Yo Honey Singh',
    'Armaan Malik', 'B Praak', 'Kishore Kumar', 'Lata Mangeshkar', 'Kumar Sanu',
    'Alka Yagnik', 'Anuv Jain', 'AP Dhillon', 'Karan Aujla', 'Sidhu Moose Wala',
    'Pritam', 'A.R. Rahman', 'Vishal Mishra', 'Darshan Raval', 'Sachin-Jigar',
    'Khesari Lal Yadav', 'Pawan Singh'
  ];

  // Check if a singer is named in title or channel
  let detectedSinger = '';
  for (const singer of KNOWN_SINGERS) {
    if (
      rawTitle.toLowerCase().includes(singer.toLowerCase()) ||
      rawArtist.toLowerCase().includes(singer.toLowerCase())
    ) {
      detectedSinger = singer;
      break;
    }
  }

  const isLabel = /t-?series|sony|zee|yrf|tips|saregama|speed|eros|geet|white hill|venus|aditya|lahari|speed records/i.test(rawArtist);

  if (detectedSinger) {
    return `${detectedSinger} ${songName} hit songs`;
  }

  if (!isLabel && rawArtist && rawArtist.toLowerCase() !== 'unknown') {
    const cleanArtist = rawArtist.replace(/ - Topic/gi, '').split(',')[0].trim();
    return `${cleanArtist} ${songName} hit songs`;
  }

  if (parts.length > 1 && parts[1].length < 30) {
    return `${songName} ${parts[1]} hit songs`;
  }

  return `${songName} bollywood hit songs`;
}

/**
 * Fetch related song suggestions for the currently playing track
 * DB-FIRST: Searches Firestore DB for songs by same artist/genre first for instant suggestions.
 */
export async function fetchRelatedSuggestions(currentTrack, maxResults = 15) {
  if (!currentTrack) return [];

  const rawArtist = (currentTrack.artist || '').toLowerCase();
  const rawGenre = (currentTrack.genre || 'Hindi').toLowerCase();

  // ── Step 1: Check DB first for related songs (Same Artist or Same Genre) ────
  try {
    const snap = await getDocs(collection(db, SONGS_COL));
    const dbSuggestions = [];

    // First priority: same artist
    snap.forEach(d => {
      const t = d.data();
      if (t.youtubeId !== currentTrack.youtubeId) {
        const tArtist = (t.artist || '').toLowerCase();
        if (rawArtist && rawArtist !== 'various artists' && tArtist.includes(rawArtist)) {
          dbSuggestions.push(t);
        }
      }
    });

    // Second priority: same genre / mood if not enough tracks
    if (dbSuggestions.length < maxResults) {
      snap.forEach(d => {
        const t = d.data();
        if (
          t.youtubeId !== currentTrack.youtubeId &&
          !dbSuggestions.some(s => s.youtubeId === t.youtubeId)
        ) {
          const tGenre = (t.genre || '').toLowerCase();
          if (tGenre.includes(rawGenre) || rawGenre.includes(tGenre)) {
            dbSuggestions.push(t);
          }
        }
      });
    }

    // Third priority: any other songs in DB to fill up to maxResults
    if (dbSuggestions.length < maxResults) {
      snap.forEach(d => {
        const t = d.data();
        if (
          t.youtubeId !== currentTrack.youtubeId &&
          !dbSuggestions.some(s => s.youtubeId === t.youtubeId)
        ) {
          dbSuggestions.push(t);
        }
      });
    }

    if (dbSuggestions.length >= 5) {
      return dbSuggestions.map(formatTrack).slice(0, maxResults);
    }
  } catch (dbErr) {
    console.warn('DB suggestions error:', dbErr);
  }

  // ── Step 2: Fallback to YouTube API if DB had very few tracks ───────────────
  const query_ = getSuggestionsQuery(currentTrack);
  try {
    const searchRes = await fetch(
      `${BASE}/search?part=snippet&type=video&videoCategoryId=10&regionCode=IN` +
      `&q=${encodeURIComponent(query_)}&maxResults=${maxResults + 5}` +
      `&key=${API_KEY}`
    );
    const searchJson = await searchRes.json();
    if (!searchJson.items?.length) return [];

    const videoIds = searchJson.items
      .map(i => i.id.videoId)
      .filter(id => id && id !== currentTrack.youtubeId)
      .slice(0, maxResults)
      .join(',');

    if (!videoIds) return [];

    const detailRes = await fetch(
      `${BASE}/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${API_KEY}`
    );
    const detailJson = await detailRes.json();

    const tracks = (detailJson.items || [])
      .filter(v => v.status?.embeddable !== false && v.id !== currentTrack.youtubeId)
      .map(v => toTrack(v.id, v.snippet, v.contentDetails));

    tracks.forEach(track => {
      saveSongToDB(track, currentTrack.genre || 'Hindi').catch(() => {});
    });

    return tracks.map(formatTrack).slice(0, maxResults);
  } catch (e) {
    console.warn('fetchRelatedSuggestions API error:', e);
    return [];
  }
}
