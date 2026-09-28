const express = require("express");
const { listBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");
const { protect } = require("../middleware/auth");
const { generateNewsDraft } = require("../controllers/newsController");

const router = express.Router();

router.get("/", listBlogs);
router.get("/:slug", getBlog);
router.post("/", protect, createBlog);
router.post("/generate", protect, generateNewsDraft);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
