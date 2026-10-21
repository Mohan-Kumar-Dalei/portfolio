import { useEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01ABCDEFabcdef";
const random = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Text that settles out of random characters, left to right, when it first
 * appears (page open / reload). `parts` keeps per-piece styling:
 * [{ text: "const", className: "text-emerald-300" }, { text: " mohan = " }, …]
 * Screen readers get the final text; reduced motion shows it straight away.
 */
const Scramble = ({ parts, duration = 1400, delay = 250 }) => {
  const chars = parts.flatMap((p) => [...p.text].map((ch) => ({ ch, className: p.className })));
  const full = chars.map((c) => c.ch).join("");
  const [shown, setShown] = useState(() => chars.map((c) => (c.ch === " " ? " " : random())));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    let raf = 0;
    let last = 0;
    const start = performance.now() + delay;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      // each character locks in a little after the one before it
      const settled = Math.floor(t * chars.length);
      if (now - last > 45 || t === 1) {
        last = now;
        setShown(chars.map((c, i) => (i < settled || c.ch === " " ? c.ch : random())));
      }
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // runs once per mount: the text is fixed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <span className="sr-only">{full}</span>
      <span aria-hidden>
        {chars.map((c, i) => (
          <span key={i} className={c.className}>
            {done ? c.ch : shown[i]}
          </span>
        ))}
      </span>
    </>
  );
};

export default Scramble;
