import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLenis } from "../hooks/useLenis";
import { useSite } from "../context/SiteContext";
import { LINKS } from "../utils/links";
import { Roll } from "./editorial";

const footerNav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Experience", to: "/experience" },
  { label: "Services", to: "/services" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const useIndiaTime = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
};

const Footer = () => {
  const lenisRef = useLenis();
  const { settings } = useSite();
  const time = useIndiaTime();
  const toTop = () => lenisRef?.current?.scrollTo(0);
  const github = settings?.github || LINKS.github;
  const linkedin = settings?.linkedin || LINKS.linkedin;
  const email = settings?.email || LINKS.email;

  // Reveal: on md+ the footer is sticky to the bottom of the viewport, so the
  // page (z-10, rounded bottom) scrolls up off it while it stays put. The
  // -mt-16 tucks its top edge under the page even at the very end.
  return (
    <footer className="relative z-0 md:sticky md:bottom-0 -mt-16 bg-surface pt-24 md:pt-28 overflow-hidden" data-testid="footer">
      <div>
      <div className="wrap">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <div className="label text-ink-muted">(Say hello)</div>
            <p className="mt-5 font-display text-[clamp(2rem,4.2vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
              Have an idea worth building?{" "}
              <span className="accent-serif text-gradient">Let&apos;s talk.</span>
            </p>
            <a href={`mailto:${email}`} className="group mt-8 inline-flex text-lg md:text-xl font-medium" data-testid="footer-email">
              <span className="u-link-static pb-1">{email}</span>
            </a>
          </div>

          <div className="col-span-6 lg:col-span-3">
            <div className="label text-ink-muted mb-5">Index</div>
            <ul className="space-y-2">
              {footerNav.map((n) => (
                <li key={n.label}>
                  <Link to={n.to} className="group text-ink hover:text-primary transition-colors duration-300">
                    <Roll>{n.label}</Roll>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 lg:col-span-3">
            <div className="label text-ink-muted mb-5">Elsewhere</div>
            <ul className="space-y-2">
              <li><a href={github} target="_blank" rel="noreferrer" className="group hover:text-primary transition-colors duration-300" data-testid="footer-github"><Roll>GitHub ↗</Roll></a></li>
              <li><a href={linkedin} target="_blank" rel="noreferrer" className="group hover:text-primary transition-colors duration-300" data-testid="footer-linkedin"><Roll>LinkedIn ↗</Roll></a></li>
              <li><a href={`mailto:${email}`} className="group hover:text-primary transition-colors duration-300"><Roll>Email ↗</Roll></a></li>
            </ul>
            <div className="mt-8 label text-ink-muted">Local time</div>
            <div className="mt-2 font-medium tabular-nums">{time} · IST</div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 label text-ink-muted">
          <span>© {new Date().getFullYear()} Mohan Kumar Dalei</span>
          <span className="hidden md:inline">Bhubaneswar, Odisha</span>
          <button onClick={toTop} className="group text-ink" data-testid="footer-to-top">
            <Roll>Back to top ↑</Roll>
          </button>
        </div>
      </div>

      {/* Wordmark */}
      <div className="mt-8 pb-6 md:pb-8 select-none text-center">
        <div aria-hidden className="title-xl whitespace-nowrap leading-[0.8] text-[clamp(3.5rem,9vw,11rem)] text-ink-muted opacity-30">Mohan</div>
        <div className="mt-4 label text-ink-muted">Built with love from Odisha</div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
