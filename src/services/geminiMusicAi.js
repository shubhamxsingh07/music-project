/**
 * Google Gemini AI Music Intelligence Service
 * Powers AI-assisted search, title cleaning, related song recommendations, and smart playlists
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Call Gemini API with a prompt and get text/JSON response
 */
async function callGemini(prompt, isJson = true) {
  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: isJson
                ? `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON, without any markdown fences, backticks, or extra explanation.`
                : prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    };

    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('Gemini API error:', err);
      return null;
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!isJson) return rawText;

    // Clean JSON text (remove ```json ... ``` if present)
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Gemini AI call failed, falling back to local heuristic:', err);
    return null;
  }
}

/**
 * 1. AI Search Assistant
 * Analyzes search query, fixes typos (e.g. 'arjit sing' -> 'Arijit Singh'),
 * extracts genre, language, mood, and provides canonical song suggestions
 */
export async function aiAnalyzeSearchQuery(query) {
  if (!query || query.trim().length < 2) return null;

  const prompt = `Analyze this music search query from an Indian/Global music streaming app: "${query}".
Return a JSON object with:
{
  "correctedQuery": "clean search query with proper artist/song spelling",
  "artist": "Primary artist if mentioned else empty",
  "songTitle": "Song title if mentioned else empty",
  "genre": "Hindi | Punjabi | Bhojpuri | English | EDM | Lo-Fi | South Indian | Other",
  "mood": "Romantic | Party | Sad | Chill | Energetic | Devotional | null",
  "suggestedTracks": [
    { "title": "Exact Song Name", "artist": "Exact Artist Name", "genre": "Hindi/Punjabi/English/etc" }
  ]
}
Provide up to 4 popular suggestedTracks matching the query.`;

  const aiRes = await callGemini(prompt, true);
  if (aiRes && aiRes.correctedQuery) return aiRes;

  // Local Intelligent Fallback
  const qLower = query.toLowerCase().trim();
  let genre = 'Hindi';
  if (qLower.includes('punjab') || qLower.includes('sidhu') || qLower.includes('diljit') || qLower.includes('aujla') || qLower.includes('dhillon')) genre = 'Punjabi';
  else if (qLower.includes('bhojpuri') || qLower.includes('pawan') || qLower.includes('khesari') || qLower.includes('shilpi')) genre = 'Bhojpuri';
  else if (qLower.includes('english') || qLower.includes('weeknd') || qLower.includes('taylor') || qLower.includes('pop')) genre = 'English';
  else if (qLower.includes('edm') || qLower.includes('alan') || qLower.includes('walker') || qLower.includes('party')) genre = 'EDM';
  else if (qLower.includes('lofi') || qLower.includes('chill') || qLower.includes('relax')) genre = 'Lo-Fi';

  return {
    correctedQuery: query.trim(),
    artist: '',
    songTitle: query.trim(),
    genre,
    mood: qLower.includes('sad') ? 'Sad' : qLower.includes('party') ? 'Party' : 'Chill',
    suggestedTracks: []
  };
}

/**
 * 2. AI Related Tracks Recommendations
 * Given the current playing song, generates 6 similar/related songs (same vibe, artist, genre)
 */
export async function aiGetRelatedTracks(track) {
  if (!track || !track.title) return [];

  const prompt = `Given the song "${track.title}" by "${track.artist}" (Genre: ${track.genre || 'Music'}), suggest 6 top similar/related superhit songs that a listener would love to hear next.
Return a JSON array of objects:
[
  {
    "title": "Song Title",
    "artist": "Artist Name",
    "genre": "${track.genre || 'Pop'}",
    "duration": 220
  }
]`;

  const result = await callGemini(prompt, true);
  return Array.isArray(result) ? result : [];
}

/**
 * 3. AI Clean Messy YouTube Titles
 * Turns messy YouTube upload titles into clean Spotify-style titles & artist names
 */
export async function aiCleanTrackMetadata(rawTitle, rawChannel) {
  if (!rawTitle) return { title: rawTitle, artist: rawChannel };

  // Fast heuristic check for simple titles
  if (!rawTitle.includes('|') && !rawTitle.includes('(') && !rawTitle.includes('[')) {
    return { title: rawTitle.trim(), artist: rawChannel.replace(/ - Topic/gi, '').trim() };
  }

  const prompt = `Clean this messy video title into a clean Spotify-style Song Title and Artist Name.
Raw Title: "${rawTitle}"
Channel: "${rawChannel}"

Return a JSON object:
{
  "title": "Clean Song Name (e.g. Kesariya or 295)",
  "artist": "Main Artist(s) (e.g. Arijit Singh, Pritam)",
  "genre": "Hindi | Punjabi | Bhojpuri | English | EDM | Other"
}`;

  const cleaned = await callGemini(prompt, true);
  if (cleaned && cleaned.title && cleaned.artist) {
    return cleaned;
  }

  // Fallback cleanup
  let t = rawTitle
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/official (music )?video/gi, '')
    .replace(/full song/gi, '')
    .replace(/lyrical video/gi, '')
    .replace(/4k/gi, '')
    .replace(/hd/gi, '')
    .split('|')[0]
    .split('-')[0]
    .trim();

  return {
    title: t || rawTitle,
    artist: rawChannel.replace(/ - Topic/gi, '').trim(),
    genre: 'Music'
  };
}

/**
 * 4. AI Smart Playlist Generator
 * Generates an entire curated tracklist based on user prompt (e.g. "Late Night Driving Lo-Fi Hindi")
 */
export async function aiGeneratePlaylist(promptText) {
  const prompt = `Create a curated music playlist for: "${promptText}".
Return a JSON object:
{
  "playlistName": "Catchy Playlist Title",
  "description": "Short 1-sentence vibe description",
  "genre": "Hindi | Punjabi | English | Lo-Fi | EDM",
  "tracks": [
    { "title": "Song 1", "artist": "Artist 1", "duration": 210 },
    { "title": "Song 2", "artist": "Artist 2", "duration": 195 },
    { "title": "Song 3", "artist": "Artist 3", "duration": 240 },
    { "title": "Song 4", "artist": "Artist 4", "duration": 225 },
    { "title": "Song 5", "artist": "Artist 5", "duration": 200 }
  ]
}`;

  return await callGemini(prompt, true);
}
