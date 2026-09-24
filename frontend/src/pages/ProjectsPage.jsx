import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import NowBuilding from "../components/sections/NowBuilding";
import ProjectImage from "../components/ProjectImage";
import FilterTabs from "../components/FilterTabs";
import Dropdown from "../components/Dropdown";
import { EASE_OUT } from "../components/editorial";
import { useSite } from "../context/SiteContext";

const sorts = ["Newest", "Oldest", "A to Z"];

const ProjectsPage = () => {
  const { projects } = useSite();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))],
    [projects]
  );

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.techStack || []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
    if (sort === "A to Z") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "Oldest") list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [projects, category, query, sort]);

  const countFor = (c) => (c === "All" ? projects.length : projects.filter((p) => p.category === c).length);

  return (
    <PageTransition>
      <Helmet>
        <title>Projects | Mohan Kumar Dalei</title>
        <meta name="description" content="A showcase of full-stack MERN and Agentic AI projects by Mohan Kumar Dalei." />
      </Helmet>

      <PageHeader
        index="/ work"
        eyebrow="Selected work"
        title={<>Things I&apos;ve <span className="text-gradient">built.</span></>}
        subtitle="Full-stack products, AI systems and developer tools. Filter and explore."
      />

      <section className="relative pb-28">
        <div className="wrap">
          {/* Filter bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-6 mb-12">
            <FilterTabs items={categories} value={category} onChange={setCategory} counts={countFor} groupId="proj-filter" testPrefix="filter" />
            <div className="flex items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                data-testid="projects-search"
                className="min-w-0 flex-1 sm:flex-none rounded-full bg-chip border border-border px-5 py-2.5 text-sm focus:border-primary outline-none transition-colors duration-200 sm:w-56"
              />
              <Dropdown label="Sort" value={sort} onChange={setSort} options={sorts} className="shrink-0" data-testid="projects-sort" />
            </div>
          </div>

          <motion.div layout className="grid md:grid-cols-2 gap-x-6 gap-y-14" data-testid="projects-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.article
                  layout
                  key={p._id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.8, delay: (i % 2) * 0.08, ease: EASE_OUT }}
                  className={`group min-w-0 ${i % 2 === 1 ? "md:mt-24" : ""}`}
                  data-testid="project-grid-card"
                >
                  <Link to={`/projects/${p._id}`} data-cursor="view" data-cursor-label="Open" className="relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-surface">
                    <ProjectImage src={p.image} title={p.title} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute left-5 top-5 rounded-full bg-black/40 backdrop-blur px-3 py-1 label text-white">{p.category}</span>
                    <span className="absolute right-5 bottom-5 grid h-12 w-12 place-items-center rounded-full bg-white text-black translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight size={20} />
                    </span>
                  </Link>
                  <div className="mt-5 flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="label text-ink-muted truncate">{String(i + 1).padStart(2, "0")} · {(p.techStack || []).slice(0, 3).join(" · ")}</div>
                      <Link to={`/projects/${p._id}`} className="mt-2 block title-xl break-words text-[clamp(1.35rem,2.8cqi,3.5rem)] hover:text-primary transition-colors duration-300" data-testid="project-detail-link">
                        {p.title}
                      </Link>
                      <p className="mt-3 max-w-lg text-ink-muted line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" aria-label="Source" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors duration-200"><Github size={15} /></a>}
                      {p.liveLink && p.liveLink !== "#" && <a href={p.liveLink} target="_blank" rel="noreferrer" aria-label="Live" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors duration-200"><ExternalLink size={15} /></a>}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && <p className="text-ink-muted mt-10">No projects match your filters.</p>}
        </div>
      </section>

      <NowBuilding />
    </PageTransition>
  );
};

export default ProjectsPage;
