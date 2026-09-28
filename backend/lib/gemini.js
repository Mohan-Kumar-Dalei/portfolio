const Setting = require("../models/Setting");

// Model and key shared by the chatbot and the news writer.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Prefer the key an admin saved in Settings, fall back to the environment.
const resolveApiKey = async () => {
  try {
    const s = await Setting.findOne({ key: "site" });
    const k = (s && s.geminiApiKey ? s.geminiApiKey : "").trim();
    if (k) return k;
  } catch (err) {
    console.error("[gemini] settings lookup failed", err);
  }
  return (process.env.GEMINI_API_KEY || "").trim();
};

module.exports = { GEMINI_MODEL, resolveApiKey };
