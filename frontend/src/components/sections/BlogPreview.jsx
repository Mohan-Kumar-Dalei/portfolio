import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SectionHead, ArrowLink, RevealImage, EASE_OUT } from "../editorial";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "");

/** Journal card shared by the home preview and the blog index. */
export const JournalCard = ({ b, i = 0, testid = "blog-card" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: EASE_OUT }}
  >
    <Link to={`/blog/${b.slug}`} className="group block" data-cursor="view" data-cursor-label="Read" data-testid={testid}>
      <div className="overflow-hidden rounded-[1.25rem]">
        <RevealImage
          src={b.coverImage}
          alt={b.title}
          className="aspect-[4/3] bg-surface"
          imgClassName="grayscale-[35%] transition-[transform,filter] duration-[1200ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
        />
      </div>
      <div className="mt-5 flex items-center justify-between label text-ink-muted">
        <span>{b.category}</span>
        <span>{b.readingTime} min · {fmt(b.createdAt)}</span>
      </div>
      <h3 className="mt-3 font-display text-2xl font-bold leading-[1.1] tracking-[-0.03em]">
        <span className="u-link pb-0.5">{b.title}</span>
      </h3>
      <p className="mt-3 text-ink-muted line-clamp-2">{b.excerpt}</p>
    </Link>
  </motion.div>
);

const BlogPreview = ({ blogs = [] }) => {
  const items = blogs.slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="relative py-24 md:py-36" data-testid="blog-preview-section">
      <div className="wrap">
        <SectionHead
          index="06"
          label="Journal"
          right={`${String(blogs.length).padStart(2, "0")} articles`}
          title={<>Notes &amp; <span className="text-gradient">writing.</span></>}
          intro="On MERN architecture, Agentic AI and the craft of building interfaces that feel right."
        />

        <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-x-6 gap-y-14">
          {items.map((b, i) => (
            <JournalCard key={b._id} b={b} i={i} testid={`blog-preview-card-${i}`} />
          ))}
        </div>

        <div className="mt-12 flex justify-end">
          <ArrowLink to="/blog" data-testid="blog-preview-viewall">All articles</ArrowLink>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
