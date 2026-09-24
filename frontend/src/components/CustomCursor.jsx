import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Two-part cursor: a precise violet dot plus a softer ring that trails it.
 * The ring swells over links and buttons, and over `data-cursor="view"`
 * elements it fills in and shows a label (`data-cursor-label`, default "View").
 */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

    const onMove = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      document.documentElement.classList.add("cursor-ready");
    };
    const interactive = "a, button, input, textarea, select, [data-cursor='hover']";
    const onOver = (e) => {
      const view = e.target.closest("[data-cursor='view']");
      if (view) {
        ring.classList.add("is-view");
        labelRef.current.textContent = view.getAttribute("data-cursor-label") || "View";
      } else if (e.target.closest(interactive)) {
        ring.classList.add("is-hover");
      }
    };
    const onOut = (e) => {
      if (e.target.closest("[data-cursor='view']")) ring.classList.remove("is-view");
      if (e.target.closest(interactive)) ring.classList.remove("is-hover");
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onLeave = () => document.documentElement.classList.remove("cursor-ready");

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring hidden md:grid">
        <span ref={labelRef} className="cursor-label">View</span>
      </div>
      <div ref={dotRef} className="cursor-dot hidden md:block" />
    </>
  );
};

export default CustomCursor;
