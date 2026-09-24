import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Big uppercase filter tabs. The violet underline sits under the active tab
 * and glides to whichever tab is hovered (or focused), returning on leave.
 */
const FilterTabs = ({ items, value, onChange, counts, groupId, testPrefix = "filter" }) => {
  const [hovered, setHovered] = useState(null);
  const target = hovered ?? value;

  return (
    <div className="flex flex-wrap gap-x-7 gap-y-3" onMouseLeave={() => setHovered(null)}>
      {items.map((c) => {
        const isTarget = target === c;
        const isActive = value === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            onMouseEnter={() => setHovered(c)}
            onFocus={() => setHovered(c)}
            onBlur={() => setHovered(null)}
            aria-pressed={isActive}
            data-testid={`${testPrefix}-${c.toLowerCase().replace(/[^a-z]/g, "-")}`}
            className={`relative font-display text-xl md:text-2xl font-bold uppercase tracking-[-0.02em] transition-colors duration-300 ${
              isActive || isTarget ? "text-ink" : "text-ink-muted"
            }`}
          >
            <span className={`inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTarget && !isActive ? "-translate-y-0.5" : ""}`}>
              {c}
            </span>
            {counts && <sup className="ml-1 font-mono text-[0.625rem] text-ink-muted">{counts(c)}</sup>}
            {isTarget && (
              <motion.span
                layoutId={groupId}
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-grad"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
