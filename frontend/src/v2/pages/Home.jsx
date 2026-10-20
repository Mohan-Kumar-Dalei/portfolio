import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  ChevronDown,
  Clock,
  Code2,
  FileText,
  Github,
  Globe,
  Lightbulb,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Trophy,
} from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { LINKS } from "../../utils/links";
import { fileUrl } from "../../lib/api";
import { contactSchema, sendContactMessage } from "../../lib/contact";
import { ACHIEVEMENTS, CERTIFICATIONS, EDUCATION, EXPERIENCE, PROFILE_FALLBACK, PROFILE_IMG, ROLES, SITE_HOST, STACK } from "../data";
import { Chip, Group, Hatch, IconBox, Section, useClock } from "../ui";

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

/* ── Profile ─────────────────────────────────────────────── */

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

const InfoRow = ({ icon: Icon, children, href }) => (
  <div className="flex min-w-0 items-center gap-3">
    <IconBox>
      <Icon aria-hidden className="size-3.5" />
    </IconBox>
    {href ? (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="truncate underline-offset-[3px] hover:underline">
        {children}
      </a>
    ) : (
      <span className="truncate">{children}</span>
    )}
  </div>
);

const Profile = () => {
  const { settings } = useSite();
  const time = useClock();
  const [img, setImg] = useState(PROFILE_IMG);
  const email = settings?.email || LINKS.email;
  const socials = [
    [Github, "GitHub", settings?.github || LINKS.github],
    [Linkedin, "LinkedIn", settings?.linkedin || LINKS.linkedin],
    [FileText, "Resume", fileUrl(settings?.resumeUrl) || LINKS.resume],
    [Mail, "Email", `mailto:${email}`],
  ];

  return (
    <div className="v2-fade">
      {/* Cover */}
      <div className="v2-rule-b relative grid aspect-[2.6/1] place-items-center overflow-hidden sm:aspect-[3.6/1]">
        <div aria-hidden className="v2-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" />
        <code className="relative px-4 text-center font-mono text-[11px] leading-relaxed text-ink-muted sm:text-[13px]">
          <span className="text-ink">const</span> mohan = {"{"} stack: <span className="text-ink">&quot;MERN&quot;</span>, focus:{" "}
          <span className="text-ink">&quot;Agentic AI&quot;</span>, based: <span className="text-ink">&quot;Odisha&quot;</span> {"}"};
        </code>
      </div>

      {/* Avatar + name */}
      <div className="v2-rule-b flex">
        <div className="shrink-0 border-r border-border p-1 sm:p-1.5">
          <img
            src={img}
            onError={() => img !== PROFILE_FALLBACK && setImg(PROFILE_FALLBACK)}
            alt="Mohan Kumar Dalei, MERN stack developer from Odisha, India"
            className="size-28 select-none rounded-full bg-chip object-cover ring-1 ring-[var(--border)] ring-offset-2 ring-offset-[var(--bg)] sm:size-36"
            draggable={false}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-end">
          <div className="flex flex-1 items-end px-4 pb-2 font-mono text-xs text-ink-muted">
            <span>{"// hello, world"}</span>
          </div>
          <div className="border-t border-border px-4 py-2">
            <h1 className="text-[1.45rem] font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
              Mohan Kumar{" "}
              <span className="whitespace-nowrap">
                Dalei
                <BadgeCheck aria-label="Verified" className="mb-1 ml-2 inline size-5 text-sky-500" />
              </span>
            </h1>
          </div>
          <div className="h-9 overflow-hidden border-t border-border px-4 py-2 font-mono text-[13px] text-ink-muted">
            <RoleFlip />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="v2-rule-b grid gap-x-6 gap-y-3 px-4 py-4 font-mono text-[13px] sm:grid-cols-2">
        <InfoRow icon={Code2}>Technical Analyst @Contify</InfoRow>
        <InfoRow icon={Lightbulb} href="https://apex-ui.in">
          Creator @Apex UI
        </InfoRow>
        <InfoRow icon={MapPin}>{settings?.location || "Bhubaneswar, Odisha"}</InfoRow>
        <InfoRow icon={Clock}>
          <span className="tabular-nums">{time}</span> <span className="text-ink-muted">(IST)</span>
        </InfoRow>
        <InfoRow icon={Mail} href={`mailto:${email}`}>
          {email}
        </InfoRow>
        <InfoRow icon={Link2} href={`https://${SITE_HOST}`}>
          {SITE_HOST}
        </InfoRow>
        {settings?.availability && (
          <div className="flex items-center gap-3 sm:col-span-2">
            <IconBox>
              <span className={`size-2 rounded-full ${settings.availabilityOpen === false ? "bg-amber-500" : "bg-emerald-500"}`} />
            </IconBox>
            <span>{settings.availability}</span>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="v2-rule-b flex items-center gap-2 px-4 py-3">
        {socials.map(([Icon, label, href]) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="grid size-8 place-items-center rounded-md border border-border bg-chip text-ink-muted transition-colors hover:text-ink"
          >
            <Icon aria-hidden className="size-4" />
          </a>
        ))}
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--text)] px-3 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-85"
        >
          Let&apos;s talk <ArrowRight aria-hidden className="size-3.5" />
        </a>
      </div>
    </div>
  );
};

