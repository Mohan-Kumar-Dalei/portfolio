/**
 * Flat illustrated avatar of Mohan (dark hair, beard, black tee), drawn as
 * SVG so it needs no image. To use a picture instead, set AVATAR_IMG in
 * data.js.
 */
const SKIN = "#c8875a";
const SKIN_SHADE = "#b07349";
const HAIR = "#1b1411";

const Avatar = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" role="img" aria-label="Illustrated avatar of Mohan Kumar Dalei" className={className}>
    <rect width="200" height="200" fill="#dcfce7" />
    <circle cx="100" cy="100" r="78" fill="#bbf7d0" />
    {/* shoulders, black tee */}
    <path d="M28 200c4-38 34-58 72-58s68 20 72 58z" fill="#121212" />
    <path d="M84 142c4 8 10 12 16 12s12-4 16-12" fill="none" stroke="#2a2a2a" strokeWidth="3" />
    {/* neck */}
    <path d="M86 120h28v22c-4 8-10 12-14 12s-10-4-14-12z" fill={SKIN_SHADE} />
    {/* ears */}
    <ellipse cx="63" cy="97" rx="7" ry="10" fill={SKIN_SHADE} />
    <ellipse cx="137" cy="97" rx="7" ry="10" fill={SKIN_SHADE} />
    {/* face */}
    <ellipse cx="100" cy="94" rx="37" ry="43" fill={SKIN} />
    {/* beard */}
    <path d="M63 92c0 34 17 50 37 50s37-16 37-50c-5 16-14 24-23 26-4-4-9-6-14-6s-10 2-14 6c-9-2-18-10-23-26z" fill={HAIR} />
    <path d="M90 121c3-2 6-3 10-3s7 1 10 3c-3 3-6 4-10 4s-7-1-10-4z" fill={SKIN_SHADE} />
    {/* hair */}
    <path d="M62 90c-6-34 12-56 40-56 26 0 44 16 39 52-4-14-10-24-20-28-10 6-28 8-44 4-8 6-13 16-15 28z" fill={HAIR} />
    <path d="M78 46c10-10 30-14 46-6-12 0-24 4-32 10z" fill="#2a201b" />
    {/* brows and eyes */}
    <path d="M78 84c5-3 11-3 16-1M106 83c5-2 11-2 16 1" stroke={HAIR} strokeWidth="4" strokeLinecap="round" fill="none" />
    <ellipse cx="86" cy="95" rx="3.6" ry="4" fill={HAIR} />
    <ellipse cx="114" cy="95" rx="3.6" ry="4" fill={HAIR} />
    {/* nose */}
    <path d="M100 98c-2 6-4 10-1 12 2 1 4 1 6 0" stroke={SKIN_SHADE} strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

export default Avatar;
