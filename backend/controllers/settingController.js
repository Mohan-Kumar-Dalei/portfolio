const Setting = require("../models/Setting");

const getSetting = async () => {
  let s = await Setting.findOne({ key: "site" });
  if (!s) s = await Setting.create({ key: "site" });
  return s;
};

// Public projection: never expose the secret Gemini key.
const publicView = (s) => {
  const o = s.toObject();
  o.hasGeminiKey = !!o.geminiApiKey;
  delete o.geminiApiKey;
  return o;
};

const getSettings = async (req, res) => {
  const s = await getSetting();
  res.json(publicView(s));
};

const updateSettings = async (req, res) => {
  const s = await getSetting();
  const fields = [
    "resumeUrl", "availability", "availabilityOpen", "location", "email",
    "github", "linkedin", "musicUrl", "geminiApiKey",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) s[f] = req.body[f];
  });
  await s.save();
  res.json(publicView(s));
};

module.exports = { getSettings, updateSettings };
