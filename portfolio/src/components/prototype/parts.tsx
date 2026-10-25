"use client";

import { useId } from "react";

/** Material tokens (DESIGN.md §2). Colour comes from what the parts are made of, not from a theme. */
export const KAPTON = "var(--mat-kapton)";
export const ACCENT = "var(--accent)";
export const ALU =
  "linear-gradient(145deg,var(--mat-alu-hi) 0%,var(--mat-alu-mid) 26%,var(--mat-alu-hi) 50%,var(--mat-alu-lo) 76%,var(--mat-alu-mid) 100%)";
export const BRUSHED =
  "repeating-linear-gradient(90deg,rgba(255,255,255,0.04) 0 1px,transparent 1px 3px),linear-gradient(160deg,var(--mat-alu-mid),var(--mat-alu-lo) 55%,var(--mat-alu-mid))";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const fill = (v: string) => ({ fill: `var(${v})` });

/** Aluminium band drawn as an SVG stroke so the middle stays open and lower layers show through. */
export function AluRing({ radius, width, className }: { radius: number; width: number; className?: string }) {
  const id = useId();
  return (
    <svg className={cx("absolute inset-0 h-full w-full overflow-visible", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--mat-alu-hi)" }} />
          <stop offset="0.3" style={{ stopColor: "var(--mat-alu-mid)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--mat-alu-hi)" }} />
          <stop offset="0.8" style={{ stopColor: "var(--mat-alu-lo)" }} />
          <stop offset="1" style={{ stopColor: "var(--mat-alu-mid)" }} />
        </linearGradient>
      </defs>
      <rect
        x={width / 2}
        y={width / 2}
        style={{ width: `calc(100% - ${width}px)`, height: `calc(100% - ${width}px)` }}
        rx={radius}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={width}
      />
    </svg>
  );
}

export function Glass({ radius }: { radius: number }) {
  return (
    <div
      className="absolute inset-0 border border-white/20"
      style={{
        borderRadius: radius,
        background:
          "linear-gradient(115deg,rgba(255,255,255,0.16) 0%,rgba(255,255,255,0.03) 34%,transparent 35%,transparent 62%,rgba(255,255,255,0.06) 63%,transparent 76%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    />
  );
}

export function Lens({ size }: { size: number }) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 36% 34%,rgba(150,130,255,0.4) 0 9%,var(--mat-black) 26%,var(--mat-chip) 50%,var(--mat-chip-edge) 58%,var(--mat-ink) 66%,var(--mat-graphite) 100%)",
        boxShadow: "inset 0 0 0 2px var(--mat-alu-lo), 0 1px 0 rgba(255,255,255,0.12)",
      }}
    />
  );
}

export function Cell({ className, lines }: { className: string; lines: string[] }) {
  return (
    <div
      className={cx(className, "border border-[var(--mat-chip-edge)] p-3")}
      style={{
        background: "linear-gradient(180deg,var(--mat-graphite),var(--mat-chip))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 3px var(--mat-chip)",
      }}
    >
      <div className="absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 rounded-sm" style={{ background: KAPTON }} />
      <div className="flex h-full flex-col justify-center gap-1 font-mono text-[8px] uppercase leading-tight tracking-wider text-[var(--text-secondary)]">
        {lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
        <span className="mt-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-[2px] border border-[var(--text-tertiary)]" />
          ))}
        </span>
      </div>
    </div>
  );
}

