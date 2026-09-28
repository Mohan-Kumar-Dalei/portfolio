/*
 * Server-side SEO for a single-page app. Social crawlers (LinkedIn, WhatsApp,
 * X, Facebook) don't run JavaScript, so the tags they read must already be in
 * the HTML. `injectSeo` rewrites the built index.html's <head> for one page:
 * title, description, Open Graph / Twitter tags, canonical URL, robots and
 * JSON-LD. Used by the API for blog/project pages and by the frontend build
 * (frontend/scripts/prerender.mjs) for the fixed pages.
 *
 * These tags are the single source of truth: the React app only updates the
 * document title, so nothing is ever duplicated in <head>.
 */
const seo = require("../../shared/seo-pages.json");

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const absolute = (url) => {
  if (!url) return seo.image;
  if (/^https?:\/\//i.test(url)) return url;
  return `${seo.site}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Trim to a length search engines show in full, on a word boundary.
const clip = (text = "", max = 160) => {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

const person = () => ({
  "@type": "Person",
  "@id": `${seo.site}/#person`,
  name: seo.name,
  url: seo.site,
  image: seo.image,
  jobTitle: seo.jobTitle,
  worksFor: { "@type": "Organization", name: "Contify" },
  address: { "@type": "PostalAddress", addressLocality: "Bhubaneswar", addressRegion: "Odisha", addressCountry: "IN" },
  knowsAbout: ["MERN stack", "React", "Node.js", "Express", "MongoDB", "Agentic AI", "REST APIs", "Tailwind CSS", "GSAP"],
  sameAs: seo.sameAs,
});

const website = () => ({
  "@type": "WebSite",
  "@id": `${seo.site}/#website`,
  url: seo.site,
  name: `${seo.name} — Portfolio`,
  inLanguage: "en",
  publisher: { "@id": `${seo.site}/#person` },
});

const breadcrumbs = (trail) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${seo.site}${t.path}` })),
});

/** JSON-LD graph for a fixed page. */
const pageGraph = (path) => {
  const graph = [website(), person()];
  if (path !== "/") {
    const name = (seo.pages[path]?.title || "").split(" | ")[0];
    graph.push(breadcrumbs([{ name: "Home", path: "/" }, { name, path }]));
  }
  return { "@context": "https://schema.org", "@graph": graph };
};

const blogGraph = (blog, url) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: clip(blog.title, 110),
      description: clip(blog.excerpt, 200),
      image: absolute(blog.coverImage),
      datePublished: new Date(blog.createdAt).toISOString(),
      dateModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
      author: { "@id": `${seo.site}/#person` },
      publisher: { "@id": `${seo.site}/#person` },
      mainEntityOfPage: url,
      keywords: (blog.tags || []).join(", "),
      articleSection: blog.category,
      inLanguage: "en",
    },
    person(),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: clip(blog.title, 70), path: `/blog/${blog.slug}` },
    ]),
  ],
});

const projectGraph = (p, url) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CreativeWork",
      "@id": `${url}#project`,
      name: p.title,
      headline: p.subtitle || p.title,
      description: clip(p.description, 300),
      image: absolute(p.image),
      url,
      dateCreated: new Date(p.createdAt).toISOString(),
      creator: { "@id": `${seo.site}/#person` },
      keywords: (p.techStack || []).join(", "),
      ...(p.liveLink && p.liveLink !== "#" ? { sameAs: [p.liveLink] } : {}),
      ...(p.githubLink ? { codeRepository: p.githubLink } : {}),
    },
    person(),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: p.title, path: `/projects/${p._id}` },
    ]),
  ],
});

/**
 * Rewrite <head> for one page. `meta`: { title, description, path, image,
 * type ("website" | "article"), jsonLd, noindex, published, modified }.
 */
const injectSeo = (html, meta) => {
  const url = `${seo.site}${meta.path === "/" ? "/" : meta.path}`;
  const title = esc(meta.title);
  const description = esc(clip(meta.description, 170));
  const image = esc(absolute(meta.image));

  // Drop the defaults we are about to replace, keep everything else as built.
  let out = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+|article:[^"]+)"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, "");

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${meta.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${meta.type || "website"}" />`,
    `<meta property="og:site_name" content="${esc(seo.name)}" />`,
    `<meta property="og:locale" content="${seo.locale}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:alt" content="${title}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ];
  if (meta.type === "article" && meta.published) {
    tags.push(`<meta property="article:published_time" content="${new Date(meta.published).toISOString()}" />`);
    if (meta.modified) tags.push(`<meta property="article:modified_time" content="${new Date(meta.modified).toISOString()}" />`);
    tags.push(`<meta property="article:author" content="${esc(seo.name)}" />`);
  }
  if (meta.jsonLd) {
    // "<" is escaped so content can never close the script tag early.
    tags.push(`<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`);
  }
  return out.replace(/<\/head>/i, `    ${tags.join("\n    ")}\n  </head>`);
};

module.exports = { seo, injectSeo, pageGraph, blogGraph, projectGraph, clip, absolute };
