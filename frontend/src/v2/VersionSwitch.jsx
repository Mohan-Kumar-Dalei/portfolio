import { useLocation, useNavigate } from "react-router-dom";

export const isV2Path = (pathname) => pathname === "/v2" || pathname.startsWith("/v2/");

// v1 pages that are sections on the single v2 page.
const V1_TO_SECTION = { "/about": "about", "/experience": "experience", "/projects": "projects", "/contact": "contact", "/services": "contact" };
const SECTION_TO_V1 = { about: "/about", stack: "/about", experience: "/experience", education: "/experience", certifications: "/experience", projects: "/projects", blog: "/blog", contact: "/contact" };

// The same content in the other version, so switching keeps your place.
export const otherVersionPath = (pathname, hash = "") => {
  if (isV2Path(pathname)) {
    const rest = pathname.slice(3) || "/";
    if (rest === "/" && hash) return SECTION_TO_V1[hash.slice(1)] || "/";
    return rest;
  }
  if (pathname.startsWith("/blog") || /^\/projects\/[^/]+/.test(pathname)) return `/v2${pathname}`;
  const section = V1_TO_SECTION[pathname];
  return section ? `/v2#${section}` : "/v2";
};

/** Segmented v1 / v2 control. Styled from the theme tokens, so it fits both versions. */
const VersionSwitch = ({ className = "" }) => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const current = isV2Path(pathname) ? "v2" : "v1";

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
