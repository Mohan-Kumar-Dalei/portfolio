import { cloneElement, useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SmoothScroll, useLenis } from "../hooks/useLenis";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import Preloader from "./Preloader";

const ScrollManager = () => {
  const location = useLocation();
  const lenisRef = useLenis();
  useEffect(() => {
    lenisRef?.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => clearTimeout(t);
  }, [location.pathname, lenisRef]);

  // Trigger positions are measured once, so anything that changes the page
  // height afterwards (API data, images, fonts, a page transition finishing)
  // leaves later scenes like "Let's talk" starting in the wrong place.
  // Re-measure whenever <main> settles at a new height.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    let last = main.offsetHeight;
    let t;
    const ro = new ResizeObserver(() => {
      if (Math.abs(main.offsetHeight - last) < 2) return;
      clearTimeout(t);
      t = setTimeout(() => {
        ScrollTrigger.refresh();
        last = main.offsetHeight;
      }, 250);
    });
    ro.observe(main);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);
  return null;
};

// Shared filter for .text-outline: grow the solid glyph by 1px and cut the
// glyph itself out, leaving a clean ring around the letter's silhouette.
const OutlineFilter = () => (
  <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
    <filter id="text-outline" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
      <feMorphology in="SourceGraphic" operator="dilate" radius="1" result="grown" />
      <feComposite in="grown" in2="SourceGraphic" operator="out" />
    </filter>
  </svg>
);

// A new key per path remounts the page, which replays its CSS entrance.
// The next page mounts straight away (no waiting on an exit animation).
const AnimatedOutlet = () => {
  const location = useLocation();
  const element = useOutlet();
  return element ? cloneElement(element, { key: location.pathname }) : null;
};

const Layout = () => {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem("mkd_preloaded"));
  const firstRef = useRef(true);

  const handleReady = () => {
    setLoading(false);
    sessionStorage.setItem("mkd_preloaded", "1");
    window.dispatchEvent(new Event("mkd:preloaded")); // SoundIntro waits for this
    setTimeout(() => ScrollTrigger.refresh(), 300);
  };

  return (
    <SmoothScroll>
      <OutlineFilter />
      {loading && firstRef.current && <Preloader onComplete={handleReady} />}
      <ScrollProgress />
      <ScrollManager />
      <Navbar />
      <main className="relative z-10" style={{ backgroundColor: "var(--bg)" }}>
        <AnimatedOutlet />
      </main>
      {/* The page's rounded, shadowed bottom edge lives on this small cap rather
          than on <main>: clipping/shadowing a ~17k px tall element forced big
          repaints while scrolling and made the lifting edge flicker. The
          footer tucks under the cap, so its top edge is never exposed. On pages
          that end with the "Let's talk" scene the cap continues its gradient. */}
      <div
        aria-hidden
        className="page-cap relative z-10 -mt-px h-16 rounded-b-[2rem] md:rounded-b-[3rem]"
      />
      <Footer />
    </SmoothScroll>
  );
};

export default Layout;
