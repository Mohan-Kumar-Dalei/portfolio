import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const words = ["React", "Node.js", "Express", "MongoDB", "Agentic AI", "GSAP", "Tailwind", "REST APIs", "JavaScript"];

/**
 * Editorial ticker between hairlines. It runs continuously, flips direction
 * with the scroll direction and briefly speeds up with scroll velocity.
 */
const Marquee = () => {
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const wrap = gsap.utils.wrap(-50, 0);
    let x = 0;
    let speed = 1;
    let target = 1;
    let settle;

    // Manual loop so the direction can flip freely (a reversed repeat tween
    // would stall at its start).
    const tick = (_time, dt) => {
      speed += (target - speed) * 0.08;
      x = wrap(x - speed * dt * 0.0013);
      gsap.set(track, { xPercent: x });
    };
    gsap.ticker.add(tick);

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const boost = Math.min(Math.abs(self.getVelocity()) / 400, 6);
        target = self.direction * (1 + boost);
        clearTimeout(settle);
        settle = setTimeout(() => (target = self.direction), 160);
      },
    });

    return () => {
      gsap.ticker.remove(tick);
      clearTimeout(settle);
      st.kill();
    };
  }, []);

  const row = (key) => (
    <div key={key} className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={w} className="flex items-center">
          <span
            className={`px-6 md:px-10 title-xl text-[clamp(2.25rem,5.5vw,5.5rem)] leading-none ${
              i % 3 === 1 ? "accent-serif text-gradient" : ""
            }`}
          >
            {w}
          </span>
          <span className="text-[clamp(1rem,2vw,1.75rem)] text-ink-muted">✳</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative py-6 md:py-8 overflow-hidden select-none" data-testid="marquee-section" aria-hidden>
      <div ref={trackRef} className="flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
};

export default Marquee;
