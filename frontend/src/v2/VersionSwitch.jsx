import { useLocation, useNavigate } from "react-router-dom";

// v2 (the minimal site) is the default and lives at the root; v1 (the
// animated site) lives under /v1 with the same page paths.
export const isV1Path = (pathname) => pathname === "/v1" || pathname.startsWith("/v1/");

// Home-page sections (v2) and the v1 page that covers each.
const SECTION_TO_V1 = { about: "/about", stack: "/about", experience: "/experience", education: "/experience", projects: "/projects", blog: "/blog", contact: "/contact" };

// The same content in the other version, so switching keeps your place.
// v2 also answers v1's page paths (/about, /projects, …) by scrolling to that section.
export const otherVersionPath = (pathname, hash = "") => {
  if (isV1Path(pathname)) return pathname.slice(3) || "/";
  const page = pathname === "/" ? SECTION_TO_V1[hash.slice(1)] || "" : pathname;
  return `/v1${page}`;
};

/** Segmented v1 / v2 control. Styled from the theme tokens, so it fits both versions. */
const VersionSwitch = ({ className = "" }) => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const current = isV1Path(pathname) ? "v1" : "v2";

  const go = (v) => {
    if (v !== current) navigate(otherVersionPath(pathname, hash));
  };

  return (
    <div
      role="group"
      aria-label="Site version"
      className={`relative inline-flex shrink-0 items-center rounded-full border border-border p-0.5 font-mono text-[11px] font-medium leading-none ${className}`}
      data-testid="version-switch"
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ background: "var(--text)", transform: current === "v2" ? "translateX(100%)" : "none" }}
      />
      {["v1", "v2"].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => go(v)}
          aria-pressed={current === v}
          title={v === "v1" ? "Version 1: the animated, cinematic site" : "Version 2: the minimal site"}
          className="relative z-10 w-8 rounded-full py-1.5 transition-colors duration-300"
          style={{ color: current === v ? "var(--bg)" : "var(--text-secondary)" }}
          data-testid={`version-${v}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
};

export default VersionSwitch;
