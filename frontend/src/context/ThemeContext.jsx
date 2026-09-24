import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const THEMES = ["light", "dark"];
const STORAGE_KEY = "mkd_theme_v4";

const CLASSES = { light: ["light"], dark: ["dark"] };

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Light by default. (The key moved to v4 when the default switched from
    // dark, so earlier visits start on the new default.)
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked (private mode): fall back to the default
    }
    return THEMES.includes(saved) ? saved : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(...CLASSES[theme]);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // not persisted; the theme still applies for this visit
    }
  }, [theme]);

  const toggle = () => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
