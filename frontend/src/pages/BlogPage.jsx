import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import { JournalCard } from "../components/sections/BlogPreview";
import { EASE_OUT } from "../components/editorial";
import FilterTabs from "../components/FilterTabs";
import { useSite } from "../context/SiteContext";

const BlogPage = () => {
  const { blogs } = useSite();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))],
    [blogs]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return blogs.filter((b) => {
      const matchCat = category === "All" || b.category === category;
      const matchQ =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [blogs, category, query]);

  const featured = filtered.find((b) => b.featured);
  const showFeatured = featured && category === "All" && !query;
  const rest = showFeatured ? filtered.filter((b) => b._id !== featured._id) : filtered;

  return (
    <PageTransition>
      <Helmet>
        <title>Blog | Mohan Kumar Dalei</title>
        <meta name="description" content="Articles on MERN development, Agentic AI, architecture and premium UI engineering." />
      </Helmet>

      <PageHeader
        index="/ journal"
        eyebrow="Writing"
        title={<>Ideas, notes &amp; <span className="text-gradient">deep dives.</span></>}
        subtitle="Thoughts on building premium products with the MERN stack and Agentic AI."
      />

      <section className="relative pb-28">
        <div className="wrap">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-6 mb-14">
            <FilterTabs items={categories} value={category} onChange={setCategory} groupId="blog-filter" testPrefix="blog-filter" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              data-testid="blog-search"
              className="rounded-full bg-chip border border-border px-5 py-2.5 text-sm focus:border-primary outline-none transition-colors duration-200 w-60"
            />
          </div>

          {showFeatured && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE_OUT }}>
              <Link
                to={`/blog/${featured.slug}`}
                data-cursor="view"
                data-cursor-label="Read"
                className="group relative mb-20 block overflow-hidden rounded-[1.75rem] min-h-[28rem] md:min-h-[34rem]"
                data-testid="blog-featured"
              >
                <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-12 text-white">
                  <div className="label text-white/70">Featured · {featured.category} · {featured.readingTime} min read</div>
                  <h2 className="mt-4 title-xl text-[clamp(1.35rem,4.2cqi,5rem)] max-w-4xl">{featured.title}</h2>
                  <p className="mt-4 max-w-2xl text-white/75">{featured.excerpt}</p>
                </div>
                <span className="absolute right-7 top-7 grid h-14 w-14 place-items-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight size={22} />
                </span>
              </Link>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16" data-testid="blog-grid">
            {rest.map((b, i) => (
              <JournalCard key={b._id} b={b} i={i} />
            ))}
          </div>

          {filtered.length === 0 && <p className="text-ink-muted mt-10">No articles found.</p>}
        </div>
      </section>
    </PageTransition>
  );
};

export default BlogPage;
