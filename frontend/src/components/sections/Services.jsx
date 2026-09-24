import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layers, Cpu, Boxes, Database } from "lucide-react";
import { SectionHead, ArrowLink } from "../editorial";

gsap.registerPlugin(ScrollTrigger);

const services = [
  { icon: Layers, title: "MERN Development", desc: "End-to-end web apps on MongoDB, Express, React and Node, architected for performance and scale.", points: ["SPA & SSR-ready", "Clean architecture", "Reusable systems"] },
  { icon: Cpu, title: "Agentic AI Systems", desc: "Autonomous agents that reason, plan and act, with LLM integration, tool-calling and memory in real products.", points: ["LLM integration", "Tool orchestration", "Automation"] },
  { icon: Boxes, title: "API Development", desc: "Robust, documented REST APIs with authentication, validation and thoughtful error handling.", points: ["JWT auth", "Validation", "Scalable routing"] },
  { icon: Database, title: "Database Design", desc: "Schema design and modelling in MongoDB, with optimised indexes, aggregations and reliable persistence.", points: ["Schema modelling", "Aggregations", "Index tuning"] },
];

/** Sticky cards that stack; each one sinks back as the next slides over it. */
const Services = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".svc-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const st = { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true };
        gsap.to(card.querySelector(".svc-inner"), { scale: 0.92, ease: "none", scrollTrigger: st });
        // Fade a veil of the page colour over the card (keeps it opaque, works in both themes).
        gsap.to(card.querySelector(".svc-veil"), { opacity: 0.75, ease: "none", scrollTrigger: st });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="services" className="relative py-24 md:py-36" data-testid="services-section">
      <div className="wrap">
        <SectionHead
          index="04"
          label="Services"
          right="What I offer"
          title={<>What I <span className="text-gradient">build.</span></>}
          intro="Four ways I turn ideas into premium, production-ready products."
        />

        <div className="mt-16 md:mt-24">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="svc-card sticky" style={{ top: `${5.5 + i * 1.5}rem`, paddingBottom: "2rem" }} data-testid={`service-card-${i}`}>
                <article className="svc-inner relative overflow-hidden rounded-[1.75rem] border border-border bg-surface origin-top min-h-[24rem] md:min-h-[28rem] grid md:grid-cols-12">
                  <div aria-hidden className="glow-blob w-[28rem] h-[28rem] -right-20 -top-32 opacity-40" />
                  <div className="relative md:col-span-5 p-7 md:p-12 flex flex-col justify-between gap-10 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex items-center justify-between">
                      <span className="label text-ink-muted">Service</span>
                      <span className="grid h-12 w-12 place-items-center rounded-full chip-accent text-primary">
                        <Icon size={20} />
                      </span>
                    </div>
                    <span className="title-xl text-outline text-[clamp(5rem,12vw,11rem)] leading-[0.8]">0{i + 1}</span>
                  </div>
                  <div className="relative md:col-span-7 p-7 md:p-12 flex flex-col justify-end">
                    <h3 className="title-xl text-[clamp(1.1rem,3.3cqi,4rem)]">{s.title}</h3>
                    <p className="mt-5 max-w-lg text-ink-muted text-lg leading-relaxed">{s.desc}</p>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {s.points.map((p) => (
                        <span key={p} className="rounded-full chip-accent px-4 py-1.5 text-sm">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div aria-hidden className="svc-veil pointer-events-none absolute inset-0 z-10 bg-base opacity-0" />
                </article>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <ArrowLink to="/services">All services</ArrowLink>
        </div>
      </div>
    </section>
  );
};

export default Services;
