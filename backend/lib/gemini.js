const Setting = require("../models/Setting");

// Model and key shared by the chatbot and the news writer.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const envKey = () => (process.env.GEMINI_API_KEY || "").trim();

// Prefer the key an admin saved in Settings, fall back to the environment.
const resolveApiKey = async () => {
  try {
    const s = await Setting.findOne({ key: "site" });
    const k = (s && s.geminiApiKey ? s.geminiApiKey : "").trim();
    if (k) return k;
  } catch (err) {
    console.error("[gemini] settings lookup failed", err);
  }
  return envKey();
};

const isInvalidKey = (err) => /API_KEY_INVALID|API key not valid/i.test(String(err?.message || err));

/**
 * Run `fn(apiKey)` with the preferred key. If Google rejects that key as
 * invalid and a different server key exists, retry once with the server key,
 * so a bad key pasted into the admin can't take the chatbot down.
 */
const withGeminiKey = async (fn) => {
  const primary = await resolveApiKey();
  if (!primary) throw Object.assign(new Error("No Gemini API key configured"), { code: "NO_KEY" });
  try {
    return await fn(primary);
  } catch (err) {
    const fallback = envKey();
    if (isInvalidKey(err) && fallback && fallback !== primary) {
      console.warn("[gemini] saved key rejected as invalid; retrying with the server key");
      return fn(fallback);
    }
    throw err;
  }
};

module.exports = { GEMINI_MODEL, resolveApiKey, withGeminiKey, isInvalidKey };
