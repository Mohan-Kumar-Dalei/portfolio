import { useLayoutEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { pageTitle } from "../seo";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck } from "lucide-react";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import Experience from "../components/sections/Experience";
import Stats from "../components/sections/Stats";
import CTA from "../components/sections/CTA";
import { SectionHead, EASE_OUT } from "../components/editorial";

gsap.registerPlugin(ScrollTrigger);

const achievements = [
  "Won Kabaddi at the Initiative for Moral and Cultural Training Foundation, Odisha",
  "Completed a 30 km mini-marathon, start to finish",
  "Published Apex UI, a React component library with its own NPM CLI (apex-ui.in)",
  "Completed the Sheryians Job Ready Cohort (MERN with Generative AI)",
]

const certifications = [
  {
    title: "MERN with Generative AI",
    org: "Sheryians Coding School · Job Ready Cohort",
    date: "Sep 2025",
    url: "https://drive.google.com/file/d/10ZYIshb8_TBpdy8YQl_En5nHRL4fe4XB/view",
  },
  {
    title: "Front-End Development",
    org: "Lakshya Institute of Technology (LIT)",
    date: "Mar 2024",
    url: "https://drive.google.com/file/d/1y7SUN-vpiQ1epYtN-O6Xiz6ANHu-0ysh/view",
  },
]

const ExperiencePage = () => {
  const certRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".cert-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const st = { trigger: cards[i + 1], start: "top bottom", end: "top 25%", scrub: true };
        gsap.to(card.querySelector(".cert-inner"), { scale: 0.92, ease: "none", scrollTrigger: st });
        gsap.to(card.querySelector(".cert-veil"), { opacity: 0.75, ease: "none", scrollTrigger: st });
      });
    }, certRef);
    return () => ctx.revert();
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>{pageTitle("/experience")}</title>
      </Helmet>

      <PageHeader
        index="/ experience"
        eyebrow="The journey"
        title={<>My journey &amp; <span className="text-gradient">milestones.</span></>}
        subtitle="A timeline of growth across education, internships and professional work."
      />

      <Experience />

      <section className="relative py-24 md:py-32">
        <div className="wrap">
          <SectionHead index="✳" label="Achievements" title={<>Wins &amp; <span className="text-gradient">milestones.</span></>} />
          <div className="mt-14 border-t border-strong">
            {achievements.map((a, i) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: EASE_OUT }}
                className="group grid grid-cols-12 gap-6 items-baseline border-b border-border py-7"
              >
                <span className="col-span-2 md:col-span-1 accent-serif text-gradient text-4xl">0{i + 1}</span>
                <span className="col-span-10 md:col-span-11 font-display text-[clamp(1.4rem,2.6vw,2.5rem)] font-semibold tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-3">
                  {a}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={certRef} className="relative py-16 md:py-24">
        <div className="wrap">
          <SectionHead index="✳" label="Certifications" title={<>Always <span className="text-gradient">learning.</span></>} intro="Scroll, and each credential stacks into view." />
          <div className="mt-16 max-w-5xl mx-auto">
            {certifications.map((c, i) => (
              <div key={c.title} className="cert-card sticky" style={{ top: `${6 + i * 1.25}rem`, paddingBottom: "1.5rem" }} data-testid={`cert-card-${i}`}>
                <div className="cert-inner relative origin-top overflow-hidden rounded-[1.75rem] border border-border bg-surface p-8 md:p-12">
                  <div aria-hidden className="glow-blob w-80 h-80 -right-20 -top-24 opacity-40" />
                  <div className="relative flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 label text-primary">
                        <BadgeCheck size={16} /> Certificate · {c.date}
                      </div>
                      <h3 className="mt-5 title-xl text-[clamp(1.1rem,3.2cqi,3.75rem)]">{c.title}</h3>
                      <div className="mt-3 accent-serif text-xl text-ink-muted">{c.org}</div>
                      <a href={c.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full chip-accent px-4 py-2 text-sm font-medium hover:text-primary transition-colors duration-300">
                        View certificate ↗
                      </a>
                    </div>
                    <span className="hidden sm:block title-xl text-outline text-[clamp(3.5rem,7vw,6.5rem)] leading-none">0{i + 1}</span>
                  </div>
                  <div aria-hidden className="cert-veil pointer-events-none absolute inset-0 z-10 bg-base opacity-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Stats />
      <CTA />
    </PageTransition>
  );
};

export default ExperiencePage;
