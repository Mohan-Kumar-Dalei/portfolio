import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitReveal, Rule, EASE_OUT, introDelay } from "./editorial";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematic page opener: glowing backdrop, giant split title that eases back
 * and fades as you scroll into the page.
 */
const PageHeader = ({ index, eyebrow, title, subtitle, children }) => {
  const ref = useRef(null);
  const d = introDelay();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".ph-title", {
        scale: 0.92,
        opacity: 0.25,
        yPercent: 12,
        transformOrigin: "left bottom",
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <header ref={ref} className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
      <div aria-hidden className="glow-blob w-[44rem] h-[44rem] -right-40 -top-72 opacity-45" />
      <div aria-hidden className="glow-blob w-[30rem] h-[30rem] -left-40 top-40 opacity-25" />
      <div className="wrap relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: d, ease: EASE_OUT }}
          className="label flex items-center justify-between text-ink-muted pb-4"
        >
          <span className="flex items-center gap-6">
            {index && <span className="text-ink">({index.replace(/^\/\s*/, "")})</span>}
            {eyebrow && <span>{eyebrow}</span>}
          </span>
          <span>Mohan Kumar Dalei ©{new Date().getFullYear()}</span>
        </motion.div>
        <Rule strong delay={d} />

        <div className="mt-10 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-8 items-end">
          <div className="ph-title col-span-12">
            <SplitReveal as="h1" immediate delay={d + 0.1} className="title-xl text-[clamp(2rem,8.4cqi,12rem)]">
              {title}
            </SplitReveal>
          </div>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: d + 0.5, ease: EASE_OUT }}
              className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-9 text-ink-muted text-base md:text-lg leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: d + 0.6, ease: EASE_OUT }}
            className="mt-10"
          >
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
