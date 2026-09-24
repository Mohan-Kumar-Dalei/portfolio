const Message = require("../models/Message");

const createMessage = async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required" });
  }
  const doc = await Message.create({ name, email, subject: subject || "", message });
  res.status(201).json({ message: "Message received", id: doc._id });
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

module.exports = { createMessage, listMessages, deleteMessage };
