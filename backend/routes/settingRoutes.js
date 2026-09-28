const express = require("express");
const { getSettings, updateSettings, listModels, testGemini } = require("../controllers/settingController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getSettings);
router.put("/", protect, updateSettings);
router.post("/gemini/models", protect, listModels);
router.post("/gemini/test", protect, testGemini);

module.exports = router;
