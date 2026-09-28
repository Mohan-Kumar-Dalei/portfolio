const Blog = require("../models/Blog");
const { resolveApiKey, generate, isInvalidKey, isBusy } = require("../lib/gemini");
const { latestNews, topicList } = require("../lib/news");

/*
 * One-click AI blog draft (admin → Blogs → "Generate with AI").
 *
 * 1. Pull fresh stories for the chosen topic (a preset such as Frontend or
 *    Backend, or any free-text topic) from public feeds and news search,
 *    skipping stories an earlier post already used.
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

The post's topic is: {{TOPIC}}.

From the numbered items below, pick the single most significant or useful story for developers on
that topic (you may fold in closely related items) and write an ORIGINAL blog post about it. If the items
are releases or technical articles rather than news, write a clear explainer of what changed and how to
use it. Ignore items that are off-topic.

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

// When a topic has no recent coverage (common for a library or stack such as
// "Express.js" or "MERN"), write a timeless practical guide instead of failing.
const EVERGREEN_PROMPT = `You are the writer of the blog on Mohan Kumar Dalei's portfolio. Mohan is a MERN stack developer
and technical analyst who works with agentic AI; readers are developers, founders and recruiters.

Write an ORIGINAL, practical, evergreen blog post about: {{TOPIC}}.
{{ITEMS_NOTE}}
Rules:
- It is a guide or explainer, not news: do not claim recent announcements, releases, dates or version
  numbers you are not certain of, and do not invent statistics or quotes.
- Stick to well-established facts and widely used practices; say "at the time of writing" if unsure.
- Plain, confident, human tone. No hype words like "revolutionary" or "game-changer". No emojis.
- 650-950 words of Markdown. Start with a short intro paragraph (no H1), then 4-6 "##" sections with
  concrete advice; short code snippets in fenced blocks are welcome. Include a "Common mistakes" section.

Return ONLY JSON with exactly these keys:
{
  "title": "headline, max 90 characters",
  "excerpt": "one-sentence summary, max 180 characters",
  "content": "the Markdown article",
  "tags": ["3 to 5 short tags"],
  "imagePrompt": "a visual scene for the cover image; describe objects and mood, no text or brand logos",
  "sourceIndexes": [numbers of any items below you drew on, or an empty list]
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

// GET /api/blogs/generate/topics — preset topics for the admin picker.
const listTopics = (req, res) => res.json(topicList());

const generateNewsDraft = async (req, res) => {
  const topicInput = String(req.body?.topic || "ai").trim().slice(0, 80) || "ai";
  const apiKey = await resolveApiKey();
  if (!apiKey) return res.status(400).json({ message: "No Gemini API key is set (Settings, or GEMINI_API_KEY on the server)." });

  const used = await Blog.find({ "sources.0": { $exists: true } }, { "sources.url": 1 }).lean();
  const skipLinks = used.flatMap((b) => (b.sources || []).map((s) => s.url));
  const { topic, items } = await latestNews({ topic: topicInput, limit: 12, skipLinks });
  // Preset topics always have feeds; if they came back empty the network is the problem.
  if (items.length < 2 && topic.key !== "custom") {
    return res.status(502).json({ message: "Couldn't reach the news feeds right now. Please try again in a minute." });
  }
  // Too little recent coverage of a custom topic: write an evergreen guide.
  const mode = items.length >= 3 ? "news" : "evergreen";

  const list = items
    .map((it, i) => `[${i + 1}] ${it.title}\nSource: ${it.source}${it.date ? ` · ${it.date.toISOString().slice(0, 10)}` : ""}\nSummary: ${it.summary || "(no summary)"}`)
    .join("\n\n");
  const prompt =
    mode === "news"
      ? `${PROMPT.replace("{{TOPIC}}", topic.label)}\n\nITEMS:\n\n${list}`
      : EVERGREEN_PROMPT.replace("{{TOPIC}}", topic.label).replace(
          "{{ITEMS_NOTE}}",
          items.length ? `\nA few recent items on the topic, for context only (use them only if genuinely relevant):\n\n${list}\n` : ""
        );

  let draft;
  try {
    const { result } = await generate({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: mode === "news" ? 0.6 : 0.7, maxOutputTokens: 4096 },
      deadlineMs: 45000,
    });
    draft = extractJson(result.text || "");
  } catch (err) {
    console.error("[news] generation failed", err);
    const msg = isInvalidKey(err)
      ? "Google rejected the Gemini API key. Check GEMINI_API_KEY on Vercel or the key in Settings (it should start with \"AIza\")."
      : isBusy(err)
        ? "Gemini is busy or the free-tier limit was reached (all models tried). Please try again in a minute."
        : "The AI writer is unavailable right now. Please try again shortly.";
    return res.status(502).json({ message: msg });
  }
  if (!draft || !draft.title || !draft.content) {
    return res.status(502).json({ message: "The AI returned an incomplete draft. Please try again." });
  }

  const picked = (Array.isArray(draft.sourceIndexes) ? draft.sourceIndexes : [])
    .map((n) => items[Number(n) - 1])
    .filter(Boolean);
  // News posts always cite something; a guide cites only what it actually used.
  const sources = (picked.length ? picked : mode === "news" ? items.slice(0, 1) : []).map((it) => ({ title: it.title, url: it.link, source: it.source }));
  const content = sources.length
    ? `${String(draft.content).trim()}\n\n## Sources\n\n` + sources.map((s) => `- [${s.title}](${s.url}) · ${s.source}`).join("\n")
    : String(draft.content).trim();

  const blog = await Blog.create({
    title: String(draft.title).slice(0, 140),
    slug: await uniqueSlug(slugify(draft.title)),
    excerpt: String(draft.excerpt || "").slice(0, 240),
    content,
    coverImage: coverFor(String(draft.imagePrompt || draft.title)),
    category: topic.category,
    tags: (Array.isArray(draft.tags) ? draft.tags : []).map((t) => String(t).trim()).filter(Boolean).slice(0, 5),
    readingTime: readingTime(content),
    featured: false,
    published: false,
    aiGenerated: true,
    aiMode: mode,
    sources,
  });

  res.status(201).json(blog);
};

module.exports = { generateNewsDraft, listTopics };
