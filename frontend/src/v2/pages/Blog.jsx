import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Hatch, Section } from "../ui";
import { PostRow } from "./Home";

const Blog = () => {
  const { blogs = [], loaded } = useSite();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const posts = useMemo(() => blogs.filter((b) => b.published !== false), [blogs]);
  const cats = useMemo(() => ["All", ...new Set(posts.map((b) => b.category).filter(Boolean))], [posts]);
  const shown = posts.filter((b) => {
    if (cat !== "All" && b.category !== cat) return false;
    const s = q.trim().toLowerCase();
    return !s || `${b.title} ${b.excerpt} ${(b.tags || []).join(" ")}`.toLowerCase().includes(s);
  });

  return (
    <>
      <Helmet>
        <title>Writing · Mohan Kumar Dalei</title>
      </Helmet>
      <div className="v2-fade v2-rule-b p-5 sm:p-8">
        <p className="v2-label">/blog</p>
        <h1 className="mt-3 text-[2.6rem] font-semibold leading-none tracking-[-0.045em] sm:text-[3.4rem]">
          Writing<span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">Notes on MERN, AI and building for the web.</p>
      </div>
      <div className="v2-rule-b flex flex-col sm:flex-row">
        <label className="flex h-12 flex-1 items-center gap-2 px-4 sm:px-5">
          <Search aria-hidden className="size-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" aria-label="Search posts" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted" />
        </label>
        <div className="flex flex-wrap border-t border-border sm:border-l sm:border-t-0" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`h-12 border-r border-border px-3.5 text-[13px] transition-colors last:border-r-0 ${
                cat === c ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "text-ink-muted hover:bg-chip hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Hatch />
      <Section id="posts" n="—" title="All posts" meta={`${shown.length} shown`}>
        {!loaded ? (
          <p className="p-5 font-mono text-sm text-ink-muted">Loading posts…</p>
        ) : shown.length === 0 ? (
          <p className="p-5 text-sm text-ink-muted">No posts match that.</p>
        ) : (
          shown.map((b) => <PostRow key={b.slug} post={b} />)
        )}
      </Section>
    </>
  );
};

export default Blog;
