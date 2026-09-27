import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSite } from "./SiteContext";
import { fileUrl } from "../lib/api";
import { parseSpotify } from "../lib/spotify";

/*
 * Site sound: an optional background track (MP3 or Spotify, set in the admin)
 * plus short interface sounds on hover and tap.
 *
 * Browsers only allow audio after the visitor interacts, so nothing plays
 * until they choose "Turn on sound" in the welcome modal (SoundIntro) or use
 * the sound panel. Volumes are remembered; the on/off choice is asked again
 * each visit, which is also the click that lets the music start.
 */

const SoundContext = createContext(null);

const readNum = (key, fallback) => {
  try {
    const v = parseFloat(localStorage.getItem(key));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // storage blocked: the value just isn't remembered
  }
};

// Default background-music volume (10%). The storage key changed with this
// default so earlier visits start from it too.
export const MUSIC_DEFAULT = 0.1;
const MUSIC_KEY = "mkd_music_vol2";

// Peak gain of an interface sound at 100% volume.
const SFX_PEAK = 0.22;

export const SoundProvider = ({ children }) => {
  const { settings } = useSite();
  const spotify = parseSpotify(settings?.spotifyUrl);
  const spotifyLink = spotify?.url || "";
  const musicSrc = spotifyLink ? "" : fileUrl(settings?.musicUrl);

  const [sfxOn, setSfxOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => readNum(MUSIC_KEY, MUSIC_DEFAULT));
  const [sfxVolume, setSfxVolume] = useState(() => readNum("mkd_sfx_vol", 0.7));
  const [panelOpen, setPanelOpen] = useState(false);

  const audioRef = useRef(null);
  const acRef = useRef(null);
  const lastSfx = useRef(0);

  // One <audio> element for the whole visit.
  if (!audioRef.current && typeof Audio !== "undefined") {
    const a = new Audio();
    a.loop = true;
    a.preload = "none";
    audioRef.current = a;
  }

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (musicSrc && a.getAttribute("src") !== musicSrc) a.src = musicSrc;
    if (!musicSrc) {
      a.pause();
      a.removeAttribute("src");
    }
  }, [musicSrc]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = musicVolume;
    save(MUSIC_KEY, musicVolume);
  }, [musicVolume]);

  useEffect(() => save("mkd_sfx_vol", sfxVolume), [sfxVolume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !musicSrc) return;
    if (musicOn) a.play().catch(() => setMusicOn(false));
    else a.pause();
  }, [musicOn, musicSrc]);

  /** A short synthesized blip. `kind`: "hover" (soft, high) or "tap" (fuller, lower). */
  const playSfx = useCallback(
    (kind = "hover", force = false) => {
      if ((!sfxOn && !force) || sfxVolume <= 0) return;
      const now = performance.now();
      if (now - lastSfx.current < 45) return;
      lastSfx.current = now;
      try {
        if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ac = acRef.current;
        if (ac.state === "suspended") ac.resume();
        const t = ac.currentTime;
        const o = ac.createOscillator();
        const g = ac.createGain();
        const tap = kind === "tap";
        o.type = tap ? "triangle" : "sine";
        o.frequency.setValueAtTime(tap ? 420 : 660, t);
        o.frequency.exponentialRampToValueAtTime(tap ? 260 : 520, t + (tap ? 0.12 : 0.07));
        const peak = SFX_PEAK * sfxVolume * (tap ? 1 : 0.7);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (tap ? 0.16 : 0.09));
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + 0.18);
      } catch {
        // WebAudio unavailable: interface sounds are optional.
      }
    },
    [sfxOn, sfxVolume]
  );

  // Hover: once per control (mouseover also fires for each child inside it).
  // Tap: pointerdown on a control, which also covers touch screens.
  const hoveredRef = useRef(null);
  useEffect(() => {
    const CONTROL = "a, button, [data-cursor='hover'], input, textarea, select, [role='option'], [role='slider']";
    const onOver = (e) => {
      const el = e.target.closest?.(CONTROL) || null;
      if (el === hoveredRef.current) return;
      hoveredRef.current = el;
      if (el) playSfx("hover");
    };
    const onDown = (e) => {
      if (e.target.closest?.(CONTROL)) playSfx("tap");
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [playSfx]);

  /** Called from a click: turns everything on (music starts if there is an MP3). */
  const enableAll = useCallback(() => {
    setSfxOn(true);
    if (musicSrc) setMusicOn(true);
  }, [musicSrc]);

  const disableAll = useCallback(() => {
    setSfxOn(false);
    setMusicOn(false);
  }, []);

  const value = {
    audioRef,
    musicSrc,
    spotify,
    hasMusic: !!musicSrc,
    musicOn,
    setMusicOn,
    musicVolume,
    setMusicVolume,
    sfxOn,
    setSfxOn,
    sfxVolume,
    setSfxVolume,
    playSfx,
    panelOpen,
    setPanelOpen,
    enableAll,
    disableAll,
    anyOn: sfxOn || musicOn,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useSound = () => useContext(SoundContext);
