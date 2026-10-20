const Counter = require("../models/Counter");

/*
 * Site visit counter for the footer. The browser reports once per session
 * (a "visit") and says whether it has been here before; a browser's first
 * visit also counts as a new "visitor". Bots and rapid repeats from one IP
 * are ignored so the numbers stay honest.
 */
const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|python|axios|node-fetch/i;
const recent = new Map(); // ip -> last counted time
const GAP_MS = 10 * 60_000;

const totals = async () => {
  const docs = await Counter.find({ key: { $in: ["visits", "visitors"] } }).lean();
  const get = (k) => docs.find((d) => d.key === k)?.value || 0;
  return { visits: get("visits"), visitors: get("visitors") };
};

const bump = (key) => Counter.updateOne({ key }, { $inc: { value: 1 } }, { upsert: true });

// GET /api/visits
const getVisits = async (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.json(await totals());
};

// POST /api/visits  { newVisitor: boolean }
const recordVisit = async (req, res) => {
  const ip = req.ip || "anon";
  const now = Date.now();
  const skip = BOT.test(req.get("user-agent") || "") || now - (recent.get(ip) || 0) < GAP_MS;
  if (!skip) {
    recent.set(ip, now);
    if (recent.size > 5000) recent.clear();
    await Promise.all([bump("visits"), req.body?.newVisitor === true ? bump("visitors") : null]);
  }
  res.json(await totals());
};

module.exports = { getVisits, recordVisit };
