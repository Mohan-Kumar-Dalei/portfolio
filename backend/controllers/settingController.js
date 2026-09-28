const { GoogleGenAI } = require("@google/genai");
const Setting = require("../models/Setting");
const { isAdminRequest } = require("../middleware/auth");

const getSetting = async () => {
  let s = await Setting.findOne({ key: "site" });
  if (!s) s = await Setting.create({ key: "site" });
  return s;
};

// Public projection: never expose the secret Gemini key. The admin also gets
// the key's last 4 characters (to see that one is saved) and the AI model setup.
const view = (s, admin) => {
  const o = s.toObject();
  const key = o.geminiApiKey || "";
  o.hasGeminiKey = !!key;
  delete o.geminiApiKey;
  if (admin) {
    o.geminiKeyHint = key ? `••••${key.slice(-4)}` : "";
    o.serverGeminiKey = !!(process.env.GEMINI_API_KEY || "").trim();
    o.serverGeminiModel = process.env.GEMINI_MODEL || "";
  } else {
    delete o.geminiModel;
    delete o.geminiFallbackModels;
  }
  return o;
};

const getSettings = async (req, res) => {
  const s = await getSetting();
  res.json(view(s, await isAdminRequest(req)));
};

const cleanModel = (m) => String(m || "").trim().replace(/^models\//, "");

const updateSettings = async (req, res) => {
  const s = await getSetting();
  const fields = [
    "resumeUrl", "availability", "availabilityOpen", "location", "email",
    "github", "linkedin", "musicUrl", "spotifyUrl", "web3formsKey",
    "geminiApiKey", "geminiModel", "geminiFallbackModels",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) s[f] = req.body[f];
  });
  // Keys are pasted by hand: drop quotes/whitespace, and reject anything that
  // can't be a key. (Format isn't pinned to "AIza…", since Google issues
  // other formats too; "Test connection" in the admin verifies a key.)
  s.geminiApiKey = String(s.geminiApiKey || "").trim().replace(/^["']|["']$/g, "");
  if (s.geminiApiKey && !/^[A-Za-z0-9._\-]{20,200}$/.test(s.geminiApiKey)) {
    return res.status(400).json({ message: "That API key has unexpected characters or length. Copy it again from Google AI Studio." });
  }
  s.geminiModel = cleanModel(s.geminiModel);
  s.geminiFallbackModels = String(s.geminiFallbackModels || "")
    .split(",")
    .map(cleanModel)
    .filter(Boolean)
    .join(", ");
  if (!/^[A-Za-z0-9.\-_]*$/.test(s.geminiModel)) return res.status(400).json({ message: "Model name looks wrong." });

  s.web3formsKey = String(s.web3formsKey || "").trim();
  if (s.web3formsKey && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.web3formsKey)) {
    return res.status(400).json({ message: "Web3Forms access key should look like xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" });
  }
  if (s.spotifyUrl && !/^https:\/\/open\.spotify\.com\/(track|playlist|album|episode|show)\/[A-Za-z0-9]+$/.test(s.spotifyUrl)) {
    return res.status(400).json({ message: "Spotify link must look like https://open.spotify.com/track/<id>" });
  }
  await s.save();
  res.json(view(s, true));
};

// Which key to use for an admin check: the one typed in the form (not saved
// yet), else the saved one, else the server's.
const keyFor = async (typed) => {
  const t = String(typed || "").trim();
  if (t) return { key: t, source: "typed" };
  const s = await getSetting();
  if (s.geminiApiKey) return { key: s.geminiApiKey, source: "saved" };
  const env = (process.env.GEMINI_API_KEY || "").trim();
  return env ? { key: env, source: "server" } : { key: "", source: "none" };
};

const googleMessage = (err) => {
  const raw = String(err?.message || err);
  try {
    return JSON.parse(raw).error?.message || raw;
  } catch {
    return raw.slice(0, 300);
  }
};

// POST /api/settings/gemini/models — models this key can use for text.
const listModels = async (req, res) => {
  const { key, source } = await keyFor(req.body?.apiKey);
  if (!key) return res.status(400).json({ message: "No API key to check. Paste one first." });
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const models = [];
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    for await (const m of pager) {
      const actions = m.supportedActions || m.supportedGenerationMethods || [];
      if (!actions.includes("generateContent")) continue;
      const id = cleanModel(m.name);
      if (/embedding|aqa|imagen|veo|tts|audio|image-generation|live/i.test(id)) continue;
      models.push({ id, name: m.displayName || id });
    }
    models.sort((a, b) => a.id.localeCompare(b.id));
    res.json({ source, models });
  } catch (err) {
    res.status(400).json({ message: `Google said: ${googleMessage(err)}` });
  }
};

// POST /api/settings/gemini/test — one tiny request with a key + model.
const testGemini = async (req, res) => {
  const { key, source } = await keyFor(req.body?.apiKey);
  if (!key) return res.status(400).json({ message: "No API key to test. Paste one first." });
  const s = await getSetting();
  const model = cleanModel(req.body?.model) || s.geminiModel || process.env.GEMINI_MODEL || "";
  if (!model) return res.status(400).json({ message: "Pick a model first." });
  const t0 = Date.now();
  try {
    const result = await new GoogleGenAI({ apiKey: key }).models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: "Reply with just: OK" }] }],
      config: { maxOutputTokens: 20 },
    });
    res.json({ ok: true, source, model, ms: Date.now() - t0, reply: (result.text || "").trim().slice(0, 40) });
  } catch (err) {
    res.status(400).json({ ok: false, source, model, message: `Google said: ${googleMessage(err)}` });
  }
};

module.exports = { getSettings, updateSettings, listModels, testGemini };
