import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

/**
 * Custom select: a pill button that opens a floating listbox.
 * Keyboard: ↑/↓ to move, Enter/Space to pick, Esc to close, Tab leaves.
 * `options` can be strings or { value, label }.
 */
const Dropdown = ({ value, onChange, options, label = "Select", align = "right", className = "", "data-testid": testid }) => {
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, items.findIndex((o) => o.value === value)));
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();
  const current = items.find((o) => o.value === value) || items[0];

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActive(Math.max(0, items.findIndex((o) => o.value === value)));
      requestAnimationFrame(() => listRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (i) => {
    onChange(items[i].value);
    setOpen(false);
    rootRef.current?.querySelector("button")?.focus();
  };

  const onListKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(items.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector("button")?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current?.label}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        data-testid={testid}
        className={`dropdown-trigger inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
          open ? "border-primary text-ink" : "border-border text-ink hover:border-strong"
        }`}
      >
        <span className="label text-ink-muted normal-case tracking-normal font-body text-xs">{label}</span>
        <span>{current?.label}</span>
        <ChevronDown size={15} className={`transition-transform duration-300 ${open ? "rotate-180 text-primary" : "text-ink-muted"}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onListKey}
            data-lenis-prevent
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`dropdown-menu absolute z-50 mt-2 min-w-full w-max p-1.5 rounded-2xl outline-none ${
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            }`}
          >
            {items.map((o, i) => {
              const selected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                  className={`relative flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                    selected ? "text-primary font-semibold" : "text-ink"
                  }`}
                >
                  {i === active && <motion.span layoutId={`${listId}-hl`} className="dropdown-hl absolute inset-0 rounded-xl" transition={{ duration: 0.18 }} />}
                  <span className="relative">{o.label}</span>
                  <Check size={14} className={`relative ${selected ? "opacity-100" : "opacity-0"}`} />
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
