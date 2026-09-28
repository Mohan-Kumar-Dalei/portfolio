require("dotenv").config();
require("express-async-errors");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const seed = require("./seed");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const messageRoutes = require("./routes/messageRoutes");
const blogRoutes = require("./routes/blogRoutes");
const settingRoutes = require("./routes/settingRoutes");
const chatlogRoutes = require("./routes/chatlogRoutes");
const chatRoutes = require("./routes/chatRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const fileRoutes = require("./routes/fileRoutes");
const seoRoutes = require("./controllers/seoController");

/*
 * The Express app, shared by both ways of running it:
 *   - index.js      local / any Node host: connects, then app.listen()
 *   - api/index.js  Vercel serverless function: exports this app as-is
 * The database connection (and the idempotent seed) is opened lazily on the
 * first API request and then reused, which is what a serverless instance needs.
 */

let ready = null;
const ensureReady = () => {
  if (!ready) {
    ready = (async () => {
      await connectDB();
      await seed();
    })().catch((err) => {
      ready = null; // let the next request retry
      throw err;
    });
  }
  return ready;
};

const app = express();

// Comma-separated allowlist in CORS_ORIGIN, or "*" to allow anything.
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(cors({ origin: CORS_ORIGINS, credentials: false }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "express-portfolio-api" }));

app.use("/api", async (req, res, next) => {
  try {
    await ensureReady();
    next();
  } catch (err) {
    console.error("[db] connection failed", err);
    res.status(503).json({ message: "Database unavailable, please try again shortly." });
  }
});

app.get("/api", (req, res) => res.json({ message: "Mohan Kumar Dalei Portfolio API" }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/chatlogs", chatlogRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
// Uploaded resume/music files, stored in MongoDB (see controllers/uploadController.js).
app.use("/api/files", fileRoutes);

// 404 for unmatched API routes
app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

// Crawler-ready HTML for pages whose content is in the database, plus a live
// sitemap (see controllers/seoController.js). On Vercel these paths are
// rewritten to this function; locally they're served when running the build.
const withDb = (handler) => async (req, res, next) => {
  try {
    await ensureReady();
    await handler(req, res, next);
  } catch (err) {
    next(err);
  }
};
app.get("/sitemap.xml", withDb(seoRoutes.sitemap));
app.get("/robots.txt", seoRoutes.robots);
app.get("/blog/:slug", withDb(seoRoutes.blogPage));
app.get("/projects/:id", withDb(seoRoutes.projectPage));

// On a plain Node host in production, serve the built Vite client from the
// same origin. (On Vercel the CDN serves it; see vercel.json.)
const CLIENT_DIST = path.join(__dirname, "..", "frontend", "dist");
if (!process.env.VERCEL && process.env.NODE_ENV === "production" && fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get("*", (req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));
}

// Central error handler (express-async-errors forwards async rejections here)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.name === "CastError" || err instanceof mongoose.Error.CastError)) {
    return res.status(400).json({ message: "Invalid identifier" });
  }
  if (err && err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  console.error("[error]", err);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
module.exports.ensureReady = ensureReady;