/* ── About ───────────────────────────────────────────────── */

const About = () => (
  <Section id="about" title="About">
    <div className="space-y-4 px-4 py-4 text-[15px] leading-relaxed text-ink-muted">
      <p>
        Hello, World! I&apos;m <strong className="font-medium text-ink">Mohan Kumar Dalei</strong>, a B.Tech CSE graduate and{" "}
        <strong className="font-medium text-ink">MERN stack developer</strong> from Odisha who builds things that feel fast, thoughtful and
        premium. By day I&apos;m a <strong className="font-medium text-ink">Technical Analyst at Contify</strong>; the rest of the time I ship
        full-stack products powered by AI.
      </p>
      <p>
        I learned the craft through internships, certifications and a lot of personal projects, from{" "}
        <strong className="font-medium text-ink">ApexOS</strong>, a desktop that runs in the browser, to{" "}
        <a href="https://apex-ui.in" target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-[var(--border-strong)] underline-offset-[3px] hover:decoration-[var(--text)]">
          Apex UI
        </a>
        , a React component library with its own NPM CLI.
      </p>
      <p>
        Lately it&apos;s <strong className="font-medium text-ink">Agentic AI</strong>: Gemini-powered assistants, voice interfaces, scraping tools
        and an exam-preparation coach. I use AI to do the heavy lifting while keeping full control over the architecture, the data and the
        details.
      </p>
      <p>Let&apos;s connect and build something together!</p>
    </div>
  </Section>
);

/* ── Testimonials ────────────────────────────────────────── */

