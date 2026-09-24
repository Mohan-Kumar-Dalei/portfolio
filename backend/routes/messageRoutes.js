const express = require("express");
const { createMessage, listMessages, deleteMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, listMessages);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
