import { useEffect, useId, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

/* Small building blocks of the v2 page: full-bleed rules, hatched dividers,
   sections, chips and the expandable timeline entries. */

// Diagonal-hatched strip between sections, edge to edge.
export const Hatch = () => <div aria-hidden className="v2-hatch" />;

export const Section = ({ id, title, count, children, className = "" }) => (
  <section id={id} className={`v2-section ${className}`} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="v2-rule-b px-4 py-3 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] sm:text-3xl">
      {title}
      {count != null && <sup className="ml-1.5 align-super font-mono text-sm font-normal tracking-normal text-ink-muted">({count})</sup>}
    </h2>
    {children}
  </section>
);

export const IconBox = ({ children, className = "" }) => (
  <span className={`grid size-6 shrink-0 place-items-center rounded-md border border-border bg-chip text-ink-muted ${className}`}>{children}</span>
);

export const Chip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-chip px-2 py-[3px] font-mono text-xs text-ink">
    {Icon && <Icon aria-hidden className="size-3 shrink-0 text-ink-muted" />}
    {children}
  </span>
);

export const useClock = (timeZone = "Asia/Kolkata") => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("en-US", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
};

// "MM.YYYY" or "YYYY" -> { y, m } (m is null when only the year is known)
const parse = (s) => {
  if (!s) return null;
  const [a, b] = String(s).split(".");
  return b ? { y: +b, m: +a } : { y: +a, m: null };
};

/** "1y 2m", or "" when the dates are too vague to say. */
export const duration = (start, end) => {
  const s = parse(start);
  const now = new Date();
  const e = end ? parse(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  if (!s || !e) return "";
  if (s.m == null || e.m == null) {
    if (s.m != null || e.m != null || !end) return "";
    const years = e.y - s.y;
    return years > 0 ? `${years}y` : "";
  }
  const months = (e.y - s.y) * 12 + (e.m - s.m) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y}y` : "", m || !y ? `${m}m` : ""].filter(Boolean).join(" ");
};

const Collapse = ({ open, id, children }) => (
  <div id={id} className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
    <div className="min-h-0 overflow-hidden">{children}</div>
  </div>
);

/** One role / degree / project inside a group, collapsible. */
export const Entry = ({ entry, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const Icon = entry.icon;
  const dur = entry.duration ?? duration(entry.start, entry.end);
  const period = entry.period ?? (entry.start ? `${entry.start} — ${entry.end || "∞"}` : "");
  const meta = [entry.type, period, dur].filter(Boolean);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-start gap-3 py-1 text-left"
      >
        <IconBox className="mt-0.5">{Icon && <Icon aria-hidden className="size-3.5" />}</IconBox>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium leading-snug text-ink">{entry.title}</span>
          {meta.length > 0 && (
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              {meta.map((m, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden className="h-3.5 w-px bg-[var(--border-strong)]" />}
                  <span className={i > 0 ? "font-mono text-[13px]" : ""}>{m}</span>
                </span>
              ))}
            </span>
          )}
        </span>
        <ChevronsUpDown aria-hidden className="mt-1 size-4 shrink-0 text-ink-muted transition-colors group-hover:text-ink" />
      </button>

      <Collapse open={open} id={id}>
        <div className="ml-3 border-l border-border pb-2 pl-6 pt-2">
          {entry.bullets?.length > 0 && (
            <ul className="space-y-1.5 text-[15px] leading-relaxed text-ink-muted">
              {entry.bullets.map((b) => (
                <li key={b} className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:rounded-full before:bg-[var(--border-strong)]">
                  {b}
                </li>
              ))}
            </ul>
          )}
          {entry.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.skills.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          )}
          {entry.body}
        </div>
      </Collapse>
    </div>
  );
};

/** An organisation (company, school, project) with its entries. */
export const Group = ({ group, defaultOpen = true }) => (
  <div className="space-y-3 px-4 py-4">
    <div className="flex items-center gap-3">
      {group.logo ? (
        <img src={group.logo} alt="" loading="lazy" className="size-6 shrink-0 rounded-full border border-border object-cover" />
      ) : (
        <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-chip font-mono text-[9px] font-semibold text-ink-muted">
          {group.initials}
        </span>
      )}
      <h3 className="flex min-w-0 items-center gap-2 text-[17px] font-semibold leading-snug">
        <span className="truncate">{group.org}</span>
        {group.actions}
        {group.current && (
          <span className="relative flex size-2.5 shrink-0" title="Current">
            <span className="absolute inset-0 animate-ping rounded-full bg-sky-500/60" />
            <span className="relative m-auto size-1.5 rounded-full bg-sky-500" />
          </span>
        )}
      </h3>
    </div>
    {group.positions.map((p) => (
      <Entry key={p.title} entry={p} defaultOpen={defaultOpen} />
    ))}
  </div>
);
