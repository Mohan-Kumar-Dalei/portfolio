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

    /*
     * The hover state is read from whatever is under the pointer right now,
     * not toggled by mouseover/mouseout. When a click swaps the page, the
     * hovered link is removed from the DOM and never fires mouseout, which
     * left the ring stuck in its "View"/hover state; scrolling under a still
     * pointer had the same effect.
     */
    const interactive = "a, button, input, textarea, select, label, [role='button'], [data-cursor='hover']";
    let x = -1;
    let y = -1;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = x < 0 ? null : document.elementFromPoint(x, y);
      const view = el?.closest("[data-cursor='view']");
      const hover = !view && el?.closest(interactive);
      ring.classList.toggle("is-view", !!view);
      ring.classList.toggle("is-hover", !!hover);
      if (view) labelRef.current.textContent = view.getAttribute("data-cursor-label") || "View";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const timers = new Set();
    // after a click the next page mounts without any mouse movement
    const recheckSoon = () => [60, 350, 800].forEach((ms) => timers.add(setTimeout(schedule, ms)));

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      dotX(x);
      dotY(y);
      ringX(x);
      ringY(y);
      document.documentElement.classList.add("cursor-ready");
      schedule();
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => {
      ring.classList.remove("is-down");
      recheckSoon();
    };
    const onLeave = () => {
      document.documentElement.classList.remove("cursor-ready");
      ring.classList.remove("is-view", "is-hover", "is-down");
      x = y = -1;
    };
    const onBlur = () => ring.classList.remove("is-down");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("popstate", recheckSoon);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onBlur);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("popstate", recheckSoon);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onBlur);
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
