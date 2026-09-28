const { GoogleGenAI } = require("@google/genai");
const Setting = require("../models/Setting");

/*
 * Key and model for SARHA and the AI blog writer. Both are set in the admin
 * (Settings → AI); the environment (GEMINI_API_KEY, GEMINI_MODEL,
 * GEMINI_FALLBACK_MODELS) is the fallback. No model names are hard-coded,
 * because Google retires models regularly.
 */

const envKey = () => (process.env.GEMINI_API_KEY || "").trim();
const splitModels = (s) =>
  String(s || "")
    .split(",")
    .map((m) => m.trim().replace(/^models\//, ""))
    .filter(Boolean);

const loadSettings = async () => {
  try {
    return (await Setting.findOne({ key: "site" }).lean()) || {};
  } catch (err) {
    console.error("[gemini] settings lookup failed", err);
    return {};
  }
};

// Main model first, then fallbacks, de-duplicated.
const modelChain = (s) => {
  const main = (s.geminiModel || process.env.GEMINI_MODEL || "").trim();
  const fallbacks = splitModels(s.geminiFallbackModels || process.env.GEMINI_FALLBACK_MODELS);
  return [...new Set([main, ...fallbacks].filter(Boolean))];
};

// For callers that only need to know whether any key exists.
const resolveApiKey = async () => ((await loadSettings()).geminiApiKey || "").trim() || envKey();

const text = (err) => String(err?.message || err);
const isInvalidKey = (err) => /API_KEY_INVALID|API key not valid/i.test(text(err));
const isBusy = (err) => [429, 500, 503].includes(err?.status) || /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(text(err));
const isMissingModel = (err) => err?.status === 404 || /NOT_FOUND|is not found|not supported|no longer available|deprecated/i.test(text(err));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One model: try the admin's key, and the server key if Google calls the first
// invalid. A rejected key is removed from `keys` so later models skip it.
const callModel = async (keys, savedKey, model, contents, config) => {
  let keyErr;
  for (const apiKey of [...keys]) {
    try {
      return await new GoogleGenAI({ apiKey }).models.generateContent({ model, contents, config });
    } catch (err) {
      if (!isInvalidKey(err)) throw err;
      console.warn(`[gemini] ${apiKey === savedKey ? "saved" : "server"} key rejected as invalid`);
      keys.splice(keys.indexOf(apiKey), 1);
      keyErr = err;
    }
  }
  throw keyErr;
};

/**
 * generateContent with resilience: the chosen model (one quick retry if it's
 * busy), then each fallback model; retired/unknown models are skipped. An
 * invalid key stops at once (after trying the server key). `config` may be a
 * function of the model name. Resolves to { result, model }.
 */
const generate = async ({ contents, config, deadlineMs = 25000 }) => {
  const s = await loadSettings();
  const saved = (s.geminiApiKey || "").trim();
  const keys = [...new Set([saved, envKey()].filter(Boolean))];
  if (!keys.length) throw Object.assign(new Error("No Gemini API key configured"), { code: "NO_KEY" });
  const models = modelChain(s);
  if (!models.length) throw Object.assign(new Error("No Gemini model configured (Admin → Settings → AI)"), { code: "NO_MODEL" });

  const started = Date.now();
  let lastErr;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    for (let attempt = 0; attempt < 2; attempt++) {
      if (Date.now() - started > deadlineMs) throw lastErr || new Error("Gemini timed out");
      try {
        const cfg = typeof config === "function" ? config(model) : config;
        const result = await callModel(keys, saved, model, contents, cfg);
        if (i > 0) console.warn(`[gemini] answered by fallback model ${model}`);
        return { result, model };
      } catch (err) {
        lastErr = err;
        if (isInvalidKey(err)) throw err; // no key works; another model won't help
        if (isMissingModel(err)) break; // retired or unknown: next model
        if (!isBusy(err)) throw err;
        if (attempt === 0 && i === 0) {
          await sleep(700); // brief spike: one retry on the main model
          continue;
        }
        break; // still busy: next model
      }
    }
    if (i < models.length - 1) console.warn(`[gemini] ${model} unavailable (${lastErr?.status || "error"}), trying ${models[i + 1]}`);
  }
  throw lastErr;
};

module.exports = { resolveApiKey, generate, isInvalidKey, isBusy, modelChain };
