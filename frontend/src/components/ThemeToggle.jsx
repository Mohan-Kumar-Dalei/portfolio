import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
      className={`relative grid h-10 w-10 place-items-center rounded-full border border-border hover:border-strong transition-colors duration-200 overflow-hidden ${className}`}
    >
      <motion.span
        key={theme}
        initial={{ y: 20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-primary"
      >
        {isDark ? <Moon size={17} /> : <Sun size={17} />}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
