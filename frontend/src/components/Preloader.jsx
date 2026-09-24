import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { fontsReady } from "./editorial";

const words = ["Develop", "Design", "Deliver"];

/**
 * Editorial counter preloader: the words rise in, a big number runs to 100,
 * then the sheet lifts.
 *
 * Kept smooth by: starting only once the fonts are in (a font swap mid-rise
 * made the words jump), writing the counter straight to the DOM instead of
 * re-rendering React 60 times a second, and using tabular digits so the
 * number doesn't wobble in width as it counts.
 */
const Preloader = ({ onComplete }) => {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    let ctx;
    const obj = { val: 0 };

    fontsReady().then(() => {
      if (cancelled || !rootRef.current) return;
      // one frame after the fonts land, so the first frame of motion is clean
      requestAnimationFrame(() => {
        if (cancelled || !rootRef.current) return;
        ctx = gsap.context(() => {
          gsap.set(".pl-stage", { autoAlpha: 1 });
          gsap
            .timeline({ onComplete: () => doneRef.current?.() })
            .fromTo(".pl-word", { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.12 })
            .to(
              obj,
              {
                val: 100,
                duration: 1.7,
                ease: "power2.inOut",
                onUpdate: () => {
                  if (countRef.current) countRef.current.textContent = String(Math.round(obj.val)).padStart(3, "0");
                },
              },
              0
            )
            .fromTo(".pl-bar", { scaleX: 0 }, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0)
            .to(".pl-inner", { yPercent: -12, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, "+=0.15")
            .to(rootRef.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, "-=0.2");
        }, rootRef);
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-testid="preloader"
      className="fixed inset-0 z-[100] bg-base text-ink overflow-hidden"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div className="glow-blob w-[40rem] h-[40rem] -right-40 -bottom-40 opacity-60" />
      {/* hidden until the fonts are ready, then GSAP reveals it */}
      <div className="pl-inner pl-stage invisible relative wrap h-full flex flex-col justify-between py-8">
        <div className="label flex justify-between opacity-70">
          <span>Mohan Kumar Dalei</span>
          <span>Portfolio ©{new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-col gap-1 title-xl text-[clamp(2rem,8cqi,8rem)]">
          {words.map((w, i) => (
            <span key={w} className="overflow-hidden block">
              <span className="pl-word block will-change-transform">
                {w}
                {i === words.length - 1 ? <span className="accent-serif text-gradient">.</span> : ","}
              </span>
            </span>
          ))}
        </div>

        <div>
          <div className="flex items-end justify-between">
            <span className="label opacity-70">Loading experience</span>
            <span
              ref={countRef}
              className="font-body text-[clamp(4rem,14vw,12rem)] font-semibold leading-[0.8] tracking-[-0.05em] tabular-nums"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              000
            </span>
          </div>
          <div className="mt-6 h-px w-full" style={{ background: "var(--border)" }}>
            <div className="pl-bar h-full w-full origin-left bg-grad will-change-transform" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
