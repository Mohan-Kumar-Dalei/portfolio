const Setting = require("../models/Setting");
const Project = require("../models/Project");
const ChatLog = require("../models/ChatLog");
const Blog = require("../models/Blog");
const { generate, isBusy } = require("../lib/gemini");

const KNOWLEDGE = require("../lib/sarhaKnowledge");

const BASE_PROMPT = `You are SARHA, the friendly AI assistant on Mohan Kumar Dalei's portfolio website.
Visitors are recruiters, clients and developers. Help them understand Mohan's work, skills,
experience and services, and how to hire or contact him.

LANGUAGE
- Always reply in the same language and script the visitor used. Hindi in Devanagari gets Hindi,
  Hinglish (Hindi in Latin letters) gets Hinglish, Odia gets Odia, English gets English, and so on.
  If they switch language, switch with them.

HOW TO ANSWER
- Answer every question directly and helpfully. Lead with the answer, then a short explanation.
- About Mohan: use the facts below. Combine them to answer questions that aren't listed word for word
  (for example, whether he uses AI tools to code, whether he can build a certain kind of app, or
  what tech stack a project used). Never invent facts about him (no made-up clients, salaries,
  dates, companies or numbers). If something truly isn't known, say so honestly and suggest
  emailing him or using the Contact page.
- General tech questions (React, Node, AI, careers, etc.): answer them briefly and accurately, and
  mention how Mohan's work relates when it genuinely does.
- Hiring or project enquiries: be encouraging, mention the relevant service or project, and point to
  his email or the Contact page.
- Tone: warm, confident, professional, human. Usually 40-150 words; longer only when asked.
- Formatting: plain sentences by default. You may use **bold** for key words and short "- " bullet
  lists when listing 3 or more things. No headings, tables or code blocks unless asked for code.
- If asked who you are or which model powers you: you are SARHA, Mohan's portfolio assistant. Never
  name the underlying AI provider or model.`;

// Feed the model live portfolio data so answers stay in sync with the CMS.
const buildSystemPrompt = async () => {
  try {
    const [s, projects, blogs] = await Promise.all([
      Setting.findOne({ key: "site" }),
      Project.find().sort({ createdAt: -1 }).limit(12),
      Blog.find({ published: true }, { title: 1, slug: 1, category: 1 }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    const site = s || {};
    const lines = [BASE_PROMPT, "", KNOWLEDGE, "", "CONTACT & LINKS:"];
    lines.push(`- Email: ${site.email || ""}`);
    lines.push(`- Availability: ${site.availability || ""}`);
    lines.push(`- Location: ${site.location || ""}`);
    lines.push(`- GitHub: ${site.github || ""}`);
    lines.push(`- LinkedIn: ${site.linkedin || ""}`);
    if (site.resumeUrl) lines.push("- A downloadable resume is available on the Contact page.");
    lines.push("", "PROJECTS (newest first):");
    projects.forEach((p) => {
      const tech = (p.techStack || []).join(", ");
      const links = [p.liveLink && p.liveLink !== "#" ? `live: ${p.liveLink}` : "", p.githubLink ? `code: ${p.githubLink}` : ""]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `- ${p.title || ""}${p.subtitle ? ` (${p.subtitle})` : ""}, ${p.category || ""}: ${(p.description || "").slice(0, 260)} Tech: ${tech}.${links ? ` Links: ${links}.` : ""}`
      );
    });
    if (blogs.length) {
      lines.push("", "RECENT BLOG POSTS (on the site's Blog page):");
      blogs.forEach((b) => lines.push(`- ${b.title} (${b.category}): /blog/${b.slug}`));
    }
    return lines.join("\n");
  } catch (err) {
    console.error("[chat] prompt build failed", err);
    return `${BASE_PROMPT}\n\n${KNOWLEDGE}`;
  }
};

// Simple in-memory sliding window: 20 messages per IP per minute.
const hits = new Map();
const throttled = (ip) => {
  const now = Date.now();
  const dq = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (dq.length >= 20) {
    hits.set(ip, dq);
    return true;
  }
  dq.push(now);
  hits.set(ip, dq);
  return false;
};

const chat = async (req, res) => {
  const ip = req.ip || "anon";
  if (throttled(ip)) {
    return res.json({ reply: "You're sending messages a little fast — give me a few seconds, then try again." });
  }

  const { message = "", history = [], sessionId = "" } = req.body || {};
  const msg = String(message).trim().slice(0, 1000);
  if (!msg) {
    return res.json({ reply: "Ask me anything about Mohan — his skills, projects, services or how to hire him!" });
  }

  try {
    const contents = (Array.isArray(history) ? history : [])
      .slice(-8)
      .map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: String(turn.content || "").slice(0, 800) }],
      }));
    contents.push({ role: "user", parts: [{ text: msg }] });

    const systemInstruction = await buildSystemPrompt();
    // Main model first; if it's overloaded or rate-limited, fallbacks answer.
    const { result } = await generate({
      contents,
      config: (model) => ({
        systemInstruction,
        // 2.5 models "think" first and those tokens count toward this limit;
        // with the old 400 cap longer answers came back cut off. Chat replies
        // don't need thinking, so it's switched off there.
        maxOutputTokens: 1024,
        temperature: 0.7,
        ...(/2\.5/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      }),
    });
    const reply = (result.text || "").trim() || "Sorry, I couldn't generate a reply.";

    try {
      await ChatLog.create({
        sessionId: sessionId || "anon",
        question: msg,
        answer: reply,
        ip,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[chatlog]", err);
    }

    return res.json({ reply });
  } catch (err) {
    console.error("[chat error]", err);
    if (err?.code === "NO_KEY") return res.json({ reply: "AI is not configured yet." });
    if (isBusy(err)) {
      return res.json({ reply: "Lots of people are chatting with me right now. Please try again in a minute, or email Mohan directly." });
    }
    return res.json({ reply: "The assistant is temporarily unavailable. Please try again shortly." });
  }
};

module.exports = { chat };
