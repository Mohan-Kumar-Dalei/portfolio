const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    resumeUrl: { type: String, default: "" },
    availability: { type: String, default: "Available for work" },
    availabilityOpen: { type: Boolean, default: true },
    location: { type: String, default: "Bhubaneswar, India — Remote" },
    email: { type: String, default: "mohankumardalei2001@gmail.com" },
    github: { type: String, default: "https://github.com/Mohan-Kumar-Dalei" },
    linkedin: { type: String, default: "https://www.linkedin.com/in/mohan-kumar-dalei" },
    musicUrl: { type: String, default: "" },
    geminiApiKey: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
