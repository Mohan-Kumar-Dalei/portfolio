// Page titles for client-side navigation. Every other SEO tag (description,
// Open Graph, canonical, JSON-LD) is written into the HTML by the build and the
// API from the same data, so it is never duplicated here.
import seo from "../../shared/seo-pages.json";

export const pageTitle = (path) => seo.pages[path]?.title || seo.pages["/"].title;
export const SITE_NAME = seo.name;
export default seo;
