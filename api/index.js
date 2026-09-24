// Vercel serverless entry: every /api/* request is routed here (see vercel.json)
// and handled by the same Express app that runs locally.
module.exports = require("../backend/app");
