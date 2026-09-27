import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, VolumeX } from "lucide-react";
import { useSound } from "../context/SoundContext";

const ASKED_KEY = "mkd_sound_asked";
const EASE_OUT = [0.22, 1, 0.36, 1];

const askedThisVisit = () => {
  try {
    return sessionStorage.getItem(ASKED_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Welcome prompt shown once per visit, right after the preloader: the page
 * blurs behind a card asking whether to turn sound on. Answering is the click
 * browsers require before audio may play, so "Turn on sound" starts the
 * music and the interface sounds immediately.
 */
const SoundIntro = () => {
  const { enableAll, disableAll, spotify, hasMusic, setPanelOpen } = useSound();
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);
  const primaryRef = useRef(null);

  // Wait for the preloader (Layout fires "mkd:preloaded"); on later page loads
  // in the same tab it has already run, so show after a short beat.
  useEffect(() => {
    if (askedThisVisit()) return;
    let t;
    const show = () => {
      t = setTimeout(() => setOpen(true), 350);
    };
    let preloaded = false;
    try {
      preloaded = sessionStorage.getItem("mkd_preloaded") === "1";
    } catch {
      preloaded = true;
    }
    if (preloaded) show();
    else window.addEventListener("mkd:preloaded", show, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("mkd:preloaded", show);
    };
  }, []);

  // While open: no page scrolling underneath (Lenis ignores data-lenis-prevent,
  // and the native wheel/touch scroll is cancelled here), focus the main button.
  useEffect(() => {
    if (!open) return;
    const el = overlayRef.current;
    const block = (e) => e.preventDefault();
    el?.addEventListener("wheel", block, { passive: false });
    el?.addEventListener("touchmove", block, { passive: false });
    const onKey = (e) => e.key === "Escape" && answer(false);
    document.addEventListener("keydown", onKey);
    const f = setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      el?.removeEventListener("wheel", block);
      el?.removeEventListener("touchmove", block);
      document.removeEventListener("keydown", onKey);
      clearTimeout(f);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const answer = (withSound) => {
    try {
      sessionStorage.setItem(ASKED_KEY, "1");
    } catch {
      // not remembered; the prompt may show again on the next page load
    }
    if (withSound) {
      enableAll();
      // Spotify can't be started from here; open its player so one tap plays it.
      if (spotify) setTimeout(() => setPanelOpen(true), 450);
    } else disableAll();
    setOpen(false);
  };

  const hasTrack = hasMusic || !!spotify;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          key="sound-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="sound-intro-backdrop fixed inset-0 z-[95] grid place-items-center px-5"
          data-lenis-prevent
          data-testid="sound-intro"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sound-intro-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.05 }}
            className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-border bg-surface p-8 md:p-10 text-center shadow-2xl"
          >
            <div aria-hidden className="glow-blob w-80 h-80 -right-24 -top-32 opacity-50" />
            <div className="relative">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-grad text-white shadow-lg">
                <Headphones size={26} />
              </span>
              <h2 id="sound-intro-title" className="mt-7 title-xl text-[clamp(1.6rem,6vw,2.4rem)]">
                Best with <span className="accent-serif text-gradient">sound.</span>
              </h2>
              <p className="mt-4 text-ink-muted leading-relaxed">
                {hasTrack ? "A soft background track and subtle interface sounds." : "Subtle interface sounds as you explore."} You can change the
                volume or switch it off anytime from the sound button, bottom left.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  ref={primaryRef}
                  type="button"
                  onClick={() => answer(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-grad px-7 py-3.5 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  data-testid="sound-intro-on"
                >
                  <Headphones size={17} /> Turn on sound
                </button>
                <button
                  type="button"
                  onClick={() => answer(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3.5 font-medium text-ink-muted hover:text-ink hover:border-strong transition-colors duration-200"
                  data-testid="sound-intro-off"
                >
                  <VolumeX size={17} /> Continue without sound
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoundIntro;
