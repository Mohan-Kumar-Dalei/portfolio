import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead } from "../editorial";

gsap.registerPlugin(ScrollTrigger);

const groups = [
  { title: "Frontend", items: ["React.js", "JavaScript", "HTML & CSS", "Tailwind CSS", "GSAP", "Framer Motion"] },
  { title: "Backend", items: ["Node.js", "Express.js", "REST APIs", "JWT Auth", "Socket.io"] },
  { title: "Database", items: ["MongoDB", "Mongoose", "MongoDB Atlas"] },
  { title: "Agentic AI", items: ["Claude", "ChatGPT", "Gemini", "Cursor", "Antigravity", "LLM Integration"] },
  { title: "Tooling", items: ["Git", "GitHub", "VS Code", "Postman", "Cursor"] },
];

/**
 * Giant outlined words slide in from alternating sides as you scroll and
 * fill with ink while they cross the middle of the screen.
 */
const Skills = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".skill-row").forEach((row, i) => {
        gsap.fromTo(
          row.querySelector(".skill-word"),
          { xPercent: i % 2 ? 6 : -6 },
          // settles at 0 by the time the row reaches the middle, so the whole word is readable
          { xPercent: 0, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "center 55%", scrub: true } }
        );
        ScrollTrigger.create({ trigger: row, start: "top 62%", end: "bottom 38%", toggleClass: "is-active" });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="skills" className="relative py-24 md:py-36 overflow-hidden" data-testid="skills-section">
      <div className="wrap">
        <SectionHead
          index="02"
          label="Capabilities"
          right={`${groups.length} disciplines`}
          title={<>The stack I build <span className="text-gradient">with.</span></>}
          intro="A focused toolkit, used deeply, from the interface down to the data layer and the agents in between."
        />
      </div>

      <div className="mt-16 md:mt-24 border-t border-border">
        {groups.map((g, i) => (
          <div
            key={g.title}
            className="skill-row group relative border-b border-border py-6 md:py-8"
            data-testid={`skill-row-${g.title.toLowerCase().replace(/\s/g, "-")}`}
          >
            <div className={`skill-word whitespace-nowrap title-xl px-5 md:px-8 lg:px-12 text-[clamp(1.6rem,6.2vw,7.5rem)] ${i % 2 ? "text-right" : ""}`}>
              <span className="relative inline-block">
                <span className="text-outline">{g.title}</span>
                <span aria-hidden className="skill-fill absolute inset-0">{g.title}</span>
              </span>
            </div>
            <div className={`wrap mt-3 flex flex-wrap gap-2 ${i % 2 ? "justify-end" : ""}`}>
              <span className="label text-ink-muted mr-2 self-center">0{i + 1}</span>
              {g.items.map((s) => (
                <span key={s} className="skill-chip rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors duration-500">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
