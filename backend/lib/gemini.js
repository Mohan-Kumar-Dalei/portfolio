const { GoogleGenAI } = require("@google/genai");
const Setting = require("../models/Setting");

// Main model, plus fallbacks tried when it is overloaded (503), rate-limited
// (429) or unavailable. Override the list with GEMINI_FALLBACK_MODELS
// (comma-separated). Models that don't exist for the key are skipped.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash-lite,gemini-2.5-flash,gemini-2.0-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const modelChain = () => [...new Set([GEMINI_MODEL, ...FALLBACK_MODELS])];

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

const text = (err) => String(err?.message || err);
const isInvalidKey = (err) => /API_KEY_INVALID|API key not valid/i.test(text(err));
const isBusy = (err) => [429, 500, 503].includes(err?.status) || /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(text(err));
const isMissingModel = (err) => err?.status === 404 || /NOT_FOUND|is not found|not supported/i.test(text(err));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

/**
 * generateContent with resilience: tries the main model (one quick retry if
 * it's busy), then each fallback model. `config` may be a function of the
 * model name, for model-specific settings. Resolves to { result, model }.
 */
const generate = async ({ contents, config, deadlineMs = 25000 }) => {
  const started = Date.now();
  let lastErr;
  for (const model of modelChain()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (Date.now() - started > deadlineMs) throw lastErr || new Error("Gemini timed out");
      try {
        const cfg = typeof config === "function" ? config(model) : config;
        const result = await withGeminiKey((apiKey) => new GoogleGenAI({ apiKey }).models.generateContent({ model, contents, config: cfg }));
        if (model !== GEMINI_MODEL) console.warn(`[gemini] answered by fallback model ${model}`);
        return { result, model };
      } catch (err) {
        lastErr = err;
        if (isInvalidKey(err) || err?.code === "NO_KEY") throw err; // another model won't help
        if (isMissingModel(err)) break; // skip to the next model
        if (!isBusy(err)) throw err;
        if (attempt === 0 && model === GEMINI_MODEL) {
          await sleep(700); // brief spike: one retry on the main model
          continue;
        }
        break; // busy: move on to the next model
      }
    }
    console.warn(`[gemini] ${model} unavailable (${lastErr?.status || "error"}), trying the next model`);
  }
  throw lastErr;
};

module.exports = { GEMINI_MODEL, resolveApiKey, withGeminiKey, generate, isInvalidKey, isBusy };
