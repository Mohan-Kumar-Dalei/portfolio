const { GoogleGenAI } = require("@google/genai");
const Blog = require("../models/Blog");
const { GEMINI_MODEL, resolveApiKey } = require("../lib/gemini");
const { latestNews } = require("../lib/news");

/*
 * One-click AI news draft (admin → Blogs → "Generate AI news").
 *
 * 1. Pull fresh AI/tech headlines from public feeds, skipping stories an
 *    earlier post already used.
 * 2. Ask Gemini for an original article built only from those items, as JSON.
 * 3. Attach an AI-generated cover image and save it as an unpublished draft,
 *    so the admin reviews and edits before anything goes live.
 */

const slugify = (str) =>
  String(str || "post")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "");

const uniqueSlug = async (base) => {
  let slug = base || "ai-news";
  for (let n = 1; await Blog.exists({ slug }); n++) slug = `${base}-${n}`;
  return slug;
};

const readingTime = (text = "") => Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));

// Cover art from a text prompt (Pollinations, free, no key). The fixed seed
// keeps the same image every time the URL is loaded.
const coverFor = (prompt) => {
  const p = `${prompt}. Editorial illustration, cinematic lighting, deep violet and indigo palette, clean composition, no text, no logos, no watermark`;
  const seed = Math.floor(Math.random() * 1e9);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1600&height=900&nologo=true&seed=${seed}`;
};

const PROMPT = `You are the writer of the blog on Mohan Kumar Dalei's portfolio. Mohan is a MERN stack developer
and technical analyst who works with agentic AI; readers are developers, founders and recruiters.

From the numbered news items below, pick the single most significant AI or technology story (you may
fold in closely related items) and write an ORIGINAL blog post about it.

Rules:
- Use only facts present in the items. Do not invent numbers, quotes, names, dates or events.
- Attribute claims to the publication ("according to TechCrunch").
- Plain, confident, human tone. No hype words like "revolutionary" or "game-changer". No emojis.
- 550-850 words of Markdown. Start with a short intro paragraph (no H1), then 3-5 "##" sections,
  including one called "Why it matters" for developers and businesses. Short paragraphs.
- Do not include a sources section; it is added automatically.

Return ONLY JSON with exactly these keys:
{
  "title": "headline, max 90 characters",
  "excerpt": "one-sentence summary, max 180 characters",
  "content": "the Markdown article",
  "tags": ["3 to 5 short tags"],
  "imagePrompt": "a visual scene for the cover image; describe objects and mood, no text or brand logos",
  "sourceIndexes": [numbers of the items you used]
}`;

const extractJson = (text = "") => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  }
};

const generateNewsDraft = async (req, res) => {
  const apiKey = await resolveApiKey();
  if (!apiKey) return res.status(400).json({ message: "No Gemini API key is set (Settings, or GEMINI_API_KEY on the server)." });

  const used = await Blog.find({ "sources.0": { $exists: true } }, { "sources.url": 1 }).lean();
  const skipLinks = used.flatMap((b) => (b.sources || []).map((s) => s.url));
  const items = await latestNews({ limit: 12, skipLinks });
  if (items.length < 2) return res.status(502).json({ message: "Couldn't reach the news feeds right now. Please try again in a minute." });

  const list = items
    .map((it, i) => `[${i + 1}] ${it.title}\nSource: ${it.source}${it.date ? ` · ${it.date.toISOString().slice(0, 10)}` : ""}\nSummary: ${it.summary || "(no summary)"}`)
    .join("\n\n");

  let draft;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nNEWS ITEMS:\n\n${list}` }] }],
      config: { responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 4096 },
    });
    draft = extractJson(result.text || "");
  } catch (err) {
    console.error("[news] generation failed", err);
    return res.status(502).json({ message: "The AI writer is unavailable right now. Please try again shortly." });
  }
  if (!draft || !draft.title || !draft.content) {
    return res.status(502).json({ message: "The AI returned an incomplete draft. Please try again." });
  }

  const picked = (Array.isArray(draft.sourceIndexes) ? draft.sourceIndexes : [])
    .map((n) => items[Number(n) - 1])
    .filter(Boolean);
  const sources = (picked.length ? picked : items.slice(0, 1)).map((it) => ({ title: it.title, url: it.link, source: it.source }));
  const content =
    `${String(draft.content).trim()}\n\n## Sources\n\n` +
    sources.map((s) => `- [${s.title}](${s.url}) · ${s.source}`).join("\n");

  const blog = await Blog.create({
    title: String(draft.title).slice(0, 140),
    slug: await uniqueSlug(slugify(draft.title)),
    excerpt: String(draft.excerpt || "").slice(0, 240),
    content,
    coverImage: coverFor(String(draft.imagePrompt || draft.title)),
    category: "AI News",
    tags: (Array.isArray(draft.tags) ? draft.tags : []).map((t) => String(t).trim()).filter(Boolean).slice(0, 5),
    readingTime: readingTime(content),
    featured: false,
    published: false,
    aiGenerated: true,
    sources,
  });

  res.status(201).json(blog);
};

module.exports = { generateNewsDraft };
