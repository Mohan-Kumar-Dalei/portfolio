import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { SplitReveal, RevealImage, EASE_OUT, introDelay } from "../components/editorial";
import { useSite } from "../context/SiteContext";
import ProjectImage from "../components/ProjectImage";
import api from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, loaded } = useSite();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const found = projects.find((p) => p._id === id);
    if (found) {
      setProject(found);
      return;
    }
    if (loaded) {
      api
        .get("/projects")
        .then((r) => {
          const p = r.data.find((x) => x._id === id);
          if (p) setProject(p);
          else setNotFound(true);
        })
        .catch(() => setNotFound(true));
    }
  }, [id, projects, loaded]);

  // Full-bleed cover shrinks into a rounded frame as you scroll.
  useLayoutEffect(() => {
    if (!project || !heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".pd-cover", {
        clipPath: "inset(6% 4% 6% 4% round 1.75rem)",
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".pd-img", { scale: 1, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".pd-title", { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "60% top", scrub: true } });
    }, heroRef);
    return () => ctx.revert();
  }, [project]);

  if (notFound) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
          <h1 className="title-xl text-5xl">Project not found</h1>
          <Link to="/projects" className="text-primary u-link-static">← Back to projects</Link>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="label text-ink-muted animate-pulse">Loading project…</div>
        </div>
      </PageTransition>
    );
  }

  const p = project;
  const d = introDelay();
  const blocks = [
    { title: "Architecture", body: p.architecture },
    { title: "Challenges", body: p.challenges },
    { title: "Solutions", body: p.solutions },
  ].filter((b) => b.body);
  const idx = projects.findIndex((x) => x._id === p._id);
  const next = projects.length > 1 ? projects[(idx + 1) % projects.length] : null;

  return (
    <PageTransition>
      <Helmet>
        <title>{`${p.title} | Mohan Kumar Dalei`}</title>
        <meta name="description" content={p.description} />
        <meta property="og:image" content={p.image} />
      </Helmet>

      {/* Cover */}
      <section ref={heroRef} className="relative h-[100svh] overflow-hidden">
        <div className="pd-cover absolute inset-0" style={{ clipPath: "inset(0% 0% 0% 0% round 0rem)" }}>
          <ProjectImage src={p.image} title="" className="pd-img h-full w-full object-cover scale-[1.15]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
        </div>
        <div className="pd-title absolute inset-x-0 bottom-0 z-10 wrap pb-12 md:pb-16 text-white">
          <button onClick={() => navigate("/projects")} className="group mb-8 inline-flex items-center gap-2 label text-white/80 hover:text-white" data-testid="project-back">
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" /> All projects
          </button>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d, duration: 0.8 }} className="label text-white/70">
            {p.category}
          </motion.div>
          <SplitReveal as="h1" immediate delay={d + 0.1} className="mt-4 title-xl text-[clamp(1.35rem,6.3cqi,8rem)]">
            {p.title}
          </SplitReveal>
          {p.subtitle && <p className="mt-5 max-w-2xl text-lg text-white/75">{p.subtitle}</p>}
        </div>
      </section>

      {/* Meta strip */}
      <section className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border">
          {[
            ["Category", p.category || "N/A"],
            ["Year", p.createdAt ? new Date(p.createdAt).getFullYear() : "N/A"],
            ["Stack", (p.techStack || []).slice(0, 3).join(", ") || "N/A"],
            ["Links", null],
          ].map(([k, v], i) => (
            <div key={k} className={`py-6 pr-4 ${i ? "md:pl-6 md:border-l border-border" : ""} ${i === 1 || i === 3 ? "pl-5 border-l md:border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""}`}>
              <div className="label text-ink-muted">{k}</div>
              {v !== null ? (
                <div className="mt-2 font-medium">{v}</div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-4 font-medium">
                  {p.liveLink && p.liveLink !== "#" && <a href={p.liveLink} target="_blank" rel="noreferrer" className="u-link-static hover:text-primary" data-testid="project-live-btn">Live ↗</a>}
                  {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" className="u-link-static hover:text-primary" data-testid="project-github-btn">Source ↗</a>}
                  {!p.githubLink && !(p.liveLink && p.liveLink !== "#") && "N/A"}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32">
        <div className="wrap grid grid-cols-12 gap-x-6 gap-y-16">
          <div className="col-span-12 lg:col-span-3 label text-ink-muted lg:pt-3">(Overview)</div>
          <div className="col-span-12 lg:col-span-9">
            <p className="font-display text-[clamp(1.5rem,2.8vw,2.6rem)] font-semibold leading-[1.2] tracking-[-0.03em]">{p.description}</p>
          </div>

          {blocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              className="col-span-12 grid grid-cols-12 gap-x-6 gap-y-4 border-t border-border pt-8"
            >
              <div className="col-span-12 lg:col-span-4 flex items-baseline gap-4">
                <span className="label text-ink-muted">0{i + 1}</span>
                <h2 className="title-xl min-w-0 text-[clamp(1.25rem,1.9cqi,2.25rem)]">{b.title}</h2>
              </div>
              <p className="col-span-12 lg:col-span-7 lg:col-start-5 text-lg text-ink-muted leading-relaxed">{b.body}</p>
            </motion.div>
          ))}

          {(p.features?.length > 0 || p.techStack?.length > 0) && (
            <div className="col-span-12 grid md:grid-cols-2 gap-4">
              {p.features?.length > 0 && (
                <div className="rounded-[1.5rem] border border-border bg-surface p-8">
                  <div className="label text-primary mb-6">Key features</div>
                  <ul className="space-y-3">
                    {p.features.map((f, i) => (
                      <li key={f} className="flex gap-4 text-lg">
                        <span className="label text-ink-muted pt-1.5">0{i + 1}</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-[1.5rem] border border-border bg-surface p-8">
                <div className="label text-primary mb-6">Tech stack</div>
                <div className="flex flex-wrap gap-2">
                  {(p.techStack || []).map((t) => (
                    <span key={t} className="rounded-full chip-accent px-4 py-1.5 text-sm">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {p.gallery?.length > 0 && (
            <div className="col-span-12 grid sm:grid-cols-2 gap-4">
              {p.gallery.map((g, i) => (
                <RevealImage key={i} src={g} alt={`${p.title} ${i + 1}`} className="aspect-[4/3] rounded-[1.5rem] bg-surface" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Next project */}
      {next && (
        <Link to={`/projects/${next._id}`} className="group relative block overflow-hidden border-t border-border" data-cursor="view" data-cursor-label="Next">
          {next.image && <img src={next.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-0 scale-110 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-40 group-hover:scale-100" />}
          <div className="relative wrap py-20 md:py-32">
            <div className="label text-ink-muted">Next project</div>
            <div className="mt-4 flex items-end justify-between gap-4 md:gap-6">
              <span className="title-xl min-w-0 text-[clamp(1.3rem,6.5cqi,8rem)]">{next.title}</span>
              <span className="grid h-12 w-12 md:h-16 md:w-16 shrink-0 place-items-center rounded-full bg-grad text-white transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight size={24} />
              </span>
            </div>
          </div>
        </Link>
      )}
    </PageTransition>
  );
};

export default ProjectDetailPage;
