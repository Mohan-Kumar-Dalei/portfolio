/**
 * Accepts whatever gets pasted from Spotify: a share link
 * (open.spotify.com/track/ID?si=…, with or without /intl-xx/), the full embed
 * <iframe> code, an /embed/ URL or a spotify:track:ID URI. Returns the clean
 * canonical link, or null when it isn't a Spotify track/playlist/album/show.
 */
const TYPES = "track|playlist|album|episode|show";
const FROM_URL = new RegExp(`open\\.spotify\\.com/(?:intl-[a-z-]+/)?(?:embed/)?(${TYPES})/([A-Za-z0-9]+)`);
const FROM_URI = new RegExp(`spotify:(${TYPES}):([A-Za-z0-9]+)`);

export const parseSpotify = (input) => {
  const text = String(input || "").trim();
  if (!text) return null;
  const m = text.match(FROM_URL) || text.match(FROM_URI);
  return m ? { type: m[1], id: m[2], url: `https://open.spotify.com/${m[1]}/${m[2]}` } : null;
};

export const spotifyEmbedSrc = (input) => {
  const s = parseSpotify(input);
  return s ? `https://open.spotify.com/embed/${s.type}/${s.id}?utm_source=generator` : null;
};
