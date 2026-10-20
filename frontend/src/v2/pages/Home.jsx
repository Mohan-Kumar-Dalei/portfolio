import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Copy, FileText, Github, Linkedin, Loader2, Mail } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { LINKS } from "../../utils/links";
import { fileUrl } from "../../lib/api";
import { contactSchema, sendContactMessage } from "../../lib/contact";
import ProjectImage from "../../components/ProjectImage";
import Avatar from "../Avatar";
import { ACHIEVEMENTS, AVATAR_IMG, CERTIFICATIONS, EDUCATION, EXPERIENCE, PROFILE_FALLBACK, PROFILE_IMG, ROLES, SECTIONS, STACK, STATS } from "../data";
import { Cells, Hatch, Section, TechLine, TimelineRow, btn, useClock } from "../ui";

export const fmtDate = (d, opts = { month: "short", day: "numeric", year: "numeric" }) => (d ? new Date(d).toLocaleDateString("en-US", opts) : "");

const accentLink = "font-medium text-ink underline decoration-[var(--accent)] decoration-1 underline-offset-[3px] transition-colors hover:text-[var(--accent)]";

/* ── Hero ────────────────────────────────────────────────── */

const RoleFlip = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span key={i} className="v2-rise inline-block">
      {ROLES[i]}
    </span>
  );
};

