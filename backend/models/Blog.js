const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "Engineering" },
    tags: { type: [String], default: [] },
    readingTime: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    author: { type: String, default: "Mohan Kumar Dalei" },
    // Set on drafts written by the AI news generator (admin → Blogs).
    aiGenerated: { type: Boolean, default: false },
    sources: {
      type: [{ title: String, url: String, source: String, _id: false }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
