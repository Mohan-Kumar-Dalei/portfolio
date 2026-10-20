import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import api, { fileUrl } from "../../lib/api";
import ProjectImage from "../../components/ProjectImage";
import { Chip, Hatch, Section } from "../ui";
import { goToSection } from "../scroll";

const Paragraphs = ({ text }) => (
  <div className="space-y-3 px-4 py-4 text-[15px] leading-relaxed text-ink-muted">
    {String(text)
      .split(/\n{1,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, i) => (
        <p key={i}>{p}</p>
      ))}
  </div>
);

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects = [], loaded } = useSite();
  const [fetched, setFetched] = useState(null);
  const [missing, setMissing] = useState(false);
  const project = projects.find((p) => p._id === id) || fetched;

  useEffect(() => {
    if (!loaded || projects.some((p) => p._id === id)) return;
    api
      .get("/projects")
      .then((r) => {
        const p = r.data.find((x) => x._id === id);
        if (p) setFetched(p);
        else setMissing(true);
      })
      .catch(() => setMissing(true));
  }, [id, projects, loaded]);

  const back = (
    <div className="v2-rule-b px-4 py-3">
      <button type="button" onClick={() => goToSection(navigate, "projects")} className="group inline-flex items-center gap-1.5 font-mono text-[13px] text-ink-muted hover:text-ink">
        <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> All projects
      </button>
    </div>
  );

  if (!project) {
    return (
      <>
        {back}
        <p className="px-4 py-16 text-center font-mono text-sm text-ink-muted">{missing ? "This project doesn't exist." : "Loading project…"}</p>
        <Hatch />
      </>
    );
  }

  const live = project.liveLink && project.liveLink !== "#" ? project.liveLink : "";
  const index = projects.findIndex((p) => p._id === project._id);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const btn = "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-opacity hover:opacity-85";

  return (
    <>
      <Helmet>
        <title>{`${project.title} · Mohan Kumar Dalei`}</title>
      </Helmet>
      {back}
      <div className="v2-fade">
        <div className="v2-rule-b">
          <ProjectImage src={fileUrl(project.image)} title={project.title} className="aspect-video w-full" imgClassName="object-cover" />
        </div>
        <header className="v2-rule-b px-4 py-6">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[13px] text-ink-muted">
            {project.category && <Chip>{project.category}</Chip>}
            {project.createdAt && <span>{new Date(project.createdAt).getFullYear()}</span>}
            {live && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Live
                </span>
              </>
            )}
          </div>
          <h1 className="mt-4 text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.4rem]">{project.title}</h1>
          {project.subtitle && <p className="mt-2 text-[17px] text-ink-muted">{project.subtitle}</p>}
          {(live || project.githubLink) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {live && (
                <a href={live} target="_blank" rel="noreferrer" className={`${btn} bg-[var(--text)] text-[var(--bg)]`}>
                  Visit live site <ArrowUpRight aria-hidden className="size-4" />
                </a>
              )}
              {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noreferrer" className={`${btn} border border-border bg-chip`}>
                  <Github aria-hidden className="size-4" /> Source code
                </a>
              )}
            </div>
          )}
        </header>
        <Hatch />
        <Section id="overview" title="Overview">
          <Paragraphs text={project.description} />
        </Section>

        {project.features?.length > 0 && (
          <>
            <Hatch />
            <Section id="features" title="Features" count={project.features.length}>
              <ul className="v2-stack">
                {project.features.map((f, i) => (
                  <li key={f} className="flex gap-3 px-4 py-3 text-[15px]">
                    <span className="w-6 shrink-0 font-mono text-xs leading-6 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}

        {project.techStack?.length > 0 && (
          <>
            <Hatch />
            <Section id="tech" title="Tech stack">
              <div className="flex flex-wrap gap-2 px-4 py-4">
                {project.techStack.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </Section>
          </>
        )}

        {[
          ["architecture", "Architecture", project.architecture],
          ["challenges", "Challenges", project.challenges],
          ["solutions", "Solutions", project.solutions],
        ]
          .filter(([, , text]) => text)
          .map(([key, title, text]) => (
            <div key={key}>
              <Hatch />
              <Section id={key} title={title}>
                <Paragraphs text={text} />
              </Section>
            </div>
          ))}

        {project.gallery?.length > 0 && (
          <>
            <Hatch />
            <Section id="gallery" title="Gallery" count={project.gallery.length}>
              <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
                {project.gallery.map((g) => (
                  <img key={g} src={fileUrl(g)} alt={`${project.title} screenshot`} loading="lazy" className="aspect-video w-full bg-[var(--bg)] object-cover" />
                ))}
              </div>
            </Section>
          </>
        )}

        {next && next._id !== project._id && (
          <>
            <Hatch />
            <Link to={`/v2/projects/${next._id}`} className="group flex items-center gap-4 px-4 py-5 transition-colors hover:bg-chip">
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Next project</span>
                <span className="mt-1 block truncate text-xl font-semibold tracking-[-0.02em]">{next.title}</span>
              </span>
              <ArrowRight aria-hidden className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
            </Link>
          </>
        )}
      </div>
      <Hatch />
    </>
  );
};

export default Project;
