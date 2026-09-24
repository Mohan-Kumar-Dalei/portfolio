import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLink, fontsReady, introDelay } from "../editorial";

gsap.registerPlugin(SplitText, ScrollTrigger);

const PROFILE_PNG = "https://ik.imagekit.io/h7wep5nji/Photos/profile-png.png";

const useIndiaClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
};

/**
 * Pinned opening scene.
 *  1. Intro: the name rises letter by letter, a photo window opens in the centre.
 *  2. Scroll: the window grows to fill the screen while the name splits apart,
 *     then a statement and the calls to action fade up over the photo.
 */
const Hero = () => {
  const root = useRef(null);
  const time = useIndiaClock();

  useLayoutEffect(() => {
    const delay = introDelay();
    const splits = [];
    const ctx = gsap.context(() => {}, root);

    fontsReady().then(() => {
      if (!root.current) return;
      ctx.add(() => {
        const nameSplit = SplitText.create(".hero-split", { type: "chars", mask: "chars" });
        const statement = SplitText.create(".hero-statement-text", { type: "lines", mask: "lines" });
        splits.push(nameSplit, statement);
        gsap.set(".hero-name", { visibility: "visible" });

        // ── Intro ──
        gsap
          .timeline({ delay })
          .fromTo(".hero-window", { clipPath: "inset(50% 50% 50% 50% round 2rem)" }, { clipPath: "inset(0% 0% 0% 0% round 2rem)", duration: 1.6, ease: "expo.inOut" })
          // intro zoom lives on the wrapper so it never fights the scroll zoom on the <img>
          .from(".hero-photo-wrap", { scale: 1.35, duration: 2, ease: "expo.out" }, 0.3)
          .from(nameSplit.chars, { yPercent: 120, duration: 1.3, ease: "expo.out", stagger: 0.03 }, 0.35)
          .from(".hero-chrome > *", { opacity: 0, y: 16, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.9);

        // ── Scroll scene ──
        gsap.set(".hero-statement", { autoAlpha: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=170%",
            pin: true,
            // tied 1:1 to the (already Lenis-smoothed) scroll; extra scrub lag
            // made the scene overshoot and snap back when scrolling up
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: 10,
          },
        });
        // Every scroll tween is fromTo with explicit start values, so scrolling back
        // up (or a refresh mid-scroll) always returns to the exact opening frame.
        const md = () => window.matchMedia("(min-width: 768px)").matches;
        const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
        tl.fromTo(
          ".hero-window",
          {
            width: () => window.innerWidth * (md() ? 0.26 : 0.62),
            height: () => window.innerHeight * (md() ? 0.64 : 0.46),
            borderRadius: () => rem() * 2,
          },
          { width: () => window.innerWidth, height: () => window.innerHeight, borderRadius: 0, duration: 1.2, ease: "power2.inOut" },
          0
        )
          .fromTo(".hero-l1", { xPercent: 0, opacity: 1 }, { xPercent: -60, opacity: 0, duration: 1, ease: "power2.in" }, 0)
          .fromTo(".hero-l2", { xPercent: 0, opacity: 1 }, { xPercent: 60, opacity: 0, duration: 1, ease: "power2.in" }, 0)
          .fromTo(".hero-chrome", { opacity: 1 }, { opacity: 0, duration: 0.4 }, 0)
          .fromTo(".hero-shade", { opacity: 0 }, { opacity: 0.62, duration: 0.6 }, 0.6)
          .fromTo(".hero-photo", { scale: 1 }, { scale: 1.08, duration: 1.6, ease: "none" }, 0)
          .to(".hero-statement", { autoAlpha: 1, duration: 0.01 }, 1.05)
          .from(statement.lines, { yPercent: 110, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 1.05)
          .from(".hero-statement-cta", { opacity: 0, y: 24, duration: 0.4 }, 1.4)
          .to({}, { duration: 0.4 });

        // This pin is created after fonts load, i.e. after triggers further down
        // the page — re-measure everything now that its spacer exists.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      ctx.revert();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    // Wrapper keeps GSAP's pin-spacer out of React's sibling list.
    <div>
    <section ref={root} id="hero" className="relative h-[100svh] overflow-hidden bg-base" data-testid="hero-section">
      {/* Atmosphere */}
      <div aria-hidden className="glow-blob w-[46rem] h-[46rem] -left-60 -top-60 opacity-50" />
      <div aria-hidden className="glow-blob w-[36rem] h-[36rem] -right-40 bottom-0 opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
          backgroundSize: "5rem 5rem",
          maskImage: "radial-gradient(ellipse at center, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, #000 20%, transparent 75%)",
        }}
      />

      {/* Photo window */}
      <div
        className="hero-window absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[62vw] h-[46svh] md:w-[26vw] md:h-[64vh] overflow-hidden rounded-[2rem] bg-grad"
        style={{ clipPath: "inset(50% 50% 50% 50% round 2rem)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "3rem 3rem",
          }}
        />
        <div className="hero-photo-wrap absolute inset-0 flex items-end justify-center origin-bottom">
          <img src={PROFILE_PNG} alt="Mohan Kumar Dalei" className="hero-photo h-[96%] w-auto max-w-none object-contain object-bottom origin-bottom" />
        </div>
        <div className="hero-shade absolute inset-0 bg-black opacity-0" />
      </div>

      {/* Name — MOHAN | window | KUMAR on desktop, stacked around it on phones */}
      <h1 className="hero-name pointer-events-none absolute inset-0 z-20 title-xl whitespace-nowrap text-[13vw] md:text-[5vw]" style={{ visibility: "hidden" }} aria-label="Mohan Kumar Dalei">
        <span className="absolute inset-x-0 bottom-[calc(50%+28svh)] text-center md:inset-x-auto md:bottom-auto md:right-[calc(50%+14.5vw)] md:top-1/2 md:-translate-y-1/2 md:text-right">
          <span className="hero-l1 hero-split inline-block">Mohan</span>
        </span>
        <span className="absolute inset-x-0 top-[calc(50%+28svh)] text-center md:inset-x-auto md:left-[calc(50%+14.5vw)] md:top-1/2 md:-translate-y-1/2 md:text-left">
          <span className="hero-l2 hero-split inline-block">Kumar</span>
        </span>
      </h1>

      {/* Chrome */}
      <div className="hero-chrome absolute inset-x-0 top-24 md:top-28 z-30 wrap flex justify-between label text-ink-muted">
        <span>(Portfolio ©{new Date().getFullYear()})</span>
        <span className="hidden md:[@media(min-height:800px)]:inline">Bhubaneswar, India</span>
        <span className="tabular-nums" suppressHydrationWarning>IST {time}</span>
      </div>
      <div className="hero-chrome absolute inset-x-0 bottom-6 md:bottom-8 z-30 wrap hidden md:flex items-end justify-between gap-6 label text-ink-muted">
        <span className="max-w-[17.5rem] pl-14 leading-relaxed">
          MERN stack developer · Technical analyst · Agentic AI
        </span>
        <span className="flex items-center gap-3 pr-16 text-ink">
          <span className="relative h-10 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-grad animate-[scrollcue_1.8s_ease-in-out_infinite]" />
          </span>
          Scroll
        </span>
      </div>

      {/* Statement over the full-screen photo */}
      <div className="hero-statement absolute inset-0 z-30 flex flex-col items-center justify-center text-center wrap">
        <div className="label text-white/70 mb-6">(Mohan Kumar Dalei)</div>
        <p className="hero-statement-text title-xl text-white text-[clamp(1.9rem,6.5cqi,7rem)] max-w-5xl">
          I craft <span className="accent-serif text-gradient">premium</span> digital products that feel alive.
        </p>
        <div className="hero-statement-cta mt-10 flex flex-wrap justify-center gap-8 text-white">
          <ArrowLink to="/projects" data-testid="hero-cta-work">Selected work</ArrowLink>
          <ArrowLink to="/contact" data-testid="hero-cta-contact">Let&apos;s talk</ArrowLink>
        </div>
      </div>
    </section>
    </div>
  );
};

export default Hero;
