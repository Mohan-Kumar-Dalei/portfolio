/* global __BUILD_SHA__, __BUILD_DATE__ */
import { useEffect, useLayoutEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Contrast, FileText, Github, Linkedin, Mail, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useSite } from "../context/SiteContext";
import { useSound } from "../context/SoundContext";
import { LINKS } from "../utils/links";
import { fileUrl } from "../lib/api";
import pkg from "../../package.json";
import apiPkg from "../../../backend/package.json";
import VersionSwitch from "./VersionSwitch";
import CommandMenu from "./CommandMenu";
import { REPO, SITE_HOST } from "./data";
import { goToSection } from "./scroll";

const FONT_ID = "v2-font";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap";

// v2's palette, typeface and native cursor apply while this layout is mounted.
const useV2Document = () => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-v2");
    if (!document.getElementById(FONT_ID)) {
      const link = Object.assign(document.createElement("link"), { id: FONT_ID, rel: "stylesheet", href: FONT_HREF });
      document.head.appendChild(link);
    }
    return () => root.classList.remove("is-v2");
  }, []);
};

const ver = (deps, name) => String(deps?.[name] || "").replace(/^[\^~]/, "");
const BUILD_SHA = typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : "dev";
const BUILD_DATE = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10);

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const Header = ({ onSearch }) => {
  const navigate = useNavigate();
  const { toggle, theme } = useTheme();
  const { pathname } = useLocation();
  const linkCls = "rounded-md px-2 py-1 text-sm text-ink-muted transition-colors hover:text-ink";

  return (
    <header className="v2-header sticky top-0 z-50 border-b border-border">
      <div className="v2-col flex h-12 items-center gap-1 px-3 sm:px-4">
        <Link to="/v2" className="mr-2 font-mono text-[15px] font-bold tracking-tight" aria-label="Mohan Kumar Dalei, home" data-testid="v2-logo">
          MKD<span className="animate-pulse text-ink-muted">_</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center">
          <button type="button" onClick={() => goToSection(navigate, "projects")} className={linkCls}>
            Projects
          </button>
          <Link to="/v2/blog" className={`${linkCls} ${pathname.startsWith("/v2/blog") ? "text-ink" : ""}`}>
            Blog
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search (Ctrl K)"
            className="flex h-8 items-center gap-2 rounded-md px-2 text-ink-muted transition-colors hover:bg-chip hover:text-ink"
            data-testid="v2-search"
          >
            <Search aria-hidden className="size-4" />
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded border border-border bg-chip px-1.5 py-0.5 font-mono text-[10px] leading-none">{isMac ? "⌘" : "Ctrl"}</kbd>
              <kbd className="rounded border border-border bg-chip px-1.5 py-0.5 font-mono text-[10px] leading-none">K</kbd>
            </span>
          </button>
          <VersionSwitch />
          <span aria-hidden className="mx-0.5 h-4 w-px bg-[var(--border)]" />
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors hover:bg-chip hover:text-ink"
            data-testid="v2-theme"
          >
            <Contrast aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

const Cell = ({ label, children, className = "" }) => (
  <div className={`border-b border-r border-border px-4 py-3 ${className}`}>
    <div className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
    <div className="mt-1.5 font-mono text-[13px] leading-relaxed text-ink">{children}</div>
  </div>
);

const A = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="underline decoration-[var(--border-strong)] underline-offset-[3px] transition-colors hover:decoration-[var(--text)]">
    {children}
  </a>
);

const Footer = () => {
  const { settings } = useSite();
  const socials = [
    [Github, "GitHub", settings?.github || LINKS.github],
    [Linkedin, "LinkedIn", settings?.linkedin || LINKS.linkedin],
    [FileText, "Resume", fileUrl(settings?.resumeUrl) || LINKS.resume],
    [Mail, "Email", `mailto:${settings?.email || LINKS.email}`],
  ];
  const deps = pkg.dependencies;
  const apiDeps = apiPkg.dependencies;

  return (
    <footer>
      <div className="flex items-center justify-between gap-4 px-4 py-3 font-mono text-[13px]">
        <span className="font-semibold">{SITE_HOST}</span>
        <span className="hidden text-ink-muted sm:block">A minimal portfolio. Version 2.</span>
      </div>
      <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4 [&>*:nth-child(2n)]:max-sm:border-r-0 sm:[&>*:nth-child(4n)]:border-r-0">
        <Cell label="Crafted by">
          <A href={LINKS.github}>@Mohan-Kumar-Dalei</A>
        </Cell>
        <Cell label="Build">{BUILD_SHA}</Cell>
        <Cell label="Date">{BUILD_DATE}</Cell>
        <Cell label="Version">
          v2 · <Link to="/" className="underline decoration-[var(--border-strong)] underline-offset-[3px] hover:decoration-[var(--text)]">see v1</Link>
        </Cell>
        <Cell label="Deployed on">▲ Vercel</Cell>
        <Cell label="Source code">
          <A href={REPO}>GitHub</A>
        </Cell>
        <Cell label="Database">MongoDB Atlas</Cell>
        <Cell label="Typeface">Geist</Cell>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4">
        <Cell label="Frontend" className="col-span-2 max-sm:border-r-0">
          react@{ver(deps, "react")}
          <br />
          react-router@{ver(deps, "react-router-dom")}
          <br />
          tailwindcss@{ver(pkg.devDependencies, "tailwindcss")}
          <br />
          vite@{ver(pkg.devDependencies, "vite")}
        </Cell>
        <Cell label="Backend">
          express@{ver(apiDeps, "express")}
          <br />
          mongoose@{ver(apiDeps, "mongoose")}
        </Cell>
        <Cell label="AI" className="border-r-0">
          Gemini
          <br />
          SARHA assistant
        </Cell>
      </div>
      <div className="flex justify-center">
        {socials.map(([Icon, label, href]) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={label}
            className="grid size-11 place-items-center border-r border-border text-ink-muted transition-colors first:border-l hover:bg-chip hover:text-ink"
          >
            <Icon aria-hidden className="size-4" />
          </a>
        ))}
      </div>
      <div className="v2-rule-t">
        <span aria-hidden className="v2-bigname">mohan</span>
      </div>
    </footer>
  );
};

const V2Layout = () => {
  useV2Document();
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const { disableAll } = useSound();

  // v2 is quiet: interface sounds and music from v1 stop here.
  useEffect(() => {
    disableAll();
  }, [disableAll]);

  // New page: back to the top (section links scroll themselves).
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--bg)] text-ink">
      <a href="#v2-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-[var(--text)] focus:px-3 focus:py-2 focus:text-[var(--bg)]">
        Skip to content
      </a>
      <Header onSearch={() => setSearchOpen(true)} />
      <div className="v2-col">
        <main id="v2-main">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CommandMenu open={searchOpen} setOpen={setSearchOpen} />
    </div>
  );
};

export default V2Layout;
