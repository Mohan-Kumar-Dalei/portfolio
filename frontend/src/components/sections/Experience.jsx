import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel, SplitReveal } from "../editorial";

gsap.registerPlugin(ScrollTrigger);

const timeline = [
  {
    period: "Since Oct 2025",
    title: "Technical Analyst",
    org: "Contify · Bhubaneswar",
    desc: "Analysing technical data and market-intelligence insights to support business decisions. I work with structured datasets, reports and monitoring tools, and collaborate across teams to improve reporting accuracy.",
  },
  {
    period: "Since 2024",
    title: "MERN & AI Developer",
    org: "Independent · Open source",
    desc: "Designing and shipping full-stack products end to end: Apex UI (a React library with its own NPM CLI), the SARHA voice assistant, CosmosGen and a string of AI-powered tools.",
  },
  {
    period: "Sep 2025",
    title: "MERN with Generative AI",
    org: "Sheryians Coding School · Job Ready Cohort",
    desc: "Frontend and backend development, data structures and algorithms, and DevOps practices (CI/CD, Docker, Kubernetes), built around real projects and generative AI.",
  },
  {
    period: "2020 to 2024",
    title: "B.Tech, Computer Science",
    org: "Shibani Institute of Technical Education · CGPA 7.5",
    desc: "Built a foundation in data structures, algorithms and web development, and picked up the MERN stack through projects and certifications.",
  },
  {
    period: "2018 to 2020",
    title: "Higher Secondary, Science",
    org: "Ganesh Institute of Engineering & Technology",
    desc: "+2 Science in Bhubaneswar, where the curiosity about how software works first started.",
  },
]

const Experience = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Vertical progress rail fills as the list is read.
      gsap.fromTo(
        ".exp-rail",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".exp-list", start: "top 70%", end: "bottom 70%", scrub: 0.6 } }
      );
      gsap.utils.toArray(".exp-row").forEach((row) => {
        gsap.from(row.querySelectorAll(".exp-fade"), {
          y: 36,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: row, start: "top 85%" },
        });
        gsap.from(row.querySelector(".exp-line"), {
          scaleX: 0,
          duration: 1.4,
          ease: "expo.inOut",
          scrollTrigger: { trigger: row, start: "top 88%" },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={ref} className="relative py-24 md:py-36" data-testid="experience-section">
      <div className="wrap">
        <SectionLabel index="05" right="2018 to now">Journey</SectionLabel>

        <div className="mt-12 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SplitReveal className="title-xl text-[clamp(2.2rem,3.6cqi,6rem)]">
                Career &amp; <span className="text-gradient">education.</span>
              </SplitReveal>
              <p className="mt-6 max-w-sm text-ink-muted leading-relaxed">
                How I grew, from fundamentals to shipping full-stack products with AI.
              </p>
            </div>
          </div>

          <div className="exp-list relative col-span-12 lg:col-span-8">
            <div aria-hidden className="absolute -left-3 md:-left-6 top-0 bottom-0 w-px bg-border hidden md:block">
              <div className="exp-rail h-full w-full origin-top bg-grad" />
            </div>
            {timeline.map((t, i) => (
              <div key={t.title} className="exp-row relative py-8 md:py-10">
                <div className="exp-line absolute top-0 left-0 right-0 h-px bg-strong origin-left" />
                <div className="grid grid-cols-12 gap-x-6 gap-y-3">
                  <div className="exp-fade col-span-12 md:col-span-3 flex md:flex-col justify-between gap-2">
                    <span className="label text-ink">{t.period}</span>
                    <span className="label text-ink-muted">0{i + 1}</span>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <h3 className="exp-fade title-xl text-[clamp(1.4rem,3cqi,3.25rem)]">
                      {t.title}
                    </h3>
                    <div className="exp-fade mt-2 accent-serif text-xl text-ink-muted">{t.org}</div>
                    <p className="exp-fade mt-4 max-w-xl text-ink-muted leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