const Hero = () => {
  const { settings } = useSite();
  const time = useClock();
  const [img, setImg] = useState(PROFILE_IMG);
  const [flipped, setFlipped] = useState(false);
  const open = settings?.availabilityOpen !== false;
  const socials = [
    [Github, "GitHub", settings?.github || LINKS.github],
    [Linkedin, "LinkedIn", settings?.linkedin || LINKS.linkedin],
    [Mail, "Email", `mailto:${settings?.email || LINKS.email}`],
  ];

  return (
    <div className="v2-fade">
      <div className="v2-rule-b grid md:grid-cols-[1fr_17rem]">
        <div className="flex flex-col justify-between gap-8 p-5 sm:p-8">
          <div>
            <p className="v2-label">Hello, world — I&apos;m</p>
            <h1 className="mt-3 text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-[3.7rem]">
              Mohan Kumar
              <br />
              Dalei<span className="text-[var(--accent)]">.</span>
            </h1>
            <div className="mt-4 h-5 overflow-hidden font-mono text-[13px] text-[var(--accent)]">
              <span aria-hidden>↳ </span>
              <RoleFlip />
            </div>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              I build fast, thoughtful full-stack products on the MERN stack, and AI features that genuinely help.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={btn.accent}
            >
              Let&apos;s talk <ArrowRight aria-hidden className="size-4" />
            </a>
            <a href={fileUrl(settings?.resumeUrl) || LINKS.resume} target="_blank" rel="noreferrer" className={btn.ghost}>
              <FileText aria-hidden className="size-4" /> Resume
            </a>
            {socials.map(([Icon, label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="grid size-10 place-items-center border border-[var(--border-strong)] text-ink-muted transition-colors hover:border-[var(--text)] hover:text-ink"
              >
                <Icon aria-hidden className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="v2-dots flex flex-col items-center justify-center gap-4 border-t border-border px-6 py-8 md:border-l md:border-t-0">
          <button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            aria-pressed={flipped}
            aria-label={flipped ? "Show photo" : "Show avatar"}
            title={flipped ? "Show photo" : "Show avatar"}
            className={`v2-flip relative size-44 rounded-full ring-1 ring-[var(--border-strong)] ring-offset-4 ring-offset-[var(--bg)] sm:size-48 ${flipped ? "is-flipped" : ""}`}
            data-testid="v2-profile-flip"
          >
            <span className="v2-flip-inner block">
              <span className="v2-flip-face bg-chip">
                <img
                  src={img}
                  onError={() => img !== PROFILE_FALLBACK && setImg(PROFILE_FALLBACK)}
                  alt="Mohan Kumar Dalei, MERN stack developer from Odisha, India"
                  className="h-full w-full select-none object-cover object-top"
                  draggable={false}
                />
              </span>
              <span className="v2-flip-face v2-flip-back">
                {AVATAR_IMG ? <img src={AVATAR_IMG} alt="Avatar of Mohan Kumar Dalei" className="h-full w-full object-cover" draggable={false} /> : <Avatar className="h-full w-full" />}
              </span>
            </span>
            <span aria-hidden className={`absolute bottom-3 right-3 size-4 rounded-full border-[3px] border-[var(--bg)] ${open ? "bg-emerald-500" : "bg-amber-500"}`} />
          </button>
          <span className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
            <span className={`size-1.5 rounded-full transition-colors ${flipped ? "bg-[var(--border-strong)]" : "bg-[var(--accent)]"}`} />
            <span className={`size-1.5 rounded-full transition-colors ${flipped ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"}`} />
            Tap to {flipped ? "see the photo" : "meet the avatar"}
          </span>
        </div>
      </div>

      <Cells cols="grid-cols-2 lg:grid-cols-4" className="v2-rule-b">
        {[
          ["Based in", settings?.location || "Bhubaneswar, India"],
          ["Local time", <span key="t" className="tabular-nums">{time} IST</span>],
          ["Currently", "Technical Analyst @ Contify"],
          [
            "Status",
            <span key="s" className="inline-flex items-center gap-2">
              <span className={`size-1.5 shrink-0 rounded-full ${open ? "bg-emerald-500" : "bg-amber-500"}`} />
              {settings?.availability || "Open to work"}
            </span>,
          ],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-3.5 sm:px-5">
            <div className="v2-label">{k}</div>
            <div className="mt-1.5 text-sm">{v}</div>
          </div>
        ))}
      </Cells>
    </div>
  );
};

/* ── About ───────────────────────────────────────────────── */

const About = ({ n }) => (
  <Section id="about" n={n} title="About" meta="Who I am">
    <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[1.15fr_1fr] md:gap-10">
      <p className="text-[1.35rem] font-medium leading-[1.35] tracking-[-0.025em] sm:text-[1.6rem]">
        I&apos;m a <span className="text-[var(--accent)]">MERN stack developer</span> and technical analyst from Odisha. I like building products that
        feel fast, considered and a little bit premium.
      </p>
      <div className="space-y-4 text-[15px] leading-relaxed text-ink-muted">
        <p>
          By day I&apos;m a Technical Analyst at Contify in Bhubaneswar. I learned the craft through internships, certifications and plenty of personal
          projects, from ApexOS, a desktop that runs in the browser, to{" "}
          <a href="https://apex-ui.in" target="_blank" rel="noreferrer" className={accentLink}>
            Apex UI
          </a>
          , a React component library with its own NPM CLI.
        </p>
        <p>
          Lately it&apos;s Agentic AI: Gemini-powered assistants, voice interfaces, scraping tools and an exam-preparation coach. I use AI to do the heavy
          lifting while keeping full control over the architecture, the data and the details.
        </p>
      </div>
    </div>
    <Cells cols="grid-cols-2 sm:grid-cols-4" className="border-t border-border">
      {STATS.map(([value, label]) => (
        <div key={label} className="px-4 py-5 sm:px-5">
          <div className="text-[1.9rem] font-semibold leading-none tracking-[-0.04em]">{value}</div>
          <div className="mt-2 text-xs text-ink-muted">{label}</div>
        </div>
      ))}
    </Cells>
  </Section>
);

/* ── Experience / education ──────────────────────────────── */

const Timeline = ({ groups }) => (
  <ol>
    {groups.flatMap((g) => g.positions.map((p) => <TimelineRow key={`${g.org}-${p.title}`} org={g.org} current={g.current} role={p} />))}
  </ol>
);

/* ── Projects ────────────────────────────────────────────── */

const firstSentence = (text = "") => (String(text).match(/[^.!?]+[.!?]/) || [String(text)])[0].trim();

const ProjectCell = ({ p, i }) => {
  const live = p.liveLink && p.liveLink !== "#" ? p.liveLink : "";
  const to = `/v2/projects/${p._id}`;
  return (
    <article className="group flex flex-col transition-colors hover:bg-chip">
      <Link to={to} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden border-b border-border bg-surface">
        <ProjectImage src={fileUrl(p.image)} title={p.title} className="h-full w-full" imgClassName="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-0 top-0 border-b border-r border-border bg-[var(--bg)] px-2 py-1 font-mono text-[10px] text-ink-muted">
          {String(i + 1).padStart(2, "0")}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">
            <Link to={to} className="transition-colors hover:text-[var(--accent)]">
              {p.title}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-1">
            {live && (
              <a href={live} target="_blank" rel="noreferrer" aria-label={`${p.title} live site`} title="Live site" className="grid size-7 place-items-center text-ink-muted transition-colors hover:text-[var(--accent)]">
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            )}
            {p.githubLink && (
              <a href={p.githubLink} target="_blank" rel="noreferrer" aria-label={`${p.title} source code`} title="Source code" className="grid size-7 place-items-center text-ink-muted transition-colors hover:text-ink">
                <Github aria-hidden className="size-4" />
              </a>
            )}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{p.subtitle || firstSentence(p.description)}</p>
        <TechLine items={(p.techStack || []).slice(0, 4)} className="mt-auto pt-4" />
      </div>
    </article>
  );
};

const PAGE = 4;

const Projects = ({ n }) => {
  const { projects = [], loaded } = useSite();
  const [all, setAll] = useState(false);
  const shown = all ? projects : projects.slice(0, PAGE);

  return (
    <Section id="projects" n={n} title="Selected work" meta={projects.length ? `${projects.length} projects` : null}>
      {!loaded ? (
        <p className="p-5 font-mono text-sm text-ink-muted">Loading projects…</p>
      ) : (
        <>
          <Cells cols="sm:grid-cols-2">
            {shown.map((p, i) => (
              <ProjectCell key={p._id} p={p} i={i} />
            ))}
          </Cells>
          {projects.length > PAGE && (
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              className="flex w-full items-center justify-center gap-2 border-t border-border py-3.5 text-sm font-medium transition-colors hover:bg-chip"
            >
              {all ? "Show fewer" : `Show all ${projects.length} projects`}
              <ArrowDown aria-hidden className={`size-4 transition-transform ${all ? "rotate-180" : ""}`} />
            </button>
          )}
        </>
      )}
    </Section>
  );
};

/* ── Kind words ──────────────────────────────────────────── */

const initials = (name = "") =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Testimonials = ({ n }) => {
  const { testimonials = [] } = useSite();
  if (!testimonials.length) return null;
  const loop = [...testimonials, ...testimonials];
  return (
    <>
      <Hatch />
      <Section id="testimonials" n={n} title="Kind words" meta={`${testimonials.length} notes`}>
        <div className="v2-marquee" style={{ "--v2-marquee-time": `${Math.max(30, testimonials.length * 9)}s` }}>
          <ul className="v2-marquee-track">
            {loop.map((t, i) => (
              <li key={`${t._id}-${i}`} aria-hidden={i >= testimonials.length} className="flex w-80 shrink-0 flex-col justify-between gap-5 border-r border-border p-5 sm:p-6">
                <div>
                  <span aria-hidden className="block h-6 text-4xl font-semibold leading-none text-[var(--accent)]">
                    &ldquo;
                  </span>
                  <p className="mt-2 text-[15px] leading-relaxed">{t.quote}</p>
                </div>
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <img src={fileUrl(t.avatar)} alt="" loading="lazy" className="size-9 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-9 place-items-center rounded-full bg-chip text-xs font-semibold text-ink-muted">{initials(t.name)}</span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.name}</span>
                    <span className="block truncate text-xs text-ink-muted">{[t.role, t.company].filter(Boolean).join(", ")}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
};

/* ── Toolbox ─────────────────────────────────────────────── */

const GroupLabel = ({ children, right }) => (
  <div className="flex items-center justify-between border-b border-border bg-chip px-4 py-2 sm:px-5">
    <span className="v2-label !text-[var(--accent)]">{children}</span>
    {right && <span className="v2-label">{right}</span>}
  </div>
);

const Toolbox = ({ n }) => (
  <Section id="stack" n={n} title="Toolbox" meta={`${STACK.reduce((a, g) => a + g.items.length, 0)} tools`}>
    {STACK.map((g, gi) => (
      <div key={g.title} className={gi > 0 ? "border-t border-border" : ""}>
        <GroupLabel right={String(g.items.length).padStart(2, "0")}>{g.title}</GroupLabel>
        <Cells cols="grid-cols-3 sm:grid-cols-5">
          {g.items.map(([name, Icon]) => (
            <div key={name} className="flex flex-col items-center justify-center gap-2 px-2 py-4 text-center text-[12.5px] transition-colors hover:bg-chip">
              <Icon aria-hidden className="size-5 text-ink-muted" />
              {name}
            </div>
          ))}
        </Cells>
      </div>
    ))}
  </Section>
);

/* ── Education & credentials ─────────────────────────────── */

const Education = ({ n }) => (
  <Section id="education" n={n} title="Education" meta="Since 2018">
    <Timeline groups={EDUCATION} />

    <div className="border-t border-border">
      <GroupLabel right={String(CERTIFICATIONS.length).padStart(2, "0")}>Certificates</GroupLabel>
      <ul>
        {CERTIFICATIONS.map((c) => (
          <li key={c.title} className="border-b border-border last:border-0">
            <a href={c.url} target="_blank" rel="noreferrer" className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-chip sm:px-5">
              <span className="min-w-0 flex-1">
                <span className="block font-medium transition-colors group-hover:text-[var(--accent)]">{c.title}</span>
                <span className="block text-sm text-ink-muted">{c.org}</span>
              </span>
              <span className="font-mono text-xs text-ink-muted">{c.date}</span>
              <ArrowUpRight aria-hidden className="size-4 shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div className="border-t border-border">
      <GroupLabel right={String(ACHIEVEMENTS.length).padStart(2, "0")}>Milestones</GroupLabel>
      <ul>
        {ACHIEVEMENTS.map((a) => (
          <li key={a} className="flex gap-3 border-b border-border px-4 py-3 text-[15px] leading-relaxed text-ink-muted last:border-0 sm:px-5">
            <span aria-hidden className="text-[var(--accent)]">✦</span>
            {a}
          </li>
        ))}
      </ul>
    </div>
  </Section>
);

/* ── Writing ─────────────────────────────────────────────── */

export const PostRow = ({ post }) => (
  <Link to={`/v2/blog/${post.slug}`} className="group grid border-b border-border transition-colors last:border-0 hover:bg-chip sm:grid-cols-[8.5rem_1fr_3.5rem]">
    <span className="px-4 pt-4 font-mono text-xs text-ink-muted sm:border-r sm:border-border sm:px-5 sm:py-4">{fmtDate(post.createdAt)}</span>
    <span className="min-w-0 px-4 pb-4 pt-1 sm:px-5 sm:py-4">
      <span className="block text-[16px] font-medium leading-snug transition-colors group-hover:text-[var(--accent)]">{post.title}</span>
      <span className="mt-1 block line-clamp-1 text-sm text-ink-muted">
        <span className="text-ink">{post.category}</span>
        {post.excerpt ? ` · ${post.excerpt}` : ""}
      </span>
    </span>
    <span className="hidden place-items-center border-l border-border text-ink-muted transition-colors group-hover:text-[var(--accent)] sm:grid">
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
    </span>
  </Link>
);

const Writing = ({ n }) => {
  const { blogs = [], loaded } = useSite();
  const posts = blogs.filter((b) => b.published !== false);
  return (
    <Section id="blog" n={n} title="Writing" meta={posts.length ? `${posts.length} posts` : null}>
      {!loaded ? (
        <p className="p-5 font-mono text-sm text-ink-muted">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="p-5 text-sm text-ink-muted">No posts yet.</p>
      ) : (
        <>
          {posts.slice(0, 4).map((b) => (
            <PostRow key={b.slug} post={b} />
          ))}
          <Link to="/v2/blog" className="flex items-center justify-center gap-2 border-t border-border py-3.5 text-sm font-medium transition-colors hover:bg-chip">
            Read all writing <ArrowRight aria-hidden className="size-4" />
          </Link>
        </>
      )}
    </Section>
  );
};

/* ── Contact ─────────────────────────────────────────────── */

const inputCls =
  "w-full border bg-transparent px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--glow)]";

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="v2-label mb-1.5 block">{label}</span>
    {children}
    {error && (
      <span role="alert" className="mt-1.5 block text-xs text-rose-500">
        {error.message}
      </span>
    )}
  </label>
);

const CopyEmail = ({ email }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex h-8 items-center gap-1.5 border border-border px-2.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink">
      {copied ? <Check aria-hidden className="size-3.5 text-emerald-500" /> : <Copy aria-hidden className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const Contact = ({ n }) => {
  const { settings } = useSite();
  const email = settings?.email || LINKS.email;
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema), defaultValues: { name: "", email: "", message: "" }, mode: "onTouched" });

  const onSubmit = async (data) => {
    setStatus({ type: "idle", text: "" });
    try {
      await sendContactMessage(data, settings?.web3formsKey);
      reset();
      setStatus({ type: "ok", text: "Thanks, your message is in. I usually reply within 24 hours." });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    }
  };

  const border = (e) => (e ? "border-rose-500" : "border-[var(--border-strong)]");

  return (
    <Section id="contact" n={n} title="Contact" meta="Reply within 24h">
      <div className="grid md:grid-cols-[1fr_1.3fr]">
        <div className="p-5 sm:p-8">
          <h3 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[2.5rem]">
            Have an idea?
            <br />
            <span className="text-[var(--accent)]">Let&apos;s build it.</span>
          </h3>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">A new product, a role, or just a hello. Write to me directly or use the form.</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <a href={`mailto:${email}`} className="v2-link break-all font-mono text-sm">
              {email}
            </a>
            <CopyEmail email={email} />
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 border-t border-border p-5 sm:grid-cols-2 sm:p-8 md:border-l md:border-t-0" data-testid="v2-contact-form">
          <Field label="Name" error={errors.name}>
            <input {...register("name")} autoComplete="name" placeholder="Jane Doe" aria-invalid={!!errors.name} className={`${inputCls} h-11 ${border(errors.name)}`} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input {...register("email")} type="email" autoComplete="email" placeholder="jane@company.com" aria-invalid={!!errors.email} className={`${inputCls} h-11 ${border(errors.email)}`} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Message" error={errors.message}>
              <textarea {...register("message")} rows={5} placeholder="Tell me about it…" aria-invalid={!!errors.message} className={`${inputCls} resize-y py-3 ${border(errors.message)}`} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" disabled={isSubmitting} className={btn.solid} data-testid="v2-contact-submit">
              {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {isSubmitting ? "Sending…" : "Send message"}
              {!isSubmitting && <ArrowRight aria-hidden className="size-4" />}
            </button>
            {status.type !== "idle" && (
              <p role={status.type === "ok" ? "status" : "alert"} className={`text-sm ${status.type === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                {status.text}
              </p>
            )}
          </div>
        </form>
      </div>
    </Section>
  );
};

/* ── Page ────────────────────────────────────────────────── */

const Home = () => {
  const { hash, state } = useLocation();
  const { loaded, testimonials = [] } = useSite();

  const order = SECTIONS.map(([id]) => id).filter((id) => id !== "testimonials" || testimonials.length);
  const n = (id) => String(order.indexOf(id) + 1).padStart(2, "0");

  // Arriving with #section (from a sub-page or the version switch): scroll
  // there once it exists, and again after the API data has filled the page.
  useEffect(() => {
    if (!hash || state?.noScroll) return;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) clearInterval(t);
      el?.scrollIntoView({ block: "start" });
    }, 50);
    return () => clearInterval(t);
  }, [hash, state, loaded]);

  return (
    <>
      <Helmet>
        <title>Mohan Kumar Dalei · MERN Stack Developer</title>
      </Helmet>
      <Hero />
      <Hatch />
      <About n={n("about")} />
      <Hatch />
      <Section id="experience" n={n("experience")} title="Experience" meta="Since 2024">
        <Timeline groups={EXPERIENCE} />
      </Section>
      <Hatch />
      <Projects n={n("projects")} />
      <Testimonials n={n("testimonials")} />
      <Hatch />
      <Toolbox n={n("stack")} />
      <Hatch />
      <Education n={n("education")} />
      <Hatch />
      <Writing n={n("blog")} />
      <Hatch />
      <Contact n={n("contact")} />
    </>
  );
};

export default Home;
