"use client";

interface HollowAvatarProps {
  size?: number;
}

export default function HollowAvatar({ size = 150 }: HollowAvatarProps) {
  return (
    <div
      className="hollow-avatar"
      style={{
        width: size,
        height: size,
      }}
      aria-label="Holographic outline avatar"
    >
      <svg viewBox="0 0 160 160" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="hollow-avatar-stroke" x1="28" y1="18" x2="132" y2="146">
            <stop stopColor="#e7fbff" />
            <stop offset="0.44" stopColor="#69e8ff" />
            <stop offset="1" stopColor="#8cffca" />
          </linearGradient>
          <filter id="hollow-avatar-glow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="80" cy="80" r="72" stroke="url(#hollow-avatar-stroke)" strokeWidth="2" opacity="0.45" />
        <circle cx="80" cy="80" r="57" stroke="url(#hollow-avatar-stroke)" strokeWidth="1.3" opacity="0.2" strokeDasharray="8 10" />

        <g filter="url(#hollow-avatar-glow)" stroke="url(#hollow-avatar-stroke)" strokeLinecap="round" strokeLinejoin="round">
          <path d="M54 63c2-21 15-35 31-35 17 0 30 13 31 35" strokeWidth="5" />
          <path d="M49 68c6-7 12-11 20-12 8-2 16 0 24-5 7-4 11-9 14-15" strokeWidth="3" opacity="0.78" />
          <path d="M48 69c0 29 14 50 33 50 20 0 34-21 34-50" strokeWidth="5" />
          <path d="M61 82c5 3 10 3 15 0" strokeWidth="3" opacity="0.85" />
          <path d="M89 82c5 3 10 3 15 0" strokeWidth="3" opacity="0.85" />
          <path d="M74 101c5 4 13 4 19 0" strokeWidth="3" opacity="0.82" />
          <path d="M37 141c6-19 22-31 44-31 23 0 39 12 45 31" strokeWidth="5" />
          <path d="M56 132c7 6 15 9 25 9s19-3 27-9" strokeWidth="2" opacity="0.55" />
        </g>

        <g stroke="#69e8ff" strokeWidth="1.4" opacity="0.5">
          <path d="M23 80h20" />
          <path d="M117 80h20" />
          <path d="M80 23v20" />
          <path d="M80 117v20" />
        </g>
      </svg>
      <span className="hollow-avatar__scan" />
      <span className="hollow-avatar__base" />
    </div>
  );
}
