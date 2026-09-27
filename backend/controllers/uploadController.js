const multer = require("multer");
const Setting = require("../models/Setting");
const File = require("../models/File");

/*
 * Resume / music uploads are stored in MongoDB rather than on disk: a
 * serverless host (Vercel) has a read-only, throwaway filesystem, so files
 * written there would vanish. Vercel also caps a request body at ~4.5MB,
 * hence the smaller limit there.
 */
const KINDS = { music: "musicUrl", resume: "resumeUrl" };
const ALLOWED = {
  music: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"],
  resume: ["application/pdf"],
};
const MAX_MB = process.env.VERCEL ? 4 : 12;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ALLOWED[req.params.kind];
    if (!allowed) return cb(new Error("Invalid upload kind"));
    if (!allowed.includes(file.mimetype)) return cb(new Error("Unsupported file type"));
    cb(null, true);
  },
}).single("file");

// Wrap multer so its errors come back as JSON instead of hitting the generic handler.
const uploadMiddleware = (req, res, next) => {
  if (!KINDS[req.params.kind]) {
    return res.status(400).json({ message: "Invalid upload kind" });
  }
  upload(req, res, (err) => {
    if (err) {
      const tooBig = err.code === "LIMIT_FILE_SIZE";
      return res.status(tooBig ? 413 : 400).json({
        message: tooBig ? `File too large (max ${MAX_MB}MB)` : err.message || "Upload failed",
      });
    }
    next();
  });
};

const handleUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { kind } = req.params;
  const field = KINDS[kind];
  const doc = await File.create({
    kind,
    filename: req.file.originalname,
    mime: req.file.mimetype,
    size: req.file.size,
    data: req.file.buffer,
  });
  const url = `/api/files/${doc._id}`;

  const setting = (await Setting.findOne({ key: "site" })) || (await Setting.create({ key: "site" }));
  const previous = setting[field];
  setting[field] = url;
  await setting.save();

  // Drop the file this one replaces so the collection doesn't grow forever.
  const prevId = previous && previous.startsWith("/api/files/") ? previous.split("/").pop() : null;
  if (prevId && prevId !== String(doc._id)) File.findByIdAndDelete(prevId).catch(() => {});

  res.json({ url, field });
};

// GET /api/files/:id — send a stored upload back. Supports Range requests,
// which browsers need to seek within an audio track.
const serveFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  const data = file.data;
  const total = data.length;
  res.set({
    "Content-Type": file.mime,
    "Accept-Ranges": "bytes",
    "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
    "Cache-Control": "public, max-age=86400, immutable",
  });

  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (m && (m[1] || m[2])) {
    let start = m[1] ? parseInt(m[1], 10) : total - parseInt(m[2], 10); // "bytes=-500" = last 500
    let end = m[1] && m[2] ? parseInt(m[2], 10) : total - 1;
    start = Math.max(0, start);
    end = Math.min(end, total - 1);
    if (start > end || start >= total) {
      res.set("Content-Range", `bytes */${total}`);
      return res.status(416).end();
    }
    res.status(206).set({ "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": end - start + 1 });
    return res.end(data.subarray(start, end + 1));
  }
  res.set("Content-Length", total);
  res.end(data);
};

module.exports = { uploadMiddleware, handleUpload, serveFile, MAX_MB };
