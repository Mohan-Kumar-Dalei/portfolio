import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionLabel, EASE, EASE_OUT } from "../editorial";

const Quote = ({ t, animated }) => {
  const Block = animated ? motion.blockquote : "blockquote";
  const Meta = animated ? motion.div : "div";
  return (
    <>
      <Block
        {...(animated && {
          initial: { clipPath: "inset(0% 0% 100% 0%)", y: 30 },
          animate: { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
          exit: { clipPath: "inset(100% 0% 0% 0%)", y: -30 },
          transition: { duration: 0.9, ease: EASE },
        })}
        className="font-display text-[clamp(1.6rem,3.4vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.03em]"
      >
        {t.quote}
      </Block>
      <Meta
        {...(animated && {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0 },
          transition: { duration: 0.7, delay: 0.35, ease: EASE_OUT },
        })}
        className="mt-10 flex items-center gap-4"
      >
        {t.avatar ? (
          <img src={t.avatar} alt={animated ? t.name : ""} className="h-12 w-12 rounded-full object-cover border border-border" loading="lazy" />
        ) : (
          <span className="h-12 w-12" />
        )}
        <div>
          <div className="font-semibold">{t.name}</div>
          <div className="label text-ink-muted mt-1">
            {t.role}
            {t.company ? ` · ${t.company}` : ""}
          </div>
        </div>
      </Meta>
    </>
  );
};

const Testimonials = ({ testimonials = [] }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(t);
  }, [paused, count]);

  if (!count) return null;
  const t = testimonials[index];

  return (
    <section id="testimonials" className="relative py-24 md:py-36 overflow-hidden" data-testid="testimonials-section">
      <div aria-hidden className="glow-blob w-[44rem] h-[30rem] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-40" />
      <div className="wrap relative">
        <SectionLabel index="07" right={`${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}>
          Kind words
        </SectionLabel>

        <div className="mt-14 md:mt-20 grid grid-cols-12 gap-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="col-span-12 lg:col-span-2 accent-serif text-gradient text-[8rem] leading-[0.6] select-none" aria-hidden>
            &ldquo;
          </div>
          <div className="col-span-12 lg:col-span-10">
            {/* Every quote is laid out invisibly in the same grid cell, so the
                block is always as tall as the longest one and the Prev/Next
                row no longer jumps up and down between quotes. */}
            <div className="grid">
              {testimonials.map((x, i) => (
                <div key={x._id || i} aria-hidden className="invisible col-start-1 row-start-1">
                  <Quote t={x} />
                </div>
              ))}
              <div className="col-start-1 row-start-1">
                <AnimatePresence mode="wait">
                  <motion.div key={index} data-testid="testimonial-active">
                    <Quote t={t} animated />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {count > 1 && (
              <div className="mt-12 flex items-center gap-6">
                <button onClick={() => setIndex((i) => (i - 1 + count) % count)} className="label u-link hover:text-primary" data-testid="testimonial-prev">
                  ← Prev
                </button>
                <div className="flex-1 flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Testimonial ${i + 1}`}
                      className="relative h-px flex-1 bg-border overflow-hidden"
                      data-testid={`testimonial-dot-${i}`}
                    >
                      {i === index && (
                        <motion.span
                          key={`${index}-${paused}`}
                          className="absolute inset-0 origin-left bg-grad"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: paused ? 1 : 1 }}
                          transition={{ duration: paused ? 0.3 : 6.5, ease: "linear" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIndex((i) => (i + 1) % count)} className="label u-link hover:text-primary" data-testid="testimonial-next">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
