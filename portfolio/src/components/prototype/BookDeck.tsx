"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { fullPortfolioDocument, fullPortfolioPages } from "@/lib/portfolio";
import { btnPrimaryLight } from "./stage";

/**
 * Page size in px (US letter, 8.5 x 11). Built large and only ever scaled down by <Fit>: a CSS-3D layer is
 * rasterised at its own size, so scaling a small book up blurred the scans.
 */
export const PW = 600;
export const PH = 776;
/** The cover and end paper were laid out for a 320px page; CSS zoom re-lays them out (crisply) at PW. */
const K = PW / 320;

function Zoomed({ children }: { children: ReactNode }) {
  return <div style={{ width: PW / K, height: PH / K, zoom: K }}>{children}</div>;
}

/**
 * Sheets, front + back. The cover's back carries page 1, then pages pair up across the spine,
 * so the book reads like the printed deck: [cover] [1|2] [3|4] [5|6] [7|end paper].
 */
const SHEETS: { front: number | "cover"; back: number }[] = [
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
    <Zoomed>
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
        <p className="text-[13px] font-medium tracking-wide" style={{ color: "var(--accent)" }}>
          Engineering portfolio
        </p>
        <p className="mt-2 text-[2.4rem] font-semibold leading-[0.95]" style={{ fontStretch: "125%", color: "#f5f5f7" }}>
          Louis
          <br />
          Zhang
        </p>
        <p className="mt-4 text-[13px]" style={{ color: "rgba(245,245,247,0.62)" }}>
          Polytechnique Montréal
        </p>
      </div>
    </div>
    </Zoomed>
  );
}

/**
 * Pre-scaled scans for the book. Browsers shrink images inside CSS-3D layers without mipmaps, so a 2000px scan drawn
 * ~500px wide turned small text to mush; srcset hands over one close to the drawn size instead.
 */
const pageSrc = (page: number, w: 600 | 1200) => fullPortfolioPages[page].replace("/full/", `/w${w}/`);

/** `mounted` is false away from the open spread: a blank sheet stands in so the ~6 MB of scans load as you reach them. */
function Page({ page, title, side, mounted }: { page: number; title?: string; side: "left" | "right"; mounted: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--surface-light)]">
      {mounted && (
        <img
          src={pageSrc(page, 1200)}
          srcSet={`${pageSrc(page, 600)} 600w, ${pageSrc(page, 1200)} 1200w, ${fullPortfolioPages[page]} 2000w`}
          sizes={`${PW}px`}
          alt={`Portfolio page ${page + 1}${title ? `: ${title}` : ""}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          draggable={false}
        />
      )}
      {/* gutter shadow toward the spine */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{
          width: 40 * K,
          [side === "left" ? "right" : "left"]: 0,
          background: `linear-gradient(${side === "left" ? "270deg" : "90deg"},rgba(0,0,0,0.18),transparent)`,
        }}
      />
    </div>
  );
}

/** The last right-hand page: a finished end paper with the way to the full PDF. */
function EndPaper({ active }: { active: boolean }) {
  const tab = active ? 0 : -1;
  return (
    <Zoomed>
    <div className="flex h-full w-full flex-col justify-between bg-[var(--surface-light)] p-8" aria-hidden={!active}>
      <span className="h-1 w-10 rounded-full bg-[var(--accent)]" />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-on-light-secondary)]">End of the book</p>
        <p className="mt-3 text-[1.9rem] font-semibold leading-[1.05] text-[var(--text-on-light)]">
          Seven pages.
          <br />
          One PDF.
        </p>
        <p className="mt-3 text-[14px] leading-[1.5] text-[var(--text-on-light-secondary)]">
          Every project at full resolution, ready to share.
        </p>
        <div className="mt-6">
          <a className={btnPrimaryLight} href={fullPortfolioDocument.href} target="_blank" rel="noopener noreferrer" tabIndex={tab}>
            Open the full PDF
          </a>
        </div>
      </div>
      <p className="text-[12px] text-[var(--text-on-light-secondary)]">Louis Zhang · Polytechnique Montréal</p>
    </div>
    </Zoomed>
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
        {/* the cover's inside board rides with the cover, so it never sweeps out past the book while turning */}
        {index === 0 && (
          <div
            className="absolute rounded-l-[6px]"
            style={{ top: -4 * K, bottom: -4 * K, left: -8 * K, right: 0, background: "var(--mat-graphite)", boxShadow: "0 30px 50px -25px rgba(0,0,0,0.45)" }}
          />
        )}
        <div className="absolute inset-0">
          <Page page={sheet.back} title={titles[sheet.back]} side="left" mounted={near(index + 1, spread)} />
        </div>
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
  // ...and lies flat once open: a tilted page is keystoned and resampled, which is what made it unreadable
  const flatten = useTransform(flip, (f) => -12 * clamp01(f));

  return (
    <div style={{ width: PW * 2, height: PH, perspective: 2200 * K }} className="relative">
      <motion.div
        className="absolute inset-0"
        style={{ x, rotateX: tilt, transformStyle: "preserve-3d", transformOrigin: "50% 60%" }}
      >
        <motion.div className="absolute inset-0" style={{ rotateX: flatten, transformStyle: "preserve-3d", transformOrigin: "50% 60%" }}>
        {/* back board + page block on the right */}
        <div
          className="absolute left-1/2 top-0 rounded-r-[6px]"
          style={{
            width: PW + 8 * K,
            height: PH + 8 * K,
            marginTop: -4 * K,
            background: "var(--mat-graphite)",
            transform: `translateZ(${-6 * K}px)`,
            boxShadow: "0 40px 60px -25px rgba(0,0,0,0.55)",
          }}
        />
        {[3, 2, 1].map((k) => (
          <div
            key={k}
            className="absolute left-1/2 top-0 bg-[var(--surface-light)]"
            style={{ width: PW - 2 + k * K, height: PH, transform: `translateZ(${-k * K}px)`, borderRight: "1px solid var(--border-light)" }}
          />
        ))}
        <div className="absolute left-1/2 top-0" style={{ width: PW, height: PH, transform: "translateZ(-0.5px)" }}>
          <EndPaper active={spread >= SPREADS} />
        </div>
        {SHEETS.map((_, i) => (
          <Sheet key={i} index={i} flip={flip} spread={spread} titles={titles} />
        ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
