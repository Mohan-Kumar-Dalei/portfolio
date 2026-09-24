const express = require("express");
const ChatLog = require("../models/ChatLog");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const logs = await ChatLog.find().sort({ createdAt: -1 }).limit(300);
  res.json(logs);
});

router.delete("/:id", protect, async (req, res) => {
  const doc = await ChatLog.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

module.exports = router;
