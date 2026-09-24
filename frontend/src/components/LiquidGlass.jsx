import { useEffect, useId, useRef, useState } from "react";

/*
 * Liquid glass, after kube.io/blog/liquid-glass-css-svg.
 *
 * The element is treated as a slab of glass (refractive index 1.5) whose
 * bezel follows a convex squircle, y = (1 - (1 - x)^4)^(1/4). For every pixel
 * we find how far it sits inside the edge, take the surface slope there, bend
 * a vertical ray with Snell's law and store the resulting sideways shift in
 * the R (x) and G (y) channels of a displacement map (128 = no shift). An SVG
 * <feDisplacementMap> then warps the backdrop with that map. As in fooontic's
 * "Liquid Glass Switcher" the backdrop chain is `blur() url(#filter) saturate()`:
 * frost first, then refraction, then colour. `url()` in backdrop-filter only
 * works in Chromium; other browsers get the same chain without the refraction.
 */

const N_GLASS = 1.5;
const squircle = (x) => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

// Signed distance from (px, py) to a rounded rectangle centred in w×h.
const roundedRectSDF = (px, py, w, h, r) => {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
};

// Refraction strength (0..~1.1) for a point `x` of the way across the bezel.
const bendAt = (x) => {
  const d = 0.001;
  const slope = (squircle(Math.min(1, x + d)) - squircle(Math.max(0, x - d))) / (2 * d);
  const incidence = Math.atan(slope);
  const refracted = Math.asin(Math.sin(incidence) / N_GLASS);
  return Math.tan(incidence - refracted);
};

const buildMaps = (w, h, radius, bezel) => {
  const disp = document.createElement("canvas");
  disp.width = w;
  disp.height = h;
  const dctx = disp.getContext("2d");
  const dImg = dctx.createImageData(w, h);
  const maxBend = bendAt(0.001);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const px = x + 0.5;
      const py = y + 0.5;
      const sdf = roundedRectSDF(px, py, w, h, radius);
      const inside = -sdf;
      let r = 128;
      let g = 128;

      if (inside > 0 && inside < bezel) {
        // outward normal from the SDF gradient
        const e = 0.5;
        let nx = roundedRectSDF(px + e, py, w, h, radius) - roundedRectSDF(px - e, py, w, h, radius);
        let ny = roundedRectSDF(px, py + e, w, h, radius) - roundedRectSDF(px, py - e, w, h, radius);
        const len = Math.hypot(nx, ny) || 1;
        nx /= len;
        ny /= len;

        const t = inside / bezel; // 0 at the edge → 1 where the flat top begins
        const mag = bendAt(Math.max(t, 0.001)) / maxBend;
        // sample from slightly outside, so the rim wraps what lies beyond it
        r = 128 + nx * mag * 127;
        g = 128 + ny * mag * 127;
      }

      dImg.data[i] = r;
      dImg.data[i + 1] = g;
      dImg.data[i + 2] = 128;
      dImg.data[i + 3] = 255;
    }
  }
  dctx.putImageData(dImg, 0, 0);
  return { disp: disp.toDataURL() };
};

const supportsSvgBackdrop = () => {
  if (typeof navigator === "undefined") return false;
  const brands = navigator.userAgentData?.brands?.map((b) => b.brand) || [];
  if (brands.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b))) return true;
  // older Chromium without UA-CH
  return /Chrome\//.test(navigator.userAgent) && !/Firefox|FxiOS/.test(navigator.userAgent);
};

const LiquidGlass = ({ children, className = "", radius, bezel = 18, strength = 26, frost = 8, saturation = 1.5, style, active = true, ...rest }) => {
  const ref = useRef(null);
  const rawId = useId();
  const id = `lg-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [maps, setMaps] = useState(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [chromium] = useState(supportsSvgBackdrop);

  useEffect(() => {
    if (!chromium || !ref.current) return;
    let timer;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = radius ?? h / 2;
      setSize({ w, h });
      setMaps(buildMaps(w, h, Math.min(r, h / 2, w / 2), Math.min(bezel, h / 2)));
    };
    measure();
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 120);
    });
    ro.observe(ref.current);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [chromium, radius, bezel]);

  const tail = `saturate(${saturation * 100}%)`;
  // `active=false` renders the surface fully clear (no glass) so it can merge
  // into the page, e.g. the navbar at the top of the hero.
  const backdrop = !active ? "none" : chromium && maps ? `blur(${frost}px) url(#${id}) ${tail}` : `blur(${frost}px) ${tail}`;

  return (
    <div
      ref={ref}
      className={`liquid-glass ${active ? "" : "liquid-plain"} ${className}`}
      style={{ ...style, backdropFilter: backdrop, WebkitBackdropFilter: backdrop }}
      {...rest}
    >
      {chromium && maps && (
        <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <filter id={id} x="0" y="0" width={size.w} height={size.h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={maps.disp} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
};

export default LiquidGlass;
