import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music2, Pause, Play, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { MUSIC_DEFAULT, useSound } from "../context/SoundContext";
import { spotifyEmbedSrc } from "../lib/spotify";

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

// A readable name from the MP3 address ("my-track.mp3" -> "my track").
const trackName = (src) => {
  if (!src || src.includes("/api/files/")) return "Background music";
  try {
    const last = decodeURIComponent(new URL(src, window.location.href).pathname.split("/").pop() || "");
    const name = last.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
    return name || "Background music";
  } catch {
    return "Background music";
  }
};

// Animated equaliser shown on the button while anything is on.
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

const Slider = ({ label, value, onChange, disabled, testid, max = 1, step = 0.01, format }) => (
  <input
    type="range"
    min={0}
    max={max}
    step={step}
    value={value}
    disabled={disabled}
    aria-label={label}
    aria-valuetext={format ? format(value) : `${Math.round(value * 100)}%`}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    className="sound-range w-full"
    style={{ "--fill": `${max ? (value / max) * 100 : 0}%` }}
    data-testid={testid}
  />
);

const Switch = ({ on, onChange, label, testid }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={() => onChange(!on)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-primary" : "bg-chip border border-border"}`}
    data-testid={testid}
  >
    <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-300 ${on ? "left-6" : "left-1"}`} />
  </button>
);

/** MP3 transport: play/pause, seek and volume. */
const MusicControls = () => {
  const { audioRef, musicSrc, musicOn, setMusicOn, musicVolume, setMusicVolume } = useSound();
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastVolume = useRef(musicVolume || MUSIC_DEFAULT);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const sync = () => {
      setTime(a.currentTime || 0);
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    };
    sync();
    a.addEventListener("timeupdate", sync);
    a.addEventListener("loadedmetadata", sync);
    a.addEventListener("durationchange", sync);
    return () => {
      a.removeEventListener("timeupdate", sync);
      a.removeEventListener("loadedmetadata", sync);
      a.removeEventListener("durationchange", sync);
    };
  }, [audioRef, musicSrc]);

  const seek = (v) => {
    const a = audioRef.current;
    if (a && Number.isFinite(a.duration)) a.currentTime = v;
    setTime(v);
  };
  const toggleMute = () => {
    if (musicVolume > 0) {
      lastVolume.current = musicVolume;
      setMusicVolume(0);
    } else setMusicVolume(lastVolume.current || MUSIC_DEFAULT);
  };
  const VolIcon = musicVolume === 0 ? VolumeX : musicVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setMusicOn(!musicOn)}
          aria-label={musicOn ? "Pause music" : "Play music"}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-grad text-white shadow-lg transition-transform duration-300 hover:scale-105"
          data-testid="music-play"
        >
          {musicOn ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="translate-x-[1px]" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium capitalize">{trackName(musicSrc)}</div>
          <div className="label mt-1 text-ink-muted tabular-nums">
            {fmt(time)} / {fmt(duration)}
          </div>
        </div>
      </div>
      <Slider label="Seek" value={Math.min(time, duration || 0)} max={duration || 0} step={0.1} onChange={seek} disabled={!duration} format={fmt} testid="music-seek" />
      <div className="flex items-center gap-3">
        <button type="button" onClick={toggleMute} aria-label={musicVolume === 0 ? "Unmute music" : "Mute music"} className="text-ink-muted hover:text-ink transition-colors duration-200">
          <VolIcon size={18} />
        </button>
        <Slider label="Music volume" value={musicVolume} onChange={setMusicVolume} testid="music-volume" />
        <span className="label w-9 text-right text-ink-muted tabular-nums">{Math.round(musicVolume * 100)}</span>
      </div>
    </div>
  );
};

/**
 * Bottom-left sound button and its control panel: background music (MP3
 * transport, or Spotify's own player when a Spotify link is set) and the
 * hover/tap interface sounds, each with its own switch and volume.
 */
const AmbientControls = () => {
  const { spotify, hasMusic, musicOn, sfxOn, setSfxOn, sfxVolume, setSfxVolume, playSfx, panelOpen, setPanelOpen, anyOn } = useSound();
  const embed = spotify ? spotifyEmbedSrc(spotify.url) : null;
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on Escape or a click outside the panel.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => e.key === "Escape" && setPanelOpen(false);
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [panelOpen, setPanelOpen]);

  return (
    <>
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            ref={panelRef}
            key="sound-panel"
            role="dialog"
            aria-label="Sound settings"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 left-6 z-[75] w-[min(22rem,calc(100vw-3rem))] origin-bottom-left glass rounded-[1.5rem] p-5 shadow-2xl"
            data-testid="sound-panel"
            data-lenis-prevent
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="label flex items-center gap-2 text-ink-muted">
                <Music2 size={13} className="text-primary" /> Sound
              </span>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Close sound settings"
                className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:text-ink transition-colors duration-200"
                data-testid="sound-panel-close"
              >
                <X size={15} />
              </button>
            </div>

            {embed ? (
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
            ) : hasMusic ? (
              <MusicControls />
            ) : (
              <p className="text-sm text-ink-muted">No music has been added yet.</p>
            )}

            <div className="my-5 h-px bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">Interface sounds</div>
                  <div className="text-xs text-ink-muted">Soft clicks on hover and tap</div>
                </div>
                <Switch
                  on={sfxOn}
                  onChange={(v) => {
                    setSfxOn(v);
                    if (v) playSfx("tap", true);
                  }}
                  label="Interface sounds"
                  testid="sfx-switch"
                />
              </div>
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${sfxOn ? "" : "opacity-40"}`}>
                <Volume1 size={18} className="text-ink-muted shrink-0" />
                <Slider
                  label="Interface sound volume"
                  value={sfxVolume}
                  disabled={!sfxOn}
                  onChange={(v) => {
                    setSfxVolume(v);
                    playSfx("tap", true);
                  }}
                  testid="sfx-volume"
                />
                <span className="label w-9 text-right text-ink-muted tabular-nums">{Math.round(sfxVolume * 100)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={() => setPanelOpen(!panelOpen)}
        data-testid="sound-toggle"
        aria-label={panelOpen ? "Close sound settings" : "Open sound settings"}
        aria-expanded={panelOpen}
        className="fixed bottom-6 left-6 z-[75] grid h-12 w-12 place-items-center rounded-full glass hover:border-primary transition-colors duration-200"
        title="Sound"
      >
        {anyOn ? <Bars lively={musicOn} /> : embed || hasMusic ? <Music2 size={18} className="text-ink-muted" /> : <VolumeX size={18} className="text-ink-muted" />}
      </motion.button>
    </>
  );
};

export default AmbientControls;
