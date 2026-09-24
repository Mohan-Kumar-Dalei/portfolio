import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--card)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-contrast)",
        },
        secondary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-contrast)",
        },
        highlight: "var(--accent-soft)",
        success: "#00C971",
        ink: {
          DEFAULT: "var(--text)",
          muted: "var(--text-secondary)",
        },
        border: "var(--border)",
        strong: "var(--border-strong)",
        input: "var(--border)",
        ring: "var(--accent)",
        background: "var(--bg)",
        foreground: "var(--text)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--text)",
        },
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--text)",
        },
        muted: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        chip: "var(--chip)",
      },
      fontFamily: {
        display: ["Syne", "Inter Tight", "sans-serif"],
        body: ["Inter Tight", "Inter", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
