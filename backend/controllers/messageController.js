const Message = require("../models/Message");

const createMessage = async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required" });
  }
  const doc = await Message.create({ name, email, subject: subject || "", message });
  res.status(201).json({ message: "Message received", id: doc._id });
};

// PATCH /api/messages/:id/email — the browser reports whether the Web3Forms
// email went out. Public (the visitor isn't signed in), so it only accepts a
// single report, within 10 minutes of the message being created.
const reportEmail = async (req, res) => {
  const doc = await Message.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Message not found" });
  const fresh = Date.now() - new Date(doc.createdAt).getTime() < 10 * 60 * 1000;
  if (doc.emailStatus !== "pending" || !fresh) return res.status(409).json({ message: "Already reported" });
  const ok = req.body?.ok === true;
  doc.emailStatus = ok ? "sent" : "failed";
  doc.emailError = ok ? "" : String(req.body?.error || "Unknown error").slice(0, 300);
  await doc.save();
  res.json({ emailStatus: doc.emailStatus });
};

const listMessages = async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
};

const deleteMessage = async (req, res) => {
  const doc = await Message.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Message not found" });
  res.json({ message: "Message deleted" });
};

module.exports = { createMessage, reportEmail, listMessages, deleteMessage };