const initials = (name = "") =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Testimonials = () => {
  const { testimonials = [] } = useSite();
  if (!testimonials.length) return null;
  const loop = [...testimonials, ...testimonials];

  return (
    <>
      <Hatch />
      <Section id="testimonials" title="What people say">
        <div className="v2-marquee" style={{ "--v2-marquee-time": `${Math.max(30, testimonials.length * 9)}s` }}>
          <ul className="v2-marquee-track">
            {loop.map((t, i) => (
              <li key={`${t._id}-${i}`} aria-hidden={i >= testimonials.length} className="flex w-72 shrink-0 flex-col justify-between gap-4 border-r border-border p-4">
                <p className="text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  {t.avatar ? (
                    <img src={fileUrl(t.avatar)} alt="" loading="lazy" className="size-8 rounded-full border border-border object-cover" />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full border border-border bg-chip font-mono text-[10px] font-semibold text-ink-muted">
                      {initials(t.name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.name}</span>
                    <span className="block truncate text-xs text-ink-muted">{[t.role, t.company].filter(Boolean).join(" · ")}</span>
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

/* ── Stack ───────────────────────────────────────────────── */

const Stack = () => (
  <Section id="stack" title="Stack">
    <div className="v2-stack">
      {STACK.map((g, i) => (
        <div key={g.title} className="grid sm:grid-cols-[13rem_1fr]">
          <div className="flex items-baseline gap-3 px-4 pt-3 sm:border-r sm:border-border sm:py-3">
            <span className="font-mono text-xs text-ink-muted">0{i + 1}</span>
            <span className="text-[15px] font-medium">{g.title}</span>
          </div>
          <div className="flex flex-wrap gap-2 px-4 pb-4 pt-2.5 sm:py-3">
            {g.items.map(([name, Icon]) => (
              <Chip key={name} icon={Icon}>
                {name}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Section>
);

/* ── Projects ────────────────────────────────────────────── */

const firstSentences = (text = "", n = 2) =>
  (String(text).match(/[^.!?]+[.!?]+/g) || [String(text)])
    .slice(0, n)
    .map((s) => s.trim())
    .filter(Boolean);

const IconLink = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    onClick={(e) => e.stopPropagation()}
    className="grid size-5 shrink-0 place-items-center rounded text-ink-muted transition-colors hover:text-ink"
  >
    {children}
  </a>
);

export const projectGroup = (p) => {
  const live = p.liveLink && p.liveLink !== "#" ? p.liveLink : "";
  return {
    org: p.title,
    logo: fileUrl(p.image),
    initials: initials(p.title),
    actions: (
      <span className="flex items-center gap-0.5 font-normal">
        {live && (
          <IconLink href={live} label={`${p.title} live site`}>
            <ArrowUpRight aria-hidden className="size-3.5" />
          </IconLink>
        )}
        {p.githubLink && (
          <IconLink href={p.githubLink} label={`${p.title} source code`}>
            <Github aria-hidden className="size-3.5" />
          </IconLink>
        )}
      </span>
    ),
    positions: [
      {
        title: p.subtitle || p.category || "Project",
        icon: Globe,
        type: p.category,
        period: p.createdAt ? String(new Date(p.createdAt).getFullYear()) : "",
        duration: live ? "Live" : "",
        bullets: p.features?.length ? p.features.slice(0, 3) : firstSentences(p.description),
        skills: p.techStack,
        body: (
          <Link
            to={`/v2/projects/${p._id}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink underline decoration-[var(--border-strong)] underline-offset-[3px] hover:decoration-[var(--text)]"
          >
            Read the case study <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        ),
      },
    ],
  };
};

const PAGE = 4;

const Projects = () => {
  const { projects = [], loaded } = useSite();
  const [all, setAll] = useState(false);
  const shown = all ? projects : projects.slice(0, PAGE);

  return (
    <Section id="projects" title="Projects" count={projects.length || null}>
      {!loaded ? (
        <p className="px-4 py-6 font-mono text-sm text-ink-muted">Loading projects…</p>
      ) : (
        <div className="v2-stack">
          {shown.map((p) => (
            <Group key={p._id} group={projectGroup(p)} />
          ))}
          {projects.length > PAGE && (
            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={() => setAll((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-chip px-4 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
              >
                {all ? "Show fewer projects" : `Show more projects (${projects.length - PAGE})`}
                <ChevronDown aria-hidden className={`size-4 transition-transform ${all ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
        </div>
      )}
    </Section>
  );
};

/* ── Certifications & achievements ───────────────────────── */

const Certifications = () => (
  <Section id="certifications" title="Certifications" count={CERTIFICATIONS.length}>
    <div className="v2-stack">
      {CERTIFICATIONS.map((c) => (
        <a key={c.title} href={c.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-chip">
          <IconBox className="size-8 rounded-lg">
            <Award aria-hidden className="size-4" />
          </IconBox>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-medium">{c.title}</span>
            <span className="mt-0.5 flex items-center gap-2 text-sm text-ink-muted">
              <span className="truncate">@{c.org}</span>
              <span aria-hidden className="h-3.5 w-px bg-[var(--border-strong)]" />
              <span className="shrink-0 font-mono text-[13px]">{c.date}</span>
            </span>
          </span>
          <ArrowUpRight aria-hidden className="size-4 shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
        </a>
      ))}
    </div>
  </Section>
);

const Achievements = () => (
  <Section id="achievements" title="Achievements" count={ACHIEVEMENTS.length}>
    <ul className="v2-stack">
      {ACHIEVEMENTS.map((a) => (
        <li key={a} className="flex items-center gap-3 px-4 py-3 text-[15px]">
          <IconBox>
            <Trophy aria-hidden className="size-3.5" />
          </IconBox>
          {a}
        </li>
      ))}
    </ul>
  </Section>
);

/* ── Blog ────────────────────────────────────────────────── */

export const PostRow = ({ post }) => (
  <Link to={`/v2/blog/${post.slug}`} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-chip">
    <span className="hidden w-28 shrink-0 font-mono text-[13px] text-ink-muted sm:block">{fmtDate(post.createdAt)}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-medium leading-snug">{post.title}</span>
      <span className="mt-0.5 block font-mono text-xs text-ink-muted sm:hidden">
        {fmtDate(post.createdAt)} · {post.category}
      </span>
    </span>
    <span className="hidden shrink-0 sm:block">
      <Chip>{post.category}</Chip>
    </span>
    <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
  </Link>
);

const Blog = () => {
  const { blogs = [], loaded } = useSite();
  const posts = blogs.filter((b) => b.published !== false);
  return (
    <Section id="blog" title="Blog" count={posts.length || null}>
      {!loaded ? (
        <p className="px-4 py-6 font-mono text-sm text-ink-muted">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-muted">No posts yet.</p>
      ) : (
        <div className="v2-stack">
          {posts.slice(0, 4).map((b) => (
            <PostRow key={b.slug} post={b} />
          ))}
          <div className="flex justify-center py-4">
            <Link to="/v2/blog" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-chip px-4 text-sm font-medium transition-colors hover:bg-[var(--surface)]">
              All posts <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
};

/* ── Contact ─────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-md border bg-transparent px-3 text-[15px] outline-none transition-colors placeholder:text-ink-muted focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--chip)]";

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">{label}</span>
    {children}
    {error && (
      <span role="alert" className="mt-1.5 block text-xs text-rose-500">
        {error.message}
      </span>
    )}
  </label>
);

const Contact = () => {
  const { settings } = useSite();
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

  const border = (e) => (e ? "border-rose-500" : "border-border");

  return (
    <Section id="contact" title="Contact">
      <div className="px-4 py-4">
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Have a project, a role or an idea? Send a message or email{" "}
          <a href={`mailto:${settings?.email || LINKS.email}`} className="font-medium text-ink underline decoration-[var(--border-strong)] underline-offset-[3px] hover:decoration-[var(--text)]">
            {settings?.email || LINKS.email}
          </a>
          .
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 grid gap-4 sm:grid-cols-2" data-testid="v2-contact-form">
          <Field label="Name" error={errors.name}>
            <input {...register("name")} autoComplete="name" placeholder="Jane Doe" aria-invalid={!!errors.name} className={`${inputCls} h-10 ${border(errors.name)}`} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input {...register("email")} type="email" autoComplete="email" placeholder="jane@company.com" aria-invalid={!!errors.email} className={`${inputCls} h-10 ${border(errors.email)}`} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Message" error={errors.message}>
              <textarea {...register("message")} rows={4} placeholder="Tell me about it…" aria-invalid={!!errors.message} className={`${inputCls} resize-y py-2 ${border(errors.message)}`} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-85 disabled:opacity-60"
              data-testid="v2-contact-submit"
            >
              {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <ArrowRight aria-hidden className="size-4" />}
              {isSubmitting ? "Sending…" : "Send message"}
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
  const { loaded } = useSite();

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
      <Profile />
      <Hatch />
      <About />
      <Testimonials />
      <Hatch />
      <Stack />
      <Hatch />
      <Section id="experience" title="Experience">
        <div className="v2-stack">
          {EXPERIENCE.map((g) => (
            <Group key={g.org} group={g} />
          ))}
        </div>
      </Section>
      <Hatch />
      <Projects />
      <Hatch />
      <Section id="education" title="Education">
        <div className="v2-stack">
          {EDUCATION.map((g) => (
            <Group key={g.org} group={g} />
          ))}
        </div>
      </Section>
      <Hatch />
      <Certifications />
      <Hatch />
      <Achievements />
      <Hatch />
      <Blog />
      <Hatch />
      <Contact />
      <Hatch />
    </>
  );
};

export default Home;
