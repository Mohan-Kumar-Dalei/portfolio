import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { ArrowRight, FileText, FolderGit2, Github, Hash, Linkedin, Mail, Monitor, Moon, Newspaper, Search, Sun } from "lucide-react";
import { useSite } from "../context/SiteContext";
import { useTheme } from "../context/ThemeContext";
import { LINKS } from "../utils/links";
import { fileUrl } from "../lib/api";
import { SECTIONS } from "./data";
import { goToSection } from "./scroll";

const Item = ({ icon: Icon, children, hint, onSelect, value }) => (
  <Command.Item
    value={value}
    onSelect={onSelect}
    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted outline-none data-[selected=true]:bg-chip data-[selected=true]:text-ink"
  >
    <Icon aria-hidden className="size-4 shrink-0" />
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {hint && <span className="shrink-0 font-mono text-[11px] text-ink-muted">{hint}</span>}
  </Command.Item>
);

const Group = ({ heading, children }) => (
  <Command.Group
    heading={heading}
    className="px-2 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-muted"
  >
    {children}
  </Command.Group>
);

/** Ctrl/⌘ K palette: jump to a section, project or post, open links, switch theme or version. */
const CommandMenu = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { projects = [], blogs = [], settings } = useSite();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };
  const open_ = (url) => run(() => window.open(url, "_blank", "noopener,noreferrer"));

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Search the site"
      overlayClassName="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
      contentClassName="fixed left-1/2 top-[12vh] z-[91] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-[var(--bg)] text-ink shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search aria-hidden className="size-4 shrink-0 text-ink-muted" />
        <Command.Input autoFocus placeholder="Type a command or search…" className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-ink-muted" />
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:block">Esc</kbd>
      </div>
      <Command.List className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain py-1">
        <Command.Empty className="py-10 text-center text-sm text-ink-muted">No results found.</Command.Empty>

        <Group heading="Sections">
          {SECTIONS.map(([id, label]) => (
            <Item key={id} icon={Hash} value={`section ${label}`} onSelect={run(() => goToSection(navigate, id))}>
              {label}
            </Item>
          ))}
          <Item icon={Newspaper} value="page blog all posts" onSelect={run(() => navigate("/blog"))} hint="/blog">
            All blog posts
          </Item>
        </Group>

        {projects.length > 0 && (
          <Group heading="Projects">
            {projects.map((p) => (
              <Item key={p._id} icon={FolderGit2} value={`project ${p.title} ${p.category || ""}`} onSelect={run(() => navigate(`/projects/${p._id}`))}>
                {p.title}
              </Item>
            ))}
          </Group>
        )}

        {blogs.length > 0 && (
          <Group heading="Blog">
            {blogs.slice(0, 12).map((b) => (
              <Item key={b.slug} icon={FileText} value={`post ${b.title}`} onSelect={run(() => navigate(`/blog/${b.slug}`))}>
                {b.title}
              </Item>
            ))}
          </Group>
        )}

        <Group heading="Links">
          <Item icon={Github} value="github" onSelect={open_(settings?.github || LINKS.github)}>GitHub</Item>
          <Item icon={Linkedin} value="linkedin" onSelect={open_(settings?.linkedin || LINKS.linkedin)}>LinkedIn</Item>
          <Item icon={FileText} value="resume cv" onSelect={open_(fileUrl(settings?.resumeUrl) || LINKS.resume)}>Resume</Item>
          <Item icon={Mail} value="email mail contact" onSelect={run(() => (window.location.href = `mailto:${settings?.email || LINKS.email}`))}>
            Email
          </Item>
        </Group>

        <Group heading="Settings">
          <Item icon={theme === "dark" ? Sun : Moon} value="theme dark light mode toggle" onSelect={run(toggle)}>
            Switch to {theme === "dark" ? "light" : "dark"} theme
          </Item>
          <Item icon={Monitor} value="version v1 classic animated site" onSelect={run(() => navigate("/v1"))} hint="v1">
            Open version 1 (animated site)
          </Item>
        </Group>
      </Command.List>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <ArrowRight aria-hidden className="size-3" /> Enter to open
        </span>
        <span>↑↓ to move</span>
      </div>
    </Command.Dialog>
  );
};

export default CommandMenu;
