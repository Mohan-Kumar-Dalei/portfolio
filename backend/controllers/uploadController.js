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

// GET /api/files/:id — stream a stored upload back.
const serveFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  res.set({
    "Content-Type": file.mime,
    "Content-Length": file.size,
    "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
    "Cache-Control": "public, max-age=86400, immutable",
  });
  res.send(file.data);
};

module.exports = { uploadMiddleware, handleUpload, serveFile, MAX_MB };
