import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import MagneticButton from "../MagneticButton";
import { LINKS } from "../../utils/links";

gsap.registerPlugin(ScrollTrigger);

/**
 * Closing scene: the screen holds while a violet circle swells to fill it and
 * the giant "Let's talk" slides into place, then the contact button appears.
 *
 * The hold is plain CSS sticky inside a 220svh section rather than a GSAP pin.
 * A pin switches the scene to position: fixed (and back) in JavaScript, and
 * with smooth scrolling that hand-off showed as a jump at both ends; sticky
 * is done by the browser, so the scene never jitters. GSAP only scrubs.
 */
const CTA = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
        })
        .fromTo(".cta-fill", { clipPath: "circle(4% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(".cta-word-1", { xPercent: -60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.1)
        .fromTo(".cta-word-2", { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.2)
        .fromTo(".cta-foot", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.8)
        .to({}, { duration: 0.3 });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative h-[220svh] bg-base" data-testid="cta-section">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* A viewport-sized fill revealed through a growing circular clip.
            (Scaling a 150vmax disc meant a ~3840px GPU texture on large screens,
            which flickered while scrolling.) 75% reaches every corner. */}
        <div aria-hidden className="cta-fill absolute inset-0 bg-cta" style={{ clipPath: "circle(4% at 50% 50%)" }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white">
          <div className="cta-foot label mb-6 text-white/80">(08) Let&apos;s collaborate</div>
          <h2 className="title-xl text-[clamp(4rem,17vw,19rem)] leading-[0.82]">
            <span className="cta-word-1 block">Let&apos;s</span>
            <span className="cta-word-2 block accent-serif normal-case">talk.</span>
          </h2>
          <div className="cta-foot mt-10 flex flex-col sm:flex-row items-center gap-6">
            <MagneticButton
              as={Link}
              to="/contact"
              strength={0.35}
              className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-black"
              data-testid="cta-contact-btn"
            >
              Start a project
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </MagneticButton>
            <a href={`mailto:${LINKS.email}`} className="u-link-static text-lg font-medium" data-testid="cta-projects-btn">
              {LINKS.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
