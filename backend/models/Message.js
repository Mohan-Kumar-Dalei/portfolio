const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    // Result of the Web3Forms email notification, reported by the visitor's
    // browser right after sending (Web3Forms' free plan is browser-only).
    emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    emailError: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
