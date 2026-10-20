import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, ExternalLink } from "lucide-react";
import api, { fileUrl } from "../../lib/api";
import { Chip, Hatch, Section } from "../ui";
import { PostRow, fmtDate } from "./Home";

const BlogPost = () => {
  const { slug } = useParams();
  const [state, setState] = useState({ blog: null, related: [], missing: false });

  useEffect(() => {
    setState({ blog: null, related: [], missing: false });
    api
      .get(`/blogs/${slug}`)
      .then((r) => setState({ blog: r.data.blog, related: r.data.related || [], missing: false }))
      .catch(() => setState({ blog: null, related: [], missing: true }));
  }, [slug]);

  const { blog, related, missing } = state;

  const back = (
    <div className="v2-rule-b px-4 py-3">
      <Link to="/v2/blog" className="group inline-flex items-center gap-1.5 font-mono text-[13px] text-ink-muted hover:text-ink">
        <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> All posts
      </Link>
    </div>
  );

  if (missing || !blog) {
    return (
      <>
        {back}
        <p className="px-4 py-16 text-center font-mono text-sm text-ink-muted">{missing ? "This post doesn't exist (or isn't published yet)." : "Loading post…"}</p>
        <Hatch />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${blog.title} · Mohan Kumar Dalei`}</title>
      </Helmet>
      {back}
      <article className="v2-fade">
        {!blog.published && (
          <div role="status" className="v2-rule-b bg-amber-500/10 px-4 py-2.5 text-sm">
            <strong>Draft preview.</strong> Only you can see this.
          </div>
        )}
        {blog.coverImage && (
          <div className="v2-rule-b">
            <img src={fileUrl(blog.coverImage)} alt="" className="aspect-[2/1] w-full object-cover" />
          </div>
        )}
        <header className="v2-rule-b px-4 py-6">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[13px] text-ink-muted">
            <Chip>{blog.category}</Chip>
            <span>{fmtDate(blog.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>{blog.readingTime || 1} min read</span>
          </div>
          <h1 className="mt-4 text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.4rem]">{blog.title}</h1>
          {blog.excerpt && <p className="mt-3 text-[17px] leading-relaxed text-ink-muted">{blog.excerpt}</p>}
        </header>
        <div className="v2-prose px-4 py-8" data-testid="v2-blog-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {blog.content}
          </ReactMarkdown>
        </div>
        {(blog.tags || []).length > 0 && (
          <div className="v2-rule-t flex flex-wrap gap-1.5 px-4 py-4">
            {blog.tags.map((t) => (
              <Chip key={t}>#{t}</Chip>
            ))}
          </div>
        )}
        {(blog.sources || []).length > 0 && !/^##\s*Sources/m.test(blog.content || "") && (
          <div className="v2-rule-t px-4 py-4">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Sources</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {blog.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline decoration-[var(--border-strong)] underline-offset-[3px] hover:decoration-[var(--text)]">
                    {s.title || s.source} <ExternalLink aria-hidden className="size-3 text-ink-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
      {related.length > 0 && (
        <>
          <Hatch />
          <Section id="related" title="Keep reading">
            <div className="v2-stack">
              {related.map((b) => (
                <PostRow key={b.slug} post={b} />
              ))}
            </div>
          </Section>
        </>
      )}
      <Hatch />
    </>
  );
};

export default BlogPost;
