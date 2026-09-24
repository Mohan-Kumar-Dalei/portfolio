const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    sessionId: { type: String, default: "anon" },
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    ip: { type: String, default: "" },
    createdAt: { type: String, default: "" },
  },
  { collection: "chatlogs", strict: false }
);

module.exports = mongoose.model("ChatLog", chatLogSchema);
