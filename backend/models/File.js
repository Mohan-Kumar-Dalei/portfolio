const mongoose = require("mongoose");

// An uploaded resume or music track, kept in MongoDB (max 16MB per document).
const fileSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["music", "resume"], required: true },
    filename: { type: String, default: "file" },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
