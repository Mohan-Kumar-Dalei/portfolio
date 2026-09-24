import { useLayoutEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import Services from "../components/sections/Services";
import Stats from "../components/sections/Stats";
import CTA from "../components/sections/CTA";
import { SectionHead } from "../components/editorial";

gsap.registerPlugin(ScrollTrigger);

const deliverables = [
  { title: "MERN Development", items: ["Responsive React UI", "REST API + auth", "MongoDB data layer", "Deployment setup"] },
  { title: "Agentic AI Systems", items: ["LLM integration", "Custom agents", "Chat & automation", "Secure API keys"] },
  { title: "API Development", items: ["JWT auth", "Input validation", "Clean routing", "API docs"] },
  { title: "Database Design", items: ["Schema modelling", "Aggregations", "Index tuning", "Backups"] },
];

const process = [
  { title: "Discover", desc: "Understand goals, users and constraints." },
  { title: "Design", desc: "Architect the system & craft the experience." },
  { title: "Build", desc: "Ship clean, tested, scalable code." },
  { title: "Launch", desc: "Optimise, deploy and iterate on impact." },
];

const ServicesPage = () => {
  const processRef = useRef(null);

  // Process steps: held on desktop while the steps light up one by one. The
  // hold is CSS sticky (see the markup), so GSAP only scrubs and adds no
  // pin-spacer that would shift the "Let's talk" scene below it.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const steps = gsap.utils.toArray(".proc-step");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: processRef.current, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
      });
      tl.fromTo(".proc-line", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: steps.length }, 0);
      steps.forEach((s, i) => {
        tl.fromTo(s, { opacity: 0.2, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, i);
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>Services | Mohan Kumar Dalei</title>
        <meta name="description" content="MERN development, Agentic AI, API development and database design services." />
      </Helmet>

      <PageHeader
        index="/ services"
        eyebrow="How I help"
        title={<>Services that ship <span className="text-gradient">results.</span></>}
        subtitle="Premium product engineering, from idea to a polished, performant launch."
      />

      <Services />

      <section className="relative py-20 md:py-28">
        <div className="wrap">
          <SectionHead index="✳" label="Deliverables" title={<>What you <span className="text-gradient">get.</span></>} />
          <div className="mt-14 grid md:grid-cols-2 xl:grid-cols-4 border-t border-l border-border">
            {deliverables.map((d) => (
              <div key={d.title} className="border-r border-b border-border p-7">
                <h3 className="font-display text-xl font-bold tracking-[-0.02em]">{d.title}</h3>
                <ul className="mt-6 space-y-2 text-ink-muted">
                  {d.items.map((it) => (
                    <li key={it} className="flex gap-3"><span className="text-primary">+</span>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div ref={processRef} className="relative lg:h-[250svh]">
      <section className="relative min-h-[100svh] lg:sticky lg:top-0 lg:h-[100svh] flex items-center py-20 overflow-hidden">
        <div aria-hidden className="glow-blob w-[44rem] h-[30rem] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="wrap relative w-full">
          <SectionHead index="✳" label="Process" title={<>How I <span className="text-gradient">work.</span></>} />
          <div className="relative mt-16">
            <div className="hidden xl:block absolute left-0 right-0 top-6 h-px bg-border">
              <div className="proc-line h-full w-full origin-left bg-grad" />
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-10">
              {process.map((s, i) => (
                <div key={s.title} className="proc-step relative">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-grad text-white font-display font-bold">0{i + 1}</div>
                  <h3 className="mt-6 title-xl text-[clamp(1.5rem,2.1cqi,2.75rem)]">{s.title}</h3>
                  <p className="mt-3 text-ink-muted leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>

      <Stats />
      <CTA />
    </PageTransition>
  );
};

export default ServicesPage;
