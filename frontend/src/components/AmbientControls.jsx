import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "../context/SoundContext";

const AmbientControls = () => {
  const { enabled, toggle, hasMusic } = useSound();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      onClick={toggle}
      data-testid="sound-toggle"
      aria-label="Toggle sound"
      className="fixed bottom-6 left-6 z-[75] grid h-12 w-12 place-items-center rounded-full glass hover:border-primary transition-colors duration-200"
      title={enabled ? "Sound on" : "Sound off"}
    >
      {enabled ? (
        <span className="flex items-end gap-[3px] h-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-primary"
              animate={{ height: hasMusic ? ["6px", "16px", "8px", "14px"] : ["8px", "10px", "8px", "10px"] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
            />
          ))}
        </span>
      ) : (
        <VolumeX size={18} className="text-ink-muted" />
      )}
    </motion.button>
  );
};

export default AmbientControls;
