"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { fullPortfolioPages } from "@/lib/portfolio";

/** Page size in px (US letter, 8.5 x 11). */
export const PW = 320;
export const PH = 414;

/**
 * Sheets, front + back. The cover's back carries page 1, then pages pair up across the spine,
 * so the book reads like the printed deck: [cover] [1|2] [3|4] [5|6] [7|end].
 */
const SHEETS: { front: number | "cover"; back: number | "end" }[] = [
  { front: "cover", back: 0 },
  { front: 1, back: 2 },
  { front: 3, back: 4 },
  { front: 5, back: 6 },
];
export const SPREADS = SHEETS.length;

/** A sheet's front faces up on spread `index`, its back on `index + 1`; mount pages one spread either side. */
const near = (shownOn: number, spread: number) => Math.abs(shownOn - spread) <= 1;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Cover() {
  return (
    <div
      className="flex h-full w-full flex-col justify-between rounded-r-[6px] p-8"
      style={{
        background:
          "linear-gradient(105deg,rgba(255,255,255,0.06) 0%,transparent 12%),linear-gradient(160deg,var(--mat-graphite-hi),var(--mat-graphite) 60%,var(--mat-chip))",
        boxShadow: "inset 6px 0 10px -6px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <span className="h-1 w-10 rounded-full bg-[var(--accent)]" />
      <div>
        <p className="text-[13px] text-[var(--text-secondary)]">Engineering portfolio</p>
        <p className="mt-2 text-[2.4rem] font-semibold leading-[0.95] text-[var(--text)]" style={{ fontStretch: "125%" }}>
          Louis
          <br />
          Zhang
        </p>
        <p className="mt-4 text-[13px] text-[var(--text-tertiary)]">Polytechnique Montréal</p>
      </div>
    </div>
  );
}

/** `mounted` is false away from the open spread: a blank sheet stands in so the ~6 MB of scans load as you reach them. */
function Page({ page, title, side, mounted }: { page: number; title?: string; side: "left" | "right"; mounted: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--surface-light)]">
      {mounted && (
        <img
          src={fullPortfolioPages[page]}
          alt={`Portfolio page ${page + 1}${title ? `: ${title}` : ""}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          draggable={false}
        />
      )}
      {/* gutter shadow toward the spine */}
      <div
        className="pointer-events-none absolute inset-y-0 w-10"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background: `linear-gradient(${side === "left" ? "270deg" : "90deg"},rgba(0,0,0,0.18),transparent)`,
        }}
      />
    </div>
  );
}

function EndPaper() {
  return (
    <div className="flex h-full w-full items-end bg-[var(--surface-light)] p-8">
      <p className="text-sm text-[var(--text-on-light-secondary)]">End of the portfolio. The full PDF is one click away.</p>
    </div>
  );
}

function Sheet({
  index,
  flip,
  spread,
  titles,
}: {
  index: number;
  flip: MotionValue<number>;
  spread: number;
  titles: string[];
}) {
  const sheet = SHEETS[index];
  const local = useTransform(flip, (f) => clamp01(f - index));
  const rotateY = useTransform(local, (l) => -180 * l);
  // z-index is ignored inside a 3D context, so stack with real depth: unturned first-on-top, turned last-on-top
  const z = useTransform(local, (l) => (l > 0.5 ? 1 + index * 0.6 : 1 + (SPREADS - index) * 0.6));
  // light falls off as the sheet stands up; strongest at 90°
  const shade = useTransform(local, (l) => Math.sin(l * Math.PI) * 0.35);

  return (
    <motion.div
      className="absolute left-1/2 top-0"
      style={{ width: PW, height: PH, rotateY, z, transformOrigin: "left center", transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
        {sheet.front === "cover" ? (
          <Cover />
        ) : (
          <Page page={sheet.front} title={titles[sheet.front]} side="right" mounted={near(index, spread)} />
        )}
        <motion.div className="pointer-events-none absolute inset-0 bg-[var(--mat-black)]" style={{ opacity: shade }} />
      </div>
      <div
        className="absolute inset-0"
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        {sheet.back === "end" ? (
          <EndPaper />
        ) : (
          <Page page={sheet.back} title={titles[sheet.back]} side="left" mounted={near(index + 1, spread)} />
        )}
        <motion.div className="pointer-events-none absolute inset-0 bg-[var(--mat-black)]" style={{ opacity: shade }} />
      </div>
    </motion.div>
  );
}

/** A hardcover book whose sheets turn with `flip` (0 = closed, SPREADS = last spread open). */
export default function BookDeck({
  flip,
  intro,
  spread,
  titles,
}: {
  flip: MotionValue<number>;
  intro: MotionValue<number>;
  /** Spread currently open (rounded `flip`). */
  spread: number;
  /** Page titles by page index, for alt text. */
  titles: string[];
}) {
  // closed, the cover sits centred; it slides to the spine as the book opens
  const x = useTransform(flip, (f) => (-PW / 2) * (1 - clamp01(f)));
  const tilt = useTransform(intro, (v) => 24 - v * 12);
  const leftEdge = useTransform(flip, (f) => clamp01(f * 2));

  return (
    <div style={{ width: PW * 2, height: PH, perspective: 2200 }} className="relative">
      <motion.div
        className="absolute inset-0"
        style={{ x, rotateX: tilt, transformStyle: "preserve-3d", transformOrigin: "50% 60%" }}
      >
        {/* back board + page block on the right */}
        <div
          className="absolute left-1/2 top-0 rounded-r-[6px]"
          style={{
            width: PW + 8,
            height: PH + 8,
            marginTop: -4,
            background: "var(--mat-graphite)",
            transform: "translateZ(-6px)",
            boxShadow: "0 40px 60px -25px rgba(0,0,0,0.55)",
          }}
        />
        {[3, 2, 1].map((k) => (
          <div
            key={k}
            className="absolute left-1/2 top-0 bg-[var(--surface-light)]"
            style={{ width: PW - 2 + k, height: PH, transform: `translateZ(${-k}px)`, borderRight: "1px solid var(--border-light)" }}
          />
        ))}
        <div className="absolute left-1/2 top-0" style={{ width: PW, height: PH, transform: "translateZ(-0.5px)" }}>
          <EndPaper />
        </div>
        {/* front board inside, revealed on the left once the cover turns */}
        <motion.div
          className="absolute right-1/2 top-0 rounded-l-[6px]"
          style={{
            width: PW + 8,
            height: PH + 8,
            marginTop: -4,
            background: "var(--mat-graphite)",
            transform: "translateZ(-6px)",
            opacity: leftEdge,
          }}
        />
        {SHEETS.map((_, i) => (
          <Sheet key={i} index={i} flip={flip} spread={spread} titles={titles} />
        ))}
      </motion.div>
    </div>
  );
}
