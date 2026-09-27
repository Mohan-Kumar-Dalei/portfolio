import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSite } from "./SiteContext";
import { fileUrl } from "../lib/api";
import { parseSpotify } from "../lib/spotify";

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const { settings } = useSite();
  const [enabled, setEnabled] = useState(() => localStorage.getItem("mkd_sound") === "1");
  const audioRef = useRef(null);
  const acRef = useRef(null);
  const lastTick = useRef(0);
  // A Spotify link from the admin replaces the MP3: its player card opens from
  // the sound button instead (see AmbientControls). Not persisted, so the card
  // never pops up on its own when a visitor comes back.
  const spotify = parseSpotify(settings?.spotifyUrl);
  const spotifyLink = spotify?.url || "";
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = true;
      a.volume = 0.22;
      audioRef.current = a;
    }
    const a = audioRef.current;
    const url = spotifyLink ? "" : fileUrl(settings?.musicUrl);
    if (url && !a.src.includes(encodeURI(url).slice(0, 20))) a.src = url;
    if (enabled && url) a.play().catch(() => {});
    else a.pause();
  }, [enabled, settings, spotifyLink]);

  useEffect(() => {
    localStorage.setItem("mkd_sound", enabled ? "1" : "0");
  }, [enabled]);

  const playTick = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    if (now - lastTick.current < 55) return;
    lastTick.current = now;
    try {
      if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ac = acRef.current;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = 540;
      g.gain.value = 0.035;
      o.connect(g);
      g.connect(ac.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);
      o.stop(ac.currentTime + 0.09);
    } catch {
      // WebAudio is unavailable or blocked — the click sound is optional.
    }
  }, [enabled]);

  // Tick once when the pointer enters a control. `mouseover` also fires for
  // every child inside it (label, icon, arrow…), which played the sound two
  // or three times per hover, so only a change of control counts.
  const hoveredRef = useRef(null);
  useEffect(() => {
    const h = (e) => {
      const el = e.target.closest?.("a, button, [data-cursor='hover'], input, textarea, select") || null;
      if (el === hoveredRef.current) return;
      hoveredRef.current = el;
      if (el) playTick();
    };
    document.addEventListener("mouseover", h);
    return () => document.removeEventListener("mouseover", h);
  }, [playTick]);

  const toggle = () => setEnabled((v) => !v);
  const hasMusic = !!settings?.musicUrl && !spotify;

  return <SoundContext.Provider value={{ enabled, setEnabled, toggle, hasMusic, spotify, playerOpen, setPlayerOpen }}>{children}</SoundContext.Provider>;
};

export const useSound = () => useContext(SoundContext);
