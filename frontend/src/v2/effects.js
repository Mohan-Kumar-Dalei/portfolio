import { useEffect } from "react";

/* Two small motion touches for v2. Both stay off when the visitor prefers
   reduced motion. */

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Water drop: a drop falls and ripples spread at every click / tap (styles: .v2-burst). */
export const useClickBurst = () => {
  useEffect(() => {
    if (reduced()) return;
    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const burst = document.createElement("span");
      burst.className = "v2-burst";
      burst.setAttribute("aria-hidden", "true");
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      burst.appendChild(document.createElement("b")); // the drop
      for (const d of [0.22, 0.38, 0.54]) {
        const ring = document.createElement("i");
        ring.style.setProperty("--d", `${d}s`);
        burst.appendChild(ring);
      }
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 1400);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
};

// What rises into view: text, cards and each box of a cell grid. A match
// inside another match is left alone, so a card animates as one piece
// instead of every line in it moving separately.
const TARGETS = "h1, h2, h3, p, li, blockquote, figure, article, dl, iframe, pre, table, .v2-cells > div > *";

/**
 * Text and cards fade up out of a blur as they scroll into view. Content
 * that is already on screen when it appears is shown as is (no flash), and
 * content added later (API data, a new page) is picked up automatically.
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const root = document.getElementById("v2-main");
    if (!root || reduced() || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        let n = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.style.transitionDelay = `${Math.min(n++, 6) * 70}ms`;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    const prepare = () => {
      root.querySelectorAll(TARGETS).forEach((el) => {
        if (el.dataset.rv || el.parentElement?.closest("[data-rv]")) return;
        el.dataset.rv = "1";
        el.classList.add("v2-rv");
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in", "v2-rv-now");
        else io.observe(el);
      });
    };

    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), prepare()));
    };
    prepare();
    const mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
};
