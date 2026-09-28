const { GoogleGenAI } = require("@google/genai");
const Setting = require("../models/Setting");
const Project = require("../models/Project");
const ChatLog = require("../models/ChatLog");
const { GEMINI_MODEL, resolveApiKey } = require("../lib/gemini");

const BASE_PROMPT =
  "You are 'SARHA', the friendly AI assistant on Mohan Kumar Dalei's portfolio. Mohan is a MERN " +
  "Stack Developer and Technical Analyst specialising in Agentic AI, building secure, custom " +
  "full-stack applications (React, Node.js, Express, MongoDB), based in Bhubaneswar, India. " +
  "Answer questions about Mohan, his skills, projects and services, and how to hire/contact him. " +
  "Be concise, warm and professional. Keep replies under 130 words. Reply in plain conversational " +
  "sentences — NO markdown, asterisks, bullet symbols, backticks or headings. Use ONLY the facts below. " +
  "If asked who you are or which model powers you, say you are SARHA, Mohan's portfolio assistant; " +
  "never name the underlying AI provider or model.";

// Feed the model live portfolio data so answers stay in sync with the CMS.
const buildSystemPrompt = async () => {
  try {
    const [s, projects] = await Promise.all([
      Setting.findOne({ key: "site" }),
      Project.find().limit(8),
    ]);
    const site = s || {};
    const lines = [BASE_PROMPT, "", "CONTACT & LINKS:"];
    lines.push(`- Email: ${site.email || ""}`);
    lines.push(`- Availability: ${site.availability || ""}`);
    lines.push(`- Location: ${site.location || ""}`);
    lines.push(`- GitHub: ${site.github || ""}`);
    lines.push(`- LinkedIn: ${site.linkedin || ""}`);
    if (site.resumeUrl) lines.push("- A downloadable resume is available on the Contact page.");
    lines.push("", "PROJECTS:");
    projects.forEach((p) => {
      const tech = (p.techStack || []).join(", ");
      lines.push(`- ${p.title || ""} (${p.category || ""}): ${(p.description || "").slice(0, 180)} Tech: ${tech}.`);
    });
    return lines.join("\n");
  } catch (err) {
    console.error("[chat] prompt build failed", err);
    return BASE_PROMPT;
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

  const apiKey = await resolveApiKey();
  if (!apiKey) return res.json({ reply: "AI is not configured yet." });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const contents = (Array.isArray(history) ? history : [])
      .slice(-6)
      .map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: String(turn.content || "").slice(0, 500) }],
      }));
    contents.push({ role: "user", parts: [{ text: msg }] });

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: await buildSystemPrompt(),
        maxOutputTokens: 400,
        temperature: 0.7,
      },
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
    return res.json({ reply: "The assistant is temporarily unavailable. Please try again shortly." });
  }
};

module.exports = { chat };
