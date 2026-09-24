import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { SplitReveal, RevealImage, introDelay } from "../components/editorial";
import api from "../lib/api";

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setBlog(null);
    setNotFound(false);
    api
      .get(`/blogs/${slug}`)
      .then((r) => {
        setBlog(r.data.blog);
        setRelated(r.data.related || []);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const toc = useMemo(() => {
    if (!blog?.content) return [];
    const lines = blog.content.split("\n");
    return lines
      .filter((l) => /^#{2,3}\s/.test(l))
      .map((l) => {
        const level = l.startsWith("###") ? 3 : 2;
        const text = l.replace(/^#{2,3}\s/, "").trim();
        return { level, text, id: slugify(text) };
      });
  }, [blog]);

  if (notFound) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
          <h1 className="title-xl text-5xl">Article not found</h1>
          <Link to="/blog" className="text-primary">← Back to blog</Link>
        </div>
      </PageTransition>
    );
  }

  if (!blog) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="label text-ink-muted animate-pulse">Loading article…</div>
        </div>
      </PageTransition>
    );
  }

  const headingComp = (Tag) => ({ children }) => {
    const text = Array.isArray(children) ? children.join("") : children;
    return <Tag id={slugify(text)}>{children}</Tag>;
  };

  return (
    <PageTransition>
      <Helmet>
        <title>{`${blog.title} | Mohan Kumar Dalei`}</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:image" content={blog.coverImage} />
      </Helmet>

      <header className="relative pt-28 md:pt-36 pb-12 overflow-hidden">
        <div aria-hidden className="glow-blob w-[40rem] h-[40rem] -right-40 -top-60 opacity-40" />
        <div className="relative wrap">
          <Link to="/blog" className="group inline-flex items-center gap-2 label text-ink-muted hover:text-ink mb-10" data-testid="blog-back">
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" /> All articles
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 label text-ink-muted border-b border-border pb-4">
            <span className="text-primary">{blog.category}</span>
            <span>{blog.readingTime} min read</span>
            {blog.createdAt && <span>{new Date(blog.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</span>}
          </div>
          <SplitReveal as="h1" immediate delay={introDelay()} className="mt-10 title-xl text-[clamp(1.55rem,6cqi,8rem)] max-w-6xl">
            {blog.title}
          </SplitReveal>
          <p className="mt-8 max-w-2xl text-xl text-ink-muted leading-relaxed">{blog.excerpt}</p>
        </div>
      </header>

      <div className="wrap mb-16">
        <RevealImage src={blog.coverImage} alt={blog.title} className="aspect-[21/9] rounded-[1.75rem] bg-surface" />
      </div>

      <section className="pb-28">
        <div className="wrap grid lg:grid-cols-[1fr_16rem] gap-16 max-w-[72rem]">
          <article className="prose-blog max-w-none min-w-0" data-testid="blog-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{ h2: headingComp("h2"), h3: headingComp("h3") }}
            >
              {blog.content}
            </ReactMarkdown>

            <div className="mt-12 flex flex-wrap gap-2">
              {(blog.tags || []).map((t) => (
                <span key={t} className="rounded-full chip-accent px-3 py-1.5 font-mono text-xs">#{t}</span>
              ))}
            </div>
          </article>

          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="label text-ink-muted mb-4">On this page</div>
                <ul className="space-y-2 border-l border-border" data-testid="blog-toc">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-4"}>
                      <a href={`#${h.id}`} className="text-sm text-ink-muted hover:text-primary transition-colors duration-200 -ml-px border-l border-transparent hover:border-primary pl-3 block">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-28">
          <div className="wrap">
            <h2 className="title-xl text-3xl md:text-5xl mb-12 border-t border-border pt-8">Related <span className="text-gradient">reading.</span></h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((b) => (
                <Link key={b._id} to={`/blog/${b.slug}`} className="group block" data-testid="blog-related-card">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                    <img src={b.coverImage} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="pt-4">
                    <h3 className="font-display text-xl font-bold tracking-[-0.02em] group-hover:text-primary transition-colors duration-200">{b.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageTransition>
  );
};

export default BlogDetailPage;
