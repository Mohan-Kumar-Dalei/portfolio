const express = require("express");
const {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", listTestimonials);
router.post("/", protect, createTestimonial);
router.put("/:id", protect, updateTestimonial);
router.delete("/:id", protect, deleteTestimonial);

module.exports = router;
