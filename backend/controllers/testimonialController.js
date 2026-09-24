const Testimonial = require("../models/Testimonial");

const listTestimonials = async (req, res) => {
  const items = await Testimonial.find().sort({ order: 1, createdAt: -1 });
  res.json(items);
};

const createTestimonial = async (req, res) => {
  const item = await Testimonial.create(req.body || {});
  res.status(201).json(item);
};

const updateTestimonial = async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body || {}, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: "Testimonial not found" });
  res.json(item);
};

const deleteTestimonial = async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Testimonial not found" });
  res.json({ message: "Testimonial deleted" });
};

module.exports = { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
