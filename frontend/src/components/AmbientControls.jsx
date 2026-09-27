import { AnimatePresence, motion } from "framer-motion";
import { Music2, VolumeX, X } from "lucide-react";
import { useSound } from "../context/SoundContext";
import { spotifyEmbedSrc } from "../lib/spotify";

// Animated equaliser shown while sound (or the Spotify card) is on.
const Bars = ({ lively }) => (
  <span className="flex items-end gap-[3px] h-4">
    {[0, 1, 2, 3].map((i) => (
      <motion.span
        key={i}
        className="w-[3px] rounded-full bg-primary"
        animate={{ height: lively ? ["6px", "16px", "8px", "14px"] : ["8px", "10px", "8px", "10px"] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
      />
    ))}
  </span>
);

/**
 * Bottom-left sound button. With an MP3 set in the admin it plays/pauses the
 * background track; with a Spotify link it opens a small glass card holding
 * Spotify's own player (Spotify can only be played through its embed).
 * Closing the card unmounts the player, which stops the music.
 */
const AmbientControls = () => {
  const { enabled, setEnabled, toggle, hasMusic, spotify, playerOpen, setPlayerOpen } = useSound();
  const embed = spotify ? spotifyEmbedSrc(spotify.url) : null;

  const onClick = () => {
    if (!embed) return toggle();
    const next = !playerOpen;
    setPlayerOpen(next);
    setEnabled(next); // hover ticks follow the button too
  };

  const on = embed ? playerOpen : enabled;

  return (
    <>
      <AnimatePresence>
        {embed && playerOpen && (
          <motion.div
            key="spotify"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 left-6 z-[75] w-[min(22rem,calc(100vw-3rem))] origin-bottom-left glass rounded-[1.25rem] p-2 shadow-2xl"
            data-testid="spotify-card"
            data-lenis-prevent
          >
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <span className="label flex items-center gap-2 text-ink-muted">
                <Music2 size={13} className="text-primary" /> Now playing
              </span>
              <button
                onClick={onClick}
                aria-label="Close player"
                className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:text-ink transition-colors duration-200"
                data-testid="spotify-close"
              >
                <X size={15} />
              </button>
            </div>
            <iframe
              title="Spotify player"
              src={embed}
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="block rounded-xl border-0"
              data-testid="spotify-iframe"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={onClick}
        data-testid="sound-toggle"
        aria-label={embed ? (playerOpen ? "Close music player" : "Open music player") : "Toggle sound"}
        aria-expanded={embed ? playerOpen : undefined}
        className="fixed bottom-6 left-6 z-[75] grid h-12 w-12 place-items-center rounded-full glass hover:border-primary transition-colors duration-200"
        title={embed ? (playerOpen ? "Close player" : "Play music") : enabled ? "Sound on" : "Sound off"}
      >
        {on ? (
          <Bars lively={embed ? true : hasMusic} />
        ) : embed ? (
          <Music2 size={18} className="text-ink-muted" />
        ) : (
          <VolumeX size={18} className="text-ink-muted" />
        )}
      </motion.button>
    </>
  );
};

export default AmbientControls;
