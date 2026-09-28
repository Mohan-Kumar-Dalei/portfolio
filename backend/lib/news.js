/*
 * Fresh tech stories for the AI blog writer, per topic, from public RSS/Atom
 * feeds, Google News search and Hacker News search. No API keys and no extra
 * dependencies: each source is fetched with a short timeout and parsed with
 * small, forgiving regexes; a source that fails is simply skipped.
 */

const googleNews = (query, days) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${days}d`)}&hl=en-US&gl=US&ceid=US:en`;

/*
 * Preset topics. `feeds` are curated desks (tried first); `query` drives the
 * Google News and Hacker News searches that fill the gap; `days` is how far
 * back a story may be (developer blogs publish less often than news desks).
 */
const TOPICS = {
  ai: {
    label: "AI & Machine Learning",
    category: "AI News",
    query: "artificial intelligence OR LLM OR OpenAI OR Anthropic OR Gemini",
    days: 3,
    feeds: [
      { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
      { name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
      { name: "VentureBeat", url: "https://venturebeat.com/category/ai/feed/" },
      { name: "AI News", url: "https://www.artificialintelligence-news.com/feed/" },
    ],
  },
  frontend: {
    label: "Frontend development",
    category: "Frontend",
    query: "React OR JavaScript OR CSS OR frontend framework OR Next.js",
    days: 14,
    feeds: [
      { name: "React Blog", url: "https://react.dev/rss.xml" },
      { name: "web.dev", url: "https://web.dev/static/blog/feed.xml" },
      { name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
      { name: "CSS-Tricks", url: "https://css-tricks.com/feed/" },
      { name: "DEV Community", url: "https://dev.to/feed/tag/frontend", community: true },
    ],
  },
  backend: {
    label: "Backend & APIs",
    category: "Backend",
    query: "Node.js OR backend development OR API design OR PostgreSQL OR MongoDB",
    days: 14,
    feeds: [
      { name: "Node.js Blog", url: "https://nodejs.org/en/feed/blog.xml" },
      { name: "The New Stack", url: "https://thenewstack.io/feed/" },
      { name: "DEV Community", url: "https://dev.to/feed/tag/backend", community: true },
      { name: "DEV Community", url: "https://dev.to/feed/tag/node", community: true },
    ],
  },
  devops: {
    label: "DevOps & Cloud",
    category: "DevOps",
    query: "Kubernetes OR DevOps OR Docker OR cloud computing OR serverless",
    days: 10,
    feeds: [
      { name: "The New Stack", url: "https://thenewstack.io/feed/" },
      { name: "AWS News Blog", url: "https://aws.amazon.com/blogs/aws/feed/" },
      { name: "DEV Community", url: "https://dev.to/feed/tag/devops", community: true },
    ],
  },
  security: {
    label: "Cybersecurity",
    category: "Security",
    query: "cybersecurity OR vulnerability OR data breach OR zero-day",
    days: 5,
    feeds: [
      { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
      { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" },
    ],
  },
  mobile: {
    label: "Mobile apps",
    category: "Mobile",
    query: "React Native OR Flutter OR Android development OR iOS development OR Expo",
    days: 14,
    feeds: [
      { name: "Android Developers", url: "https://android-developers.googleblog.com/feeds/posts/default" },
      { name: "Expo", url: "https://expo.dev/changelog/rss.xml" },
      { name: "React Native Blog", url: "https://reactnative.dev/blog/rss.xml" },
      { name: "DEV Community", url: "https://dev.to/feed/tag/reactnative", community: true },
      { name: "DEV Community", url: "https://dev.to/feed/tag/flutter", community: true },
    ],
  },
  web: {
    label: "Web platform & browsers",
    category: "Web",
    query: "web platform OR browser engine OR Chrome release OR WebAssembly OR web standards",
    days: 14,
    feeds: [
      { name: "WebKit", url: "https://webkit.org/feed/" },
      { name: "Chrome for Developers", url: "https://developer.chrome.com/static/blog/feed.xml" },
      { name: "web.dev", url: "https://web.dev/static/blog/feed.xml" },
      { name: "Mozilla Hacks", url: "https://hacks.mozilla.org/feed/" },
    ],
  },
};

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
  const m = xml.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}=["']([^"']+)["']`, "i"));
  return m ? decode(m[1]) : "";
};

// Atom entries can carry several <link>s (replies, edit, …); the article is rel="alternate".
const atomLink = (xml) => {
  const links = xml.match(/<link\b[^>]*>/gi) || [];
  const alt = links.find((l) => /rel=["']alternate["']/i.test(l)) || links.find((l) => !/rel=/i.test(l)) || links[0] || "";
  return attr(alt, "link", "href");
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
    const link = atom ? atomLink(b) : stripTags(tag(b, "link")) || atomLink(b);
    const date = new Date(stripTags(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date")));
    const rawBody = tag(b, "description") || tag(b, "summary") || tag(b, "content:encoded") || tag(b, "content");
    return {
      title,
      link,
      source: src,
      date: Number.isNaN(date.getTime()) ? null : date,
      summary: stripTags(rawBody).slice(0, 500),
    };
  });
};

const get = (url, accept) =>
  fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { "User-Agent": "Mozilla/5.0 (portfolio news reader)", Accept: accept },
  });

const fetchFeed = async ({ name, url, community = false }, fallback = false) => {
  try {
    const res = await get(url, "application/rss+xml, application/atom+xml, application/xml, text/xml");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), name).map((i) => ({ ...i, fallback, community }));
  } catch (err) {
    console.warn(`[news] ${name} skipped: ${err.message}`);
    return [];
  }
};

// Hacker News stories matching the query (Algolia search API, no key needed).
const hackerNews = async (query, days) => {
  try {
    const since = Math.floor(Date.now() / 1000) - days * 86400;
    const words = query.replace(/\bOR\b/g, " ").replace(/\s+/g, " ").trim();
    const url = `https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent(words)}&numericFilters=created_at_i>${since},points>20&hitsPerPage=15`;
    const res = await get(url, "application/json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { hits = [] } = await res.json();
    return hits
      .filter((h) => h.title && h.url)
      .map((h) => ({
        title: h.title,
        link: h.url,
        source: "Hacker News",
        date: new Date(h.created_at),
        summary: stripTags(h.story_text || "").slice(0, 500) || `${h.points} points on Hacker News`,
        fallback: true,
      }));
  } catch (err) {
    console.warn(`[news] Hacker News skipped: ${err.message}`);
    return [];
  }
};

// Market tips and press releases make poor articles.
const LOW_VALUE = /\b(stocks?|shares?|invest(or|ors|ing)?|price target|buy now|press release|prnewswire|pr newswire|globe ?newswire|business wire|sponsored)\b/i;

// Keep English-language stories (search results mix in other languages).
const mostlyLatin = (text) => {
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, "");
  if (!letters) return true;
  const latin = letters.replace(/[^\p{Script=Latin}]/gu, "").length;
  return latin / letters.length >= 0.8;
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

/** Resolve a preset key or free text into a topic definition. */
const resolveTopic = (input) => {
  const key = String(input || "ai").trim();
  if (TOPICS[key]) return { key, ...TOPICS[key] };
  const text = key.replace(/\s+/g, " ").slice(0, 80);
  const title = text.replace(/\b\w/g, (c) => c.toUpperCase());
  return { key: "custom", label: text, category: title.length <= 24 ? title : "Tech", query: text, days: 14, feeds: [] };
};

const STOPWORDS = new Set(["the", "and", "for", "with", "how", "what", "why", "new", "news", "about", "into", "from", "your", "you", "are", "latest"]);
const keywordsOf = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9.+#]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

const within = (item, days) => item.date && item.date.getTime() >= Date.now() - days * 86400 * 1000;
const newestFirst = (a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0);

/**
 * Stories for a topic, de-duplicated by title and excluding any link in
 * `skipLinks` (stories already written up). Order of preference:
 *   1. editorial desks (official blogs, news sites): up to 3 each, and up to
 *      60 days old, since developer blogs publish less often than news desks
 *   2. community posts (DEV): at most 3
 *   3. Google News / Hacker News search results to fill the rest
 * For a custom topic every story must mention one of its keywords.
 */
const latestNews = async ({ topic = "ai", limit = 12, skipLinks = [] } = {}) => {
  const t = resolveTopic(topic);
  const lists = await Promise.all([
    ...t.feeds.map((f) => fetchFeed(f)),
    fetchFeed({ name: "Google News", url: googleNews(t.query, t.days) }, true),
    hackerNews(t.query, t.days),
  ]);
  const keys = t.key === "custom" ? keywordsOf(t.query) : [];
  const relevant = (i) => !keys.length || keys.some((k) => `${i.title} ${i.summary}`.toLowerCase().includes(k));

  const skip = new Set(skipLinks);
  const seen = new Set();
  const pool = [];
  for (const item of lists.flat().sort(newestFirst)) {
    if (!item.title || !item.link || LOW_VALUE.test(`${item.title} ${item.source}`) || !mostlyLatin(item.title) || !relevant(item)) continue;
    const k = norm(item.title);
    if (seen.has(k) || skip.has(item.link)) continue;
    seen.add(k);
    pool.push(item);
  }

  const perSource = {};
  const desks = pool.filter((i) => {
    if (i.fallback || i.community || !within(i, Math.max(t.days, 60))) return false;
    perSource[i.source] = (perSource[i.source] || 0) + 1;
    return perSource[i.source] <= 3;
  });
  const community = pool.filter((i) => i.community && within(i, t.days)).slice(0, 3);
  let search = pool.filter((i) => i.fallback && within(i, t.days));
  if (desks.length + community.length + search.length < 5) search = pool.filter((i) => i.fallback); // thin topic: allow older

  return { topic: t, items: [...desks, ...community, ...search].slice(0, limit) };
};

const topicList = () => Object.entries(TOPICS).map(([key, t]) => ({ key, label: t.label, category: t.category }));

module.exports = { latestNews, resolveTopic, topicList, TOPICS };
