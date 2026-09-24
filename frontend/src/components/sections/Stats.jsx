import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Figures from GitHub, LinkedIn and the résumé.
const stats = [
  { value: 10, suffix: "+", label: "Projects shipped" },
  { value: 25, suffix: "+", label: "Public GitHub repos" },
  { value: 15, suffix: "+", label: "Technologies used" },
  { value: 1200, suffix: "+", label: "LinkedIn followers" },
];

const Stats = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".stat-num").forEach((el) => {
        const end = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString()),
        });
      });
      gsap.from(".stat-cell", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-16 md:py-24" data-testid="stats-section">
      <div className="wrap">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-strong">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`stat-cell py-8 md:py-10 pr-4 ${i % 2 === 1 ? "pl-5 md:pl-8 border-l border-border" : ""} ${i === 2 ? "lg:pl-8 lg:border-l border-t lg:border-t-0 border-border" : ""} ${i === 3 ? "border-t lg:border-t-0" : ""}`}
              data-testid={`stat-${i}`}
            >
              <div className="label text-ink-muted">({String(i + 1).padStart(2, "0")})</div>
              <div className="mt-6 font-display text-[clamp(2.2rem,5.5cqi,7rem)] font-semibold leading-none tracking-[-0.06em] tabular-nums">
                <span className="stat-num" data-value={s.value}>0</span>
                <span className="accent-serif text-gradient">{s.suffix}</span>
              </div>
              <div className="mt-3 text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
