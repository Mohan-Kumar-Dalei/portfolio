/* eslint-disable react-refresh/only-export-components */
import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(SplitText, ScrollTrigger);

export const EASE = [0.76, 0, 0.24, 1];
export const EASE_OUT = [0.22, 1, 0.36, 1];

// Split text once the fonts are in (line breaks depend on them), but never
// wait more than 1.5s: if a font request hangs, document.fonts.ready stays
// pending and the [data-split] heading would stay hidden.
export const fontsReady = () => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

// First visit plays the preloader; delay intro animations until it lifts.
export const introDelay = () => (sessionStorage.getItem("mkd_preloaded") ? 0.35 : 2.9);

/**
 * Masked line reveal powered by GSAP SplitText. Lines rise out of their own
 * clipping box when the element scrolls in (or immediately with `immediate`).
 * Re-splits on resize so line breaks stay correct at every width.
 */
export const SplitReveal = ({
  as: Tag = "h2",
  children,
  className = "",
  delay = 0,
  immediate = false,
  type = "lines",
  stagger = 0.09,
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split;
    let tween;
    let cancelled = false;

    fontsReady().then(() => {
      if (cancelled || !ref.current) return;
      split = SplitText.create(el, {
        type,
        mask: type === "chars" ? "lines" : "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          tween?.scrollTrigger?.kill();
          tween?.kill();
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          tween = gsap.from(targets, {
            yPercent: 115,
            rotate: type === "lines" ? 2 : 0,
            duration: 1.25,
            ease: "expo.out",
            stagger,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 90%", once: true },
          });
          return tween;
        },
      });
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [delay, immediate, type, stagger]);

  return (
    <Tag ref={ref} className={className} data-split>
      {children}
    </Tag>
  );
};

/** Words brighten one by one as the paragraph is scrolled through. */
export const ScrubWords = ({ as: Tag = "p", children, className = "" }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split;
    let tween;
    let cancelled = false;
    fontsReady().then(() => {
      if (cancelled || !ref.current) return;
      split = SplitText.create(el, { type: "words" });
      tween = gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
        }
      );
    });
    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
};

/** Hairline rule that draws itself left → right. */
export const Rule = ({ className = "", strong = false, delay = 0 }) => (
  <motion.div
    aria-hidden
    className={`h-px w-full origin-left ${strong ? "bg-strong" : "bg-border"} ${className}`}
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={{ once: true, margin: "0px 0px -40px 0px" }}
    transition={{ duration: 1.4, delay, ease: EASE }}
  />
);

/** "(01) — About ........ right" row that opens every section. */
export const SectionLabel = ({ index, children, right }) => (
  <div className="relative">
    <Rule strong />
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
      className="label flex items-center justify-between gap-6 pt-4 text-ink-muted"
    >
      <span className="flex items-center gap-6">
        {index && <span className="text-ink">({index})</span>}
        <span>{children}</span>
      </span>
      {right && <span className="hidden sm:block">{right}</span>}
    </motion.div>
  </div>
);

/** Text that rolls to a second copy on hover. */
export const Roll = ({ children, className = "" }) => (
  <span className={`roll ${className}`}>
    <span>{children}</span>
    <span aria-hidden>{children}</span>
  </span>
);

/** Underlined text link with a rotating arrow. Internal or external. */
export const ArrowLink = ({ to, href, children, className = "", external, ...rest }) => {
  const inner = (
    <>
      <span className="u-link pb-0.5">{children}</span>
      <span className="grid h-7 w-7 place-items-center rounded-full border border-current transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight size={14} />
      </span>
    </>
  );
  const cls = `group inline-flex items-center gap-3 font-medium ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} {...rest}>
      {inner}
    </a>
  );
};

/** Image that un-clips upward and settles from a slight zoom. */
export const RevealImage = ({ src, alt, className = "", imgClassName = "", onError }) => (
  <motion.div
    className={`overflow-hidden ${className}`}
    initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
    whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
    viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    transition={{ duration: 1.3, ease: EASE }}
  >
    <motion.img
      src={src}
      alt={alt}
      loading="lazy"
      onError={onError}
      className={`h-full w-full object-cover ${imgClassName}`}
      initial={{ scale: 1.25 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 1.8, ease: EASE_OUT }}
    />
  </motion.div>
);

/** Section heading block used across pages: label row + big split title. */
export const SectionHead = ({ index, label, right, title, intro, className = "" }) => (
  <div className={className}>
    <SectionLabel index={index} right={right}>
      {label}
    </SectionLabel>
    <div className="mt-10 md:mt-14 grid grid-cols-12 gap-x-6 gap-y-6">
      <SplitReveal className="col-span-12 lg:col-span-9 title-xl text-[clamp(2.3rem,7cqi,9rem)]">
        {title}
      </SplitReveal>
      {intro && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE_OUT }}
          className="col-span-12 md:col-span-6 lg:col-span-3 lg:self-end text-ink-muted leading-relaxed"
        >
          {intro}
        </motion.p>
      )}
    </div>
  </div>
);
