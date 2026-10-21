import { useEffect, useState } from "react";

/* Building blocks of the v2 page: hatched dividers, boxed section headers,
   cell grids, CV rows and a few formatting helpers. */

const Cross = ({ className }) => <span aria-hidden className={`v2-cross hidden md:block ${className}`} />;

// Hatched strip between sections; "+" marks where it meets the frame.
export const Hatch = () => (
  <div aria-hidden className="v2-hatch">
    <Cross className="-left-[6px] -top-[6px]" />
    <Cross className="-right-[6px] -top-[6px]" />
    <Cross className="-bottom-[6px] -left-[6px]" />
    <Cross className="-bottom-[6px] -right-[6px]" />
  </div>
);

// Splits a title into words so they can rise in one after another (see .v2-word).
const Words = ({ text }) =>
  typeof text === "string"
    ? text.split(" ").map((w, i, all) => (
        <span key={i} className="v2-word" style={{ "--i": i }}>
          {w}
          {i < all.length - 1 ? " " : ""}
        </span>
      ))
    : text;

/** Section with a boxed header row: number | title | meta. */
export const Section = ({ id, n, title, meta, children }) => (
  <section id={id} className="v2-section" aria-labelledby={`${id}-title`}>
    <div className="v2-rule-b flex items-stretch">
      {n && (
        <span className="grid w-12 shrink-0 place-items-center border-r border-border font-mono text-xs text-[var(--accent)] sm:w-14">{n}</span>
      )}
      <h2 id={`${id}-title`} className="flex-1 px-4 py-3 text-[1.6rem] font-semibold leading-tight tracking-[-0.035em] sm:px-5 sm:text-[1.85rem]">
        <Words text={title} />
      </h2>
      {meta && <span className="hidden items-center border-l border-border px-4 v2-label sm:flex">{meta}</span>}
    </div>
    {children}
  </section>
);

/** Grid of boxes that share single 1px lines. `cols` are Tailwind grid-cols classes. */
export const Cells = ({ cols = "grid-cols-2", className = "", children }) => (
  <div className={`v2-cells ${className}`}>
    <div className={cols}>{children}</div>
  </div>
);

/** Inline list of technologies: "React / Node.js / MongoDB" */
export const TechLine = ({ items = [], className = "" }) =>
  items.length ? (
    <p className={`font-mono text-[11.5px] leading-relaxed text-ink-muted ${className}`}>
      {items.map((t, i) => (
        <span key={t}>
          {i > 0 && <span className="px-1.5 text-[var(--border-strong)]">/</span>}
          {t}
        </span>
      ))}
    </p>
  ) : null;

export const btn = {
  solid:
    "inline-flex h-10 items-center gap-2 bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-85 disabled:opacity-60",
  accent:
    "inline-flex h-10 items-center gap-2 bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-contrast)] transition-opacity hover:opacity-90",
  ghost:
    "inline-flex h-10 items-center gap-2 border border-[var(--border-strong)] px-4 text-sm font-medium transition-colors hover:border-[var(--text)] hover:bg-chip",
};

export const useClock = (timeZone = "Asia/Kolkata") => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("en-US", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "MM.YYYY" or "YYYY" -> { y, m } (m is null when only the year is known)
const parse = (s) => {
  if (!s) return null;
  const [a, b] = String(s).split(".");
  return b ? { y: +b, m: +a } : { y: +a, m: null };
};
const label = (s) => {
  const d = parse(s);
  return d ? (d.m ? `${MONTHS[d.m - 1]} ${d.y}` : String(d.y)) : "";
};

/** "Oct 2025 — Now" */
export const period = (start, end) => (end && label(start) === label(end) ? label(end) : `${label(start)} — ${end ? label(end) : "Now"}`);

/** "1y 2m", or "" when the dates are too vague to say. */
export const duration = (start, end) => {
  if (start === end) return "";
  const s = parse(start);
  const now = new Date();
  const e = end ? parse(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  if (!s || !e) return "";
  if (s.m == null || e.m == null) {
    if (s.m != null || e.m != null || !end) return "";
    const years = e.y - s.y;
    return years > 0 ? `${years} yrs` : "";
  }
  const months = (e.y - s.y) * 12 + (e.m - s.m) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y}y` : "", m || !y ? `${m}m` : ""].filter(Boolean).join(" ");
};

/** One CV row: a dates box on the left, the role on the right. */
export const TimelineRow = ({ org, current, role }) => {
  const dur = duration(role.start, role.end);
  return (
    <li className="grid border-b border-border last:border-0 sm:grid-cols-[11rem_1fr]">
      <div className="flex items-center gap-3 border-border px-4 pt-4 font-mono text-xs leading-5 text-ink-muted sm:block sm:border-r sm:px-5 sm:py-5">
        <div className={current ? "text-[var(--accent)]" : "text-ink"}>{period(role.start, role.end)}</div>
        {dur && <div>{dur}</div>}
        {current && (
          <span className="inline-flex items-center gap-1.5 sm:mt-2">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" /> Current
          </span>
        )}
      </div>
      <div className="px-4 pb-5 pt-2 sm:px-5 sm:py-5">
        <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">
          {role.title}
          <span className="font-normal text-ink-muted"> @ {org}</span>
        </h3>
        {role.type && <p className="mt-0.5 text-sm text-ink-muted">{role.type}</p>}
        {role.bullets?.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-ink-muted">
            {role.bullets.map((b) => (
              <li key={b} className="relative pl-5 before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2.5 before:bg-[var(--accent)]">
                {b}
              </li>
            ))}
          </ul>
        )}
        <TechLine items={role.skills} className="mt-3" />
      </div>
    </li>
  );
};