/** Phone logic board: matte black mask, bronze traces, gold pads, perforated shield can, kapton flex. */
export function PhoneBoard() {
  const id = useId();
  const traces = [
    "M100 46 H112",
    "M100 30 C106 30 106 22 112 22",
    "M152 30 H158",
    "M152 50 H158",
    "M60 76 V96 H112",
    "M30 76 V110 H90",
    "M132 58 V96",
    "M170 60 V120 H120",
    "M14 90 H40 V120",
  ];
  const chip = { ...fill("--mat-chip"), stroke: "var(--mat-chip-edge)" };
  const label = { ...fill("--text-tertiary"), fontFamily: "var(--font-mono)" };
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--mat-alu-hi)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--mat-steel)" }} />
          <stop offset="1" style={{ stopColor: "var(--mat-alu-mid)" }} />
        </linearGradient>
        <pattern id={`${id}p`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="0.8" fill="rgba(0,0,0,0.4)" />
        </pattern>
      </defs>
      <path d="M146 101 C175 101 180 128 205 128" strokeWidth="9" fill="none" opacity="0.92" style={{ stroke: KAPTON }} />
      <rect x="1" y="1" width="198" height="148" rx="12" style={{ ...fill("--mat-pcb"), stroke: "var(--mat-pcb-edge)" }} />
      <g strokeWidth="0.9" fill="none" opacity="0.75" style={{ stroke: "var(--mat-trace)" }}>
        {traces.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <rect x="14" y="14" width="86" height="62" rx="4" fill={`url(#${id}c)`} />
      <rect x="14" y="14" width="86" height="62" rx="4" fill={`url(#${id}p)`} />
      <rect x="112" y="18" width="40" height="40" rx="4" style={chip} />
      <rect x="114" y="20" width="36" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
      <text x="132" y="42" fontSize="7" textAnchor="middle" style={label}>
        SoC
      </text>
      <rect x="158" y="18" width="28" height="22" rx="3" style={chip} />
      <text x="172" y="31" fontSize="5" textAnchor="middle" style={label}>
        NAND
      </text>
      <rect x="158" y="46" width="28" height="14" rx="2" style={chip} />
      <text x="172" y="55" fontSize="5" textAnchor="middle" style={label}>
        PMIC
      </text>
      <rect x="112" y="96" width="34" height="10" rx="2" style={fill("--mat-graphite")} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={115 + i * 3.8} y="98" width="1.8" height="6" style={fill("--mat-gold")} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={16 + i * 7} y="130" width="4" height="8" rx="0.8" style={fill("--mat-gold")} />
      ))}
      {[
        [104, 66],
        [108, 80],
        [156, 70],
        [180, 74],
        [50, 88],
        [74, 112],
        [150, 116],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="2.6" rx="0.6" style={fill("--mat-cap")} />
      ))}
    </svg>
  );
}

export function WatchBoard() {
  return (
    <svg viewBox="0 0 100 110" className="h-full w-full">
      <rect x="1" y="1" width="98" height="108" rx="26" style={{ ...fill("--mat-pcb"), stroke: "var(--mat-pcb-edge)" }} />
      <g strokeWidth="0.8" fill="none" opacity="0.75" style={{ stroke: "var(--mat-trace)" }}>
        <path d="M50 40 V20" />
        <path d="M34 55 H16" />
        <path d="M66 55 H84" />
        <path d="M50 70 V92" />
      </g>
      <rect x="32" y="38" width="36" height="34" rx="4" style={{ ...fill("--mat-chip"), stroke: "var(--mat-chip-edge)" }} />
      <text x="50" y="58" fontSize="6" textAnchor="middle" style={{ ...fill("--text-tertiary"), fontFamily: "var(--font-mono)" }}>
        SiP
      </text>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={30 + i * 5.4} y="94" width="2.6" height="6" style={fill("--mat-gold")} />
      ))}
      <path d="M86 30 C96 30 98 20 104 20" strokeWidth="6" fill="none" style={{ stroke: KAPTON }} />
    </svg>
  );
}

export function Midframe() {
  return (
    <div className="absolute inset-[10px] overflow-hidden rounded-[38px]" style={{ background: BRUSHED }}>
      {/* cutouts */}
      <div className="absolute left-5 right-5 top-5 h-[120px] rounded-[16px] bg-[var(--mat-ink)]/85" />
      <div className="absolute bottom-[70px] left-6 right-6 top-[160px] rounded-[16px] bg-[var(--mat-ink)]/60" />
      {/* taptic engine + speaker */}
      <div
        className="absolute bottom-6 left-7 h-9 w-24 rounded-[8px] border border-white/10"
        style={{ background: "linear-gradient(180deg,var(--mat-alu-mid),var(--mat-alu-lo))" }}
      />
      <div
        className="absolute bottom-6 right-7 h-9 w-16 rounded-[8px] bg-[var(--mat-chip)]"
        style={{ backgroundImage: "radial-gradient(var(--mat-chip-edge) 1px,transparent 1.2px)", backgroundSize: "5px 5px" }}
      />
    </div>
  );
}
