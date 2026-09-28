const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const Project = require("../models/Project");
const { seo, injectSeo, blogGraph, projectGraph } = require("../lib/seoHtml");

/*
 * Crawler-ready pages for routes whose content lives in the database:
 *   GET /sitemap.xml      every page, published post and project
 *   GET /blog/:slug       the app shell with the post's title, description,
 *   GET /projects/:id     image and JSON-LD already in <head>
 * On Vercel these paths are rewritten to the API function (vercel.json); the
 * React app then boots exactly as it would from index.html.
 */

// The built index.html: from the CDN on Vercel, from frontend/dist locally.
let shell = { html: "", at: 0 };
const indexHtml = async (req) => {
  if (shell.html && Date.now() - shell.at < 5 * 60 * 1000) return shell.html;
  let html = "";
  if (process.env.VERCEL) {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const res = await fetch(`https://${host}/index.html`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) html = await res.text();
  } else {
    const file = path.join(__dirname, "..", "..", "frontend", "dist", "index.html");
    if (fs.existsSync(file)) html = fs.readFileSync(file, "utf8");
  }
  if (html) shell = { html, at: Date.now() };
  return html;
};

const sendPage = async (req, res, meta) => {
  const html = await indexHtml(req);
  if (!html) return res.status(503).send("Site is starting, please refresh.");
  res.set("Content-Type", "text/html; charset=utf-8");
  // CDN may cache for a minute and serve stale while refreshing.
  res.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600");
  res.send(injectSeo(html, meta));
};

const blogPage = async (req, res) => {
  const blog = await Blog.findOne({ slug: String(req.params.slug).toLowerCase() }).lean();
  const p = `/blog/${req.params.slug}`;
  if (!blog || !blog.published) {
    // Unknown or draft: still serve the app (it shows "not found"/draft), just not indexable.
    return sendPage(req, res, { ...seo.pages["/blog"], path: p, noindex: true });
  }
  const url = `${seo.site}/blog/${blog.slug}`;
  return sendPage(req, res, {
    title: `${blog.title} | ${seo.name}`,
    description: blog.excerpt || blog.content,
    path: `/blog/${blog.slug}`,
    image: blog.coverImage,
    type: "article",
    published: blog.createdAt,
    modified: blog.updatedAt,
    jsonLd: blogGraph(blog, url),
  });
};

const projectPage = async (req, res) => {
  const p = `/projects/${req.params.id}`;
  const project = mongoose.isValidObjectId(req.params.id) ? await Project.findById(req.params.id).lean() : null;
  if (!project) return sendPage(req, res, { ...seo.pages["/projects"], path: p, noindex: true });
  const url = `${seo.site}${p}`;
  return sendPage(req, res, {
    title: `${project.title}${project.subtitle ? ` — ${project.subtitle}` : ""} | ${seo.name}`,
    description: project.description,
    path: p,
    image: project.image,
    type: "website",
    jsonLd: projectGraph(project, url),
  });
};

const xmlEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sitemap = async (req, res) => {
  const [blogs, projects] = await Promise.all([
    Blog.find({ published: true }, { slug: 1, updatedAt: 1, coverImage: 1, title: 1 }).sort({ createdAt: -1 }).lean(),
    Project.find({}, { updatedAt: 1, image: 1, title: 1 }).sort({ createdAt: -1 }).lean(),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc, lastmod, changefreq, priority, image) =>
    `  <url>\n    <loc>${xmlEsc(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>` +
    (image && /^https?:\/\//.test(image) ? `\n    <image:image><image:loc>${xmlEsc(image)}</image:loc></image:image>` : "") +
    "\n  </url>";

  const entries = [
    ...Object.entries(seo.pages).map(([p, m]) => url(`${seo.site}${p}`, today, m.changefreq, m.priority, p === "/" ? seo.image : null)),
    ...projects.map((p) => url(`${seo.site}/projects/${p._id}`, new Date(p.updatedAt || Date.now()).toISOString().slice(0, 10), "monthly", "0.7", p.image)),
    ...blogs.map((b) => url(`${seo.site}/blog/${b.slug}`, new Date(b.updatedAt || Date.now()).toISOString().slice(0, 10), "monthly", "0.6", b.coverImage)),
  ];
  res.set("Content-Type", "application/xml; charset=utf-8");
  res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`
  );
};

module.exports = { blogPage, projectPage, sitemap };
