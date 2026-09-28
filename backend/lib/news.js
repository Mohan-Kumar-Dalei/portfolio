/*
 * Latest AI / tech headlines from public RSS and Atom feeds. No API keys and
 * no extra dependencies: each feed is fetched with a short timeout and parsed
 * with small, forgiving regexes; a feed that fails is simply skipped.
 */

const FEEDS = [
  { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { name: "VentureBeat", url: "https://venturebeat.com/category/ai/feed/" },
  { name: "AI News", url: "https://www.artificialintelligence-news.com/feed/" },
  // Broad fallback only: used when the curated feeds above are thin.
  { name: "Google News", url: "https://news.google.com/rss/search?q=artificial+intelligence+when:2d&hl=en-US&gl=US&ceid=US:en", fallback: true },
];

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#8217": "’", "#8216": "‘", "#8220": "“", "#8221": "”", "#8230": "…", "#8211": "–", "#8212": "—" };
const decode = (s = "") =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#?\w+);/g, (m, e) => {
      if (ENTITIES[e]) return ENTITIES[e];
      if (/^#\d+$/.test(e)) return String.fromCharCode(parseInt(e.slice(1), 10));
      if (/^#x[0-9a-f]+$/i.test(e)) return String.fromCharCode(parseInt(e.slice(2), 16));
      return m;
    });
const stripTags = (html = "") => decode(decode(html).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
};
const attr = (xml, name, attribute) => {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}="([^"]+)"`, "i"));
  return m ? decode(m[1]) : "";
};

const parseFeed = (xml, source) => {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  return blocks.map((b) => {
    const atom = /^<entry/i.test(b);
    let title = stripTags(tag(b, "title"));
    let src = source;
    // Google News titles end with " - Publisher"
    if (source === "Google News") {
      const m = title.match(/^(.*) - ([^-]+)$/);
      if (m) {
        title = m[1].trim();
        src = m[2].trim();
      }
    }
    const link = atom ? attr(b, "link", "href") : stripTags(tag(b, "link")) || attr(b, "link", "href");
    const date = new Date(stripTags(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date")));
    const rawBody = tag(b, "description") || tag(b, "summary") || tag(b, "content:encoded") || tag(b, "content");
    const image =
      attr(b, "media:content", "url") ||
      attr(b, "media:thumbnail", "url") ||
      attr(b, "enclosure", "url") ||
      (decode(rawBody).match(/<img[^>]+src="([^"]+)"/i) || [])[1] ||
      "";
    return {
      title,
      link,
      source: src,
      date: Number.isNaN(date.getTime()) ? null : date,
      summary: stripTags(rawBody).slice(0, 500),
      image,
    };
  });
};

const fetchFeed = async ({ name, url, fallback = false }) => {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (portfolio news reader)", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), name).map((i) => ({ ...i, fallback }));
  } catch (err) {
    console.warn(`[news] ${name} skipped: ${err.message}`);
    return [];
  }
};

// Market tips and press releases make poor articles.
const LOW_VALUE = /\b(stocks?|shares?|invest(or|ors|ing)?|price target|buy now|press release|prnewswire|pr newswire|globe ?newswire|business wire|sponsored)\b/i;

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

/**
 * Recent headlines, newest first, de-duplicated by title and excluding any
 * link in `skipLinks` (stories already written up).
 */
const latestNews = async ({ limit = 14, maxAgeHours = 72, skipLinks = [] } = {}) => {
  const all = (await Promise.all(FEEDS.map(fetchFeed)))
    .flat()
    .filter((i) => i.title && i.link && !LOW_VALUE.test(`${i.title} ${i.source}`));
  const skip = new Set(skipLinks);
  const seen = new Set();
  const fresh = [];
  const cutoff = Date.now() - maxAgeHours * 3600 * 1000;
  for (const item of all.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))) {
    const key = norm(item.title);
    if (seen.has(key) || skip.has(item.link)) continue;
    seen.add(key);
    fresh.push(item);
  }
  const recent = fresh.filter((i) => i.date && i.date.getTime() >= cutoff);
  const pool = recent.length >= 5 ? recent : fresh;
  // Curated tech desks first, broad search results only to fill the gap.
  const curated = pool.filter((i) => !i.fallback);
  const filler = pool.filter((i) => i.fallback);
  return [...curated, ...filler].slice(0, limit);
};

module.exports = { latestNews, FEEDS };
