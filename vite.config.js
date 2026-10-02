import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

function youtubeSearchPlugin() {
  return {
    name: 'youtube-search-plugin',
    configureServer(server) {
      server.middlewares.use('/api/yt-search', (req, res) => {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const q = parsedUrl.searchParams.get('q');
          if (!q) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing query parameter q' }));
            return;
          }

          const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
          const request = https.get(ytUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'hi,en-US;q=0.9,en;q=0.8'
            }
          }, (ytRes) => {
            let html = '';
            ytRes.on('data', chunk => html += chunk);
            ytRes.on('end', () => {
              try {
                const m = html.match(/ytInitialData = ({.*?});<\/script>/s);
                if (!m) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ items: [] }));
                  return;
                }
                const json = JSON.parse(m[1]);
                const contents = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
                const tracks = [];
                for (const item of contents) {
                  const v = item.videoRenderer;
                  if (v && v.videoId) {
                    const title = v.title?.runs?.[0]?.text || '';
                    const artist = v.ownerText?.runs?.[0]?.text || '';
                    const durationStr = v.lengthText?.simpleText || '3:30';
                    const parts = durationStr.split(':').map(Number);
                    const durationSec = parts.length === 2 ? parts[0] * 60 + parts[1] : (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 210);

                    tracks.push({
                      id: v.videoId,
                      youtubeId: v.videoId,
                      source: 'youtube',
                      title: title,
                      artist: artist,
                      rawTitle: title,
                      rawArtist: artist,
                      duration: durationSec,
                      thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                      publishedAt: new Date().toISOString()
                    });
                    if (tracks.length >= 10) break;
                  }
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ items: tracks }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message, items: [] }));
              }
            });
          });

          request.on('error', (err) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, items: [] }));
          });
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message, items: [] }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), youtubeSearchPlugin()],
  server: {
    port: 5173,
    open: true
  }
});
