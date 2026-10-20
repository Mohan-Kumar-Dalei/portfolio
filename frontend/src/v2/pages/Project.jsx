import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import api, { fileUrl } from "../../lib/api";
import ProjectImage from "../../components/ProjectImage";
import { Cells, Hatch, Section, TechLine, btn } from "../ui";
import { goToSection } from "../scroll";

const Paragraphs = ({ text }) => (
  <div className="space-y-3 p-5 text-[16px] leading-relaxed text-ink-muted sm:p-8">
    {String(text)
      .split(/\n+/)
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
    <div className="v2-rule-b">
      <button
        type="button"
        onClick={() => goToSection(navigate, "projects")}
        className="group inline-flex items-center gap-1.5 px-4 py-3 text-sm text-ink-muted transition-colors hover:text-ink sm:px-5"
      >
        <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" /> All projects
      </button>
    </div>
  );

  if (!project) {
    return (
      <>
        {back}
        <p className="px-5 py-20 text-center font-mono text-sm text-ink-muted">{missing ? "This project doesn't exist." : "Loading project…"}</p>
      </>
    );
  }

  const live = project.liveLink && project.liveLink !== "#" ? project.liveLink : "";
  const index = projects.findIndex((p) => p._id === project._id);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const year = project.createdAt ? new Date(project.createdAt).getFullYear() : "";
  const extra = [
    ["Architecture", project.architecture],
    ["Challenges", project.challenges],
    ["Solutions", project.solutions],
  ].filter(([, text]) => text);

  return (
    <>
      <Helmet>
        <title>{`${project.title} · Mohan Kumar Dalei`}</title>
      </Helmet>
      {back}
      <div className="v2-fade">
        <header className="v2-rule-b p-5 sm:p-8">
          <p className="v2-label">Case study</p>
          <h1 className="mt-3 text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3.2rem]">
            {project.title}
            <span className="text-[var(--accent)]">.</span>
          </h1>
          {project.subtitle && <p className="mt-3 text-lg text-ink-muted">{project.subtitle}</p>}
          {(live || project.githubLink) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {live && (
                <a href={live} target="_blank" rel="noreferrer" className={btn.accent}>
                  Visit live site <ArrowUpRight aria-hidden className="size-4" />
                </a>
              )}
              {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noreferrer" className={btn.ghost}>
                  <Github aria-hidden className="size-4" /> Source code
                </a>
              )}
            </div>
          )}
        </header>
        <Cells cols="grid-cols-2 sm:grid-cols-4" className="v2-rule-b">
          {[
            ["Category", project.category || "Project"],
            ["Year", year || "—"],
            ["Status", live ? "Live" : "Source only"],
            ["Stack", `${(project.techStack || []).length} tools`],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-3.5 sm:px-5">
              <div className="v2-label">{k}</div>
              <div className="mt-1.5 text-sm">{v}</div>
            </div>
          ))}
        </Cells>
        <div className="v2-rule-b">
          <ProjectImage src={fileUrl(project.image)} title={project.title} className="aspect-video w-full" imgClassName="object-cover" />
        </div>

        <Hatch />
        <Section id="overview" n="01" title="Overview">
          <Paragraphs text={project.description} />
        </Section>

        {project.features?.length > 0 && (
          <>
            <Hatch />
            <Section id="features" n="02" title="What it does" meta={`${project.features.length} features`}>
              <Cells cols="sm:grid-cols-2">
                {project.features.map((f, i) => (
                  <div key={f} className="flex gap-3 px-4 py-4 text-[15px] leading-relaxed sm:px-5">
                    <span className="font-mono text-xs leading-6 text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                    {f}
                  </div>
                ))}
              </Cells>
            </Section>
          </>
        )}

        {project.techStack?.length > 0 && (
          <>
            <Hatch />
            <Section id="tech" n="03" title="Built with">
              <TechLine items={project.techStack} className="p-5 text-[13px] sm:p-8" />
            </Section>
          </>
        )}

        {extra.map(([title, text], i) => (
          <div key={title}>
            <Hatch />
            <Section id={title.toLowerCase()} n={String(4 + i).padStart(2, "0")} title={title}>
              <Paragraphs text={text} />
            </Section>
          </div>
        ))}

        {project.gallery?.length > 0 && (
          <>
            <Hatch />
            <Section id="gallery" n="—" title="Gallery">
              <Cells cols="sm:grid-cols-2">
                {project.gallery.map((g) => (
                  <img key={g} src={fileUrl(g)} alt={`${project.title} screenshot`} loading="lazy" className="aspect-video w-full bg-surface object-cover" />
                ))}
              </Cells>
            </Section>
          </>
        )}

        {next && next._id !== project._id && (
          <>
            <Hatch />
            <Link to={`/v2/projects/${next._id}`} className="group flex items-center gap-4 px-5 py-6 transition-colors hover:bg-chip sm:px-8">
              <span className="min-w-0 flex-1">
                <span className="v2-label block">Next project</span>
                <span className="mt-1 block truncate text-2xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-[var(--accent)]">{next.title}</span>
              </span>
              <ArrowRight aria-hidden className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default Project;
