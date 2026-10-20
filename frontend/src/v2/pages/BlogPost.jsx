import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, ExternalLink } from "lucide-react";
import api, { fileUrl } from "../../lib/api";
import { Hatch, Section } from "../ui";
import { PostRow, fmtDate } from "./Home";

const Back = () => (
  <div className="v2-rule-b">
    <Link to="/v2/blog" className="group inline-flex items-center gap-1.5 px-4 py-3 text-sm text-ink-muted transition-colors hover:text-ink sm:px-5">
      <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" /> All writing
    </Link>
  </div>
);

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

  if (missing || !blog) {
    return (
      <>
        <Back />
        <p className="px-5 py-20 text-center font-mono text-sm text-ink-muted">{missing ? "This post doesn't exist (or isn't published yet)." : "Loading post…"}</p>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${blog.title} · Mohan Kumar Dalei`}</title>
      </Helmet>
      <Back />
      <article className="v2-fade">
        {!blog.published && (
          <p role="status" className="v2-rule-b bg-amber-500/10 px-5 py-2.5 text-sm">
            <strong>Draft preview.</strong> Only you can see this.
          </p>
        )}
        <header className="v2-rule-b p-5 sm:p-8">
          <p className="font-mono text-xs text-ink-muted">
            <span className="text-[var(--accent)]">{blog.category}</span> · {fmtDate(blog.createdAt)} · {blog.readingTime || 1} min read
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[2.7rem]">{blog.title}</h1>
          {blog.excerpt && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{blog.excerpt}</p>}
        </header>
        {blog.coverImage && (
          <div className="v2-rule-b">
            <img src={fileUrl(blog.coverImage)} alt="" className="aspect-[2.2/1] w-full bg-surface object-cover" />
          </div>
        )}
        <div className="v2-prose mx-auto max-w-[44rem] px-5 py-10 sm:px-8" data-testid="v2-blog-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {blog.content}
          </ReactMarkdown>
        </div>
        {(blog.tags || []).length > 0 && (
          <p className="v2-rule-t flex flex-wrap gap-x-3 gap-y-1 px-5 py-4 font-mono text-xs text-ink-muted sm:px-8">
            {blog.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
        )}
        {(blog.sources || []).length > 0 && !/^##\s*Sources/m.test(blog.content || "") && (
          <div className="v2-rule-t px-5 py-5 sm:px-8">
            <h2 className="v2-label !text-[var(--accent)]">Sources</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {blog.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--accent)]">
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
          <Section id="related" n="→" title="Keep reading">
            {related.map((b) => (
              <PostRow key={b.slug} post={b} />
            ))}
          </Section>
        </>
      )}
    </>
  );
};

export default BlogPost;
