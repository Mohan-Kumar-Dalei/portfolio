// After `vite build`: write a copy of index.html for every fixed page, each
// with its own title, description, Open Graph tags, canonical URL and JSON-LD
// (dist/about/index.html, dist/projects/index.html, …). Crawlers that don't run
// JavaScript then see the right page; the React app boots the same as before.
// Blog posts and project pages get the same treatment at request time from the
// API (backend/controllers/seoController.js).
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { seo, injectSeo, pageGraph } = require("../../backend/lib/seoHtml.js");

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const shell = readFileSync(join(dist, "index.html"), "utf8");

for (const [path, page] of Object.entries(seo.pages)) {
  const html = injectSeo(shell, { ...page, path, jsonLd: pageGraph(path) });
  const file = path === "/" ? join(dist, "index.html") : join(dist, path.slice(1), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`[prerender] ${path.padEnd(12)} -> ${file.slice(dist.length + 1)}`);
}
