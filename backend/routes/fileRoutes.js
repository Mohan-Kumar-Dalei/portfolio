const express = require("express");
const { serveFile } = require("../controllers/uploadController");

const router = express.Router();

router.get("/:id", serveFile);

module.exports = router;
