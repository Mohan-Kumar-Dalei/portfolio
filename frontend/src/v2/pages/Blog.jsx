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

  const posts = blogs.filter((b) => b.published !== false);
  const cats = useMemo(() => ["All", ...new Set(posts.map((b) => b.category).filter(Boolean))], [posts]);
  const shown = posts.filter((b) => {
    if (cat !== "All" && b.category !== cat) return false;
    const s = q.trim().toLowerCase();
    return !s || `${b.title} ${b.excerpt} ${(b.tags || []).join(" ")}`.toLowerCase().includes(s);
  });

  return (
    <>
      <Helmet>
        <title>Blog · Mohan Kumar Dalei</title>
      </Helmet>
      <div className="v2-fade px-4 pb-6 pt-10">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Blog</h1>
        <p className="mt-2 text-[15px] text-ink-muted">Notes on MERN, AI and building for the web.</p>
      </div>
      <div className="v2-rule-t v2-rule-b flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <label className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-chip px-3">
          <Search aria-hidden className="size-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" aria-label="Search posts" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`h-8 rounded-md border px-2.5 font-mono text-xs transition-colors ${
                cat === c ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]" : "border-border text-ink-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Section id="posts" title="All posts" count={shown.length}>
        {!loaded ? (
          <p className="px-4 py-6 font-mono text-sm text-ink-muted">Loading posts…</p>
        ) : shown.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No posts match that.</p>
        ) : (
          <div className="v2-stack">
            {shown.map((b) => (
              <PostRow key={b.slug} post={b} />
            ))}
          </div>
        )}
      </Section>
      <Hatch />
    </>
  );
};

export default Blog;
