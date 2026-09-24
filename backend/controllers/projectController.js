const Project = require("../models/Project");

// Newest first, so the site, the admin list and the "Newest" sort all agree.
const listProjects = async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
};

// The admin can back-date a project (its "date" drives the Newest order).
// Mongoose treats createdAt as immutable once timestamps are on, so it is
// written straight to the collection.
const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const setCreatedAt = async (id, date) => {
  if (date) await Project.collection.updateOne({ _id: id }, { $set: { createdAt: date } });
};
const clean = (body = {}) => {
  const { _id, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
};

const createProject = async (req, res) => {
  const project = await Project.create(clean(req.body));
  await setCreatedAt(project._id, parseDate(req.body?.createdAt));
  res.status(201).json(await Project.findById(project._id));
};

const updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, clean(req.body), {
    new: true,
    runValidators: true,
  });
  if (!project) return res.status(404).json({ message: "Project not found" });
  await setCreatedAt(project._id, parseDate(req.body?.createdAt));
  res.json(await Project.findById(project._id));
};

const deleteProject = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Project deleted" });
};

module.exports = { listProjects, createProject, updateProject, deleteProject };
