import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { ArrowLink } from "../editorial";
import ProjectImage from "../ProjectImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned horizontal gallery: vertical scroll drives the track sideways.
 * Each card's image counter-moves for parallax, and a counter + progress
 * bar track the current project.
 */
const HorizontalProjects = ({ projects = [] }) => {
  const root = useRef(null);
  const track = useRef(null);
  const [current, setCurrent] = useState(1);
  const list = projects.slice(0, 6);

  useLayoutEffect(() => {
    if (!list.length) return;
    const ctx = gsap.context(() => {
      const distance = () => track.current.scrollWidth - window.innerWidth;
      const move = gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: 5,
          onUpdate: (self) => {
            gsap.set(".work-progress", { scaleX: self.progress });
            setCurrent(Math.min(list.length, Math.max(1, Math.round(self.progress * (list.length - 1)) + 1)));
          },
        },
      });

      gsap.utils.toArray(".work-card").forEach((card) => {
        gsap.fromTo(
          card.querySelector(".work-img"),
          { xPercent: -12 },
          { xPercent: 12, ease: "none", scrollTrigger: { trigger: card, containerAnimation: move, start: "left right", end: "right left", scrub: true } }
        );
        gsap.from(card.querySelectorAll(".work-fade"), {
          y: 40,
          opacity: 0,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: card, containerAnimation: move, start: "left 85%", end: "left 45%", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [list.length]);

  if (!list.length) return null;

  return (
    // Wrapper keeps GSAP's pin-spacer out of React's sibling list.
    <div>
    <section ref={root} id="work" className="relative h-[100svh] overflow-hidden bg-base" data-testid="projects-section">
      <div aria-hidden className="glow-blob w-[40rem] h-[40rem] left-1/3 -top-60 opacity-30" />

      {/* Header bar */}
      <div className="absolute inset-x-0 top-24 md:top-28 z-20 wrap">
        <div className="flex items-end justify-between gap-6">
          <div className="label text-ink-muted">
            <span className="text-ink">(03)</span> &nbsp; Selected work
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold tabular-nums">
            {String(current).padStart(2, "0")}
            <span className="text-ink-muted"> / {String(list.length).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="mt-4 h-px w-full bg-border">
          <div className="work-progress h-full w-full origin-left bg-grad" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      {/* Track */}
      <div ref={track} className="absolute left-0 top-0 h-full flex items-center gap-6 md:gap-10 pl-5 md:pl-12 pr-[10vw] pt-16">
        {/* Intro panel */}
        <div className="shrink-0 w-[78vw] md:w-[38vw] pr-6">
          <h2 className="title-xl text-[clamp(3rem,6vw,7rem)]">
            Work <br />I&apos;m <span className="accent-serif text-gradient">proud</span>
            <br />of.
          </h2>
          <p className="mt-8 max-w-sm text-ink-muted leading-relaxed">
            Full-stack products, AI systems and tools, built end to end. Keep scrolling to move through them.
          </p>
          <div className="mt-8">
            <ArrowLink to="/projects" data-testid="projects-viewall">All projects</ArrowLink>
          </div>
        </div>

        {list.map((p, i) => (
          <Link
            key={p._id || i}
            to={`/projects/${p._id}`}
            data-cursor="view"
            data-cursor-label="Open"
            className="work-card group relative shrink-0 w-[82vw] md:w-[58vw] lg:w-[46vw] h-[58svh] md:h-[62vh] overflow-hidden rounded-[1.5rem] border border-border bg-surface"
            data-testid={`project-card-${i}`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <ProjectImage src={p.image} title={p.title} className="work-img absolute inset-y-0 -left-[15%] h-full w-[130%] max-w-none object-cover transition-[filter] duration-700 group-hover:brightness-110" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <div className="absolute left-6 top-5 md:left-8 md:top-7 title-xl text-outline !text-white/70 text-[clamp(3rem,7vw,7rem)]">
              {String(i + 1).padStart(2, "0")}
            </div>
            <span className="absolute right-6 top-6 md:right-8 md:top-8 grid h-12 w-12 place-items-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight size={20} />
            </span>

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
              <div className="work-fade label text-white/70">{p.category}</div>
              <h3 className="work-fade mt-3 font-display text-[clamp(1.3rem,3vw,3rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] [overflow-wrap:anywhere]" data-testid={`project-detail-${i}`}>
                {p.title}
              </h3>
              {p.subtitle && <p className="work-fade mt-2 text-white/70">{p.subtitle}</p>}
              <div className="work-fade mt-4 flex flex-wrap gap-2">
                {(p.techStack || []).slice(0, 4).map((t) => (
                  <span key={t} className="rounded-full border border-white/25 px-3 py-1 font-mono text-[0.6875rem] text-white/80">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
    </div>
  );
};

export default HorizontalProjects;
