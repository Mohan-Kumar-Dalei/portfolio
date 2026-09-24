const Blog = require("../models/Blog");

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const computeReadingTime = (content = "") => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const uniqueSlug = async (base, excludeId) => {
  let slug = base || "post";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Blog.findOne({ slug });
    if (!existing || (excludeId && existing._id.toString() === excludeId)) return slug;
    slug = `${base}-${n++}`;
  }
};

const listBlogs = async (req, res) => {
  const { category, tag, search, featured } = req.query;
  const q = {};
  if (req.query.all !== "true") q.published = true;
  if (category && category !== "All") q.category = category;
  if (tag) q.tags = tag;
  if (featured === "true") q.featured = true;
  if (search) {
    q.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }
  const blogs = await Blog.find(q).sort({ createdAt: -1 });
  res.json(blogs);
};

const getBlog = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  const related = await Blog.find({
    _id: { $ne: blog._id },
    published: true,
    $or: [{ category: blog.category }, { tags: { $in: blog.tags } }],
  })
    .sort({ createdAt: -1 })
    .limit(3);
  res.json({ blog, related });
};

const createBlog = async (req, res) => {
  const data = req.body || {};
  const base = slugify(data.slug || data.title || "post");
  const slug = await uniqueSlug(base);
  const blog = await Blog.create({
    ...data,
    slug,
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: computeReadingTime(data.content),
  });
  res.status(201).json(blog);
};

const updateBlog = async (req, res) => {
  const data = req.body || {};
  const patch = { ...data };
  if (data.title || data.slug) {
    patch.slug = await uniqueSlug(slugify(data.slug || data.title), req.params.id);
  }
  if (data.content !== undefined) patch.readingTime = computeReadingTime(data.content);
  if (data.tags) patch.tags = Array.isArray(data.tags) ? data.tags : [];
  const blog = await Blog.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  res.json(blog);
};

const deleteBlog = async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  res.json({ message: "Blog deleted" });
};

module.exports = { listBlogs, getBlog, createBlog, updateBlog, deleteBlog };
