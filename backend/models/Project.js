const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    features: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    githubLink: { type: String, default: "" },
    liveLink: { type: String, default: "" },
    architecture: { type: String, default: "" },
    challenges: { type: String, default: "" },
    solutions: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    category: { type: String, default: "Full Stack" },
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
