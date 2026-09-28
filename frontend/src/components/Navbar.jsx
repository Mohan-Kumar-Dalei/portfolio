import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LiquidGlass from "./LiquidGlass";
import { ArrowUpRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSite } from "../context/SiteContext";
import { LINKS } from "../utils/links";
import { fileUrl } from "../lib/api";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Experience", to: "/experience" },
  { label: "Services", to: "/services" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const EASE = [0.76, 0, 0.24, 1];
const isActivePath = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

/**
 * Floating island navbar. The bar is a liquid-glass pill styled after
 * fooontic's "Liquid Glass Switcher. CSS" (codepen.io/fooontic/pen/KwpRaGr, MIT):
 * blur + SVG refraction + saturation on the backdrop and a layered reflex
 * shadow. Inside, a highlight pill glides to whichever link is hovered.
 */
const Navbar = () => {
  const { settings } = useSite();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // At the very top the bar is clear and merges into the page; the liquid
  // glass fades in once the page scrolls beneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const resume = fileUrl(settings?.resumeUrl) || LINKS.resume;
  const activeLabel = navItems.find((item) => isActivePath(location.pathname, item.to))?.label || "";

  // The highlight pill sits under the hovered link, else the active one. It is
  // positioned from the link's offset inside the nav and moved with a CSS
  // transition, so page scroll and route changes can never throw it off
  // (framer's shared-layout version flew in from below after a scroll + route change).
  const linkRefs = useRef({});
  const target = hovered || activeLabel;
  const targetRef = useRef(target);
  targetRef.current = target;
  const [pill, setPill] = useState(null); // { x, w } or null
  const [pillReady, setPillReady] = useState(false);
  const measurePill = useCallback(() => {
    const el = linkRefs.current[targetRef.current];
    setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
  }, []);
  // Re-measure when the target changes and also when the active page changes:
  // the active dot moves between links and shifts their widths even if the
  // hovered link (the target) stays the same.
  useLayoutEffect(measurePill, [target, activeLabel, measurePill]);
  useEffect(() => {
    // ...and whenever any link or the bar resizes (fonts loading, viewport).
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measurePill);
    Object.values(linkRefs.current).forEach((el) => el && ro.observe(el));
    document.fonts?.ready.then(measurePill);
    return () => ro.disconnect();
  }, [measurePill]);
  useEffect(() => {
    // Place it first, then enable the glide, so it doesn't slide in from 0 on load.
    if (pill && !pillReady) requestAnimationFrame(() => setPillReady(true));
  }, [pill, pillReady]);

  return (
    <>
      <header
        className="nav-enter liquid-nav fixed top-0 left-0 right-0 z-[80] h-[5rem] md:h-[5.5rem] pointer-events-none"
        data-testid="navbar"
      >
        <div className="flex h-full items-center justify-center">
        <LiquidGlass
          bezel={28}
          strength={130}
          frost={3}
          saturation={1.7}
          active={scrolled || open}
          className="glass-switch pointer-events-auto flex h-14 w-[min(84rem,calc(100vw-1.5rem))] items-center justify-between rounded-full pl-5 pr-2 text-ink"
        >
            <Link to="/" className="font-display text-xl font-bold tracking-tight" data-testid="nav-logo">
              <span className="text-gradient">MKD</span>
              <span className="text-primary">.</span>
            </Link>

            <nav
              ref={(el) => (linkRefs.current.__nav = el)}
              aria-label="Primary"
              className="relative hidden lg:flex items-center gap-1"
              onMouseLeave={() => setHovered(null)}
            >
              <span
                aria-hidden
                className={`nav-pill pointer-events-none absolute inset-y-0 left-0 rounded-full ${
                  pillReady ? "transition-[transform,width,opacity] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
                }`}
                style={{ width: pill?.w || 0, transform: `translateX(${pill?.x || 0}px)`, opacity: pill ? 1 : 0 }}
                data-testid="nav-pill"
              />
              {navItems.map((item) => {
                const active = isActivePath(location.pathname, item.to);
                return (
                  <NavLink
                    key={item.label}
                    ref={(el) => (linkRefs.current[item.label] = el)}
                    to={item.to}
                    end={item.to === "/"}
                    onMouseEnter={() => setHovered(item.label)}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`relative rounded-full px-3 xl:px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      active || hovered === item.label ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-grad px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03]"
                data-testid="nav-resume"
              >
                Resume <ArrowUpRight size={14} />
              </a>
              <button
                className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-ink"
                onClick={() => setOpen((v) => !v)}
                data-testid="nav-mobile-toggle"
                aria-label="Toggle menu"
              >
                <span className="flex flex-col gap-1.5">
                  <span className={`block h-px w-5 bg-current transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
                  <span className={`block h-px w-5 bg-current transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
                </span>
              </button>
            </div>
        </LiquidGlass>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-[79] lg:hidden bg-base flex flex-col justify-center px-6 pt-20"
            data-testid="mobile-menu"
            data-lenis-prevent
          >
            {navItems.map((item, i) => (
              <div key={item.label} className="overflow-hidden border-b border-border">
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "110%" }}
                  transition={{ duration: 0.7, delay: 0.12 + i * 0.05, ease: EASE }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                    className={({ isActive }) =>
                      `flex items-baseline justify-between py-3 font-display text-4xl font-bold tracking-tight ${isActive ? "text-gradient" : "text-ink"}`
                    }
                  >
                    {item.label}
                    <span className="label text-ink-muted">0{i + 1}</span>
                  </NavLink>
                </motion.div>
              </div>
            ))}
            <a href={resume} target="_blank" rel="noreferrer" className="mt-8 self-start rounded-full bg-grad px-6 py-3 font-semibold text-white">
              Resume ↗
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
