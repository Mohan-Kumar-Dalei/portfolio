const express = require("express");
const { createMessage, reportEmail, listMessages, deleteMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", createMessage);
router.patch("/:id/email", reportEmail);
router.get("/", protect, listMessages);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
