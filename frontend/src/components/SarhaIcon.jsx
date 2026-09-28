/**
 * SARHA's robot face. The eyes glance left and right and blink now and then
 * (CSS keyframes `.sarha-eyes` / `.sarha-eye` in index.css; still under
 * prefers-reduced-motion).
 */
const SarhaIcon = ({ size = 26, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
    {/* antenna */}
    <line x1="16" y1="3.5" x2="16" y2="7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle className="sarha-antenna" cx="16" cy="3" r="1.8" fill="currentColor" />
    {/* ears */}
    <rect x="2.5" y="14" width="3" height="7" rx="1.5" fill="currentColor" opacity="0.85" />
    <rect x="26.5" y="14" width="3" height="7" rx="1.5" fill="currentColor" opacity="0.85" />
    {/* head */}
    <rect x="5.5" y="7.5" width="21" height="19" rx="6.5" stroke="currentColor" strokeWidth="2" />
    {/* visor */}
    <rect x="8.5" y="11.5" width="15" height="9" rx="4.5" fill="currentColor" opacity="0.18" />
    {/* eyes: the group glances, each eye blinks */}
    <g className="sarha-eyes">
      <ellipse className="sarha-eye" cx="12.5" cy="16" rx="1.9" ry="2.3" fill="currentColor" />
      <ellipse className="sarha-eye" cx="19.5" cy="16" rx="1.9" ry="2.3" fill="currentColor" />
    </g>
    {/* mouth */}
    <path d="M13 22.6c1.8 1.1 4.2 1.1 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default SarhaIcon;
