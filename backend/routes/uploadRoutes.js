const express = require("express");
const { uploadMiddleware, handleUpload } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/:kind", protect, uploadMiddleware, handleUpload);

module.exports = router;
