import { useEffect, useLayoutEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, Contrast, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useSound } from "../context/SoundContext";
import VersionSwitch from "./VersionSwitch";
import CommandMenu from "./CommandMenu";
import { goToSection } from "./scroll";
import { useVisits } from "../lib/visits";
import { Cells, Hatch } from "./ui";

const FONT_ID = "v2-font";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap";

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

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const NAV = [
  ["about", "About"],
  ["projects", "Work"],
  ["blog", "Writing"],
  ["contact", "Contact"],
];

const Header = ({ onSearch }) => {
  const navigate = useNavigate();
  const { toggle, theme } = useTheme();
  const cell = "flex h-full items-center border-l border-border";

  return (
    <header className="v2-header sticky top-0 z-50">
      <div className="v2-frame flex h-12 items-stretch border-b border-border">
        <Link to="/" className="flex items-center px-4 text-[15px] font-semibold tracking-[-0.02em] sm:px-5" data-testid="v2-logo">
          Mohan<span className="text-[var(--accent)]">.</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-stretch border-l border-border md:flex">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => (id === "blog" ? navigate("/blog") : goToSection(navigate, id))}
              className="px-3.5 text-sm text-ink-muted transition-colors hover:bg-chip hover:text-ink"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-stretch">
          <div className={cell}>
            <button
              type="button"
              onClick={onSearch}
              aria-label="Search (Ctrl K)"
              className="flex h-full items-center gap-2 px-3 text-ink-muted transition-colors hover:bg-chip hover:text-ink sm:px-4"
              data-testid="v2-search"
            >
              <Search aria-hidden className="size-4" />
              <kbd className="hidden border border-border px-1.5 py-0.5 font-mono text-[10px] leading-none sm:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
          </div>
          <div className={`${cell} px-2.5 sm:px-3`}>
            <VersionSwitch />
          </div>
          <div className={cell}>
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="grid h-full w-12 place-items-center text-ink-muted transition-colors hover:bg-chip hover:text-ink"
              data-testid="v2-theme"
            >
              <Contrast aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Under the big name: how many people have visited the site.
const VisitCount = () => {
  const counts = useVisits();
  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 pb-10 pt-4 text-center font-mono text-xs text-ink-muted" data-testid="v2-visits">
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-60" />
        <span className="relative size-2 rounded-full bg-[var(--accent)]" />
      </span>
      {counts ? (
        <>
          <span>
            <span className="text-[15px] font-semibold tabular-nums text-ink">{fmt(counts.visitors)}</span> people have visited
          </span>
          <span aria-hidden className="text-[var(--border-strong)]">·</span>
          <span>
            <span className="tabular-nums text-ink">{fmt(counts.visits)}</span> visits in total
          </span>
        </>
      ) : (
        <span>Counting visitors…</span>
      )}
    </p>
  );
};

const Footer = () => (
  <footer>
    <Hatch />
    <Cells cols="grid-cols-1 sm:grid-cols-3" className="v2-rule-b">
      <p className="px-5 py-4 text-[13px] text-ink-muted">© {new Date().getFullYear()} Mohan Kumar Dalei. Designed and built in Odisha.</p>
      <p className="px-5 py-4 font-mono text-[11px] text-ink-muted sm:text-center">React · Express · MongoDB · v2</p>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex items-center gap-1.5 px-5 py-4 text-left text-[13px] text-ink-muted transition-colors hover:bg-chip hover:text-ink sm:justify-end"
      >
        Back to top <ArrowUp aria-hidden className="size-3.5" />
      </button>
    </Cells>
    <span aria-hidden className="v2-bigname">
      mohan
    </span>
    <VisitCount />
  </footer>
);

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
      <a
        href="#v2-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-[var(--text)] focus:px-4 focus:py-2 focus:text-[var(--bg)]"
      >
        Skip to content
      </a>
      <Header onSearch={() => setSearchOpen(true)} />
      <div className="v2-frame">
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
