"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useMap } from "./devices";

/** `note` is a small factual line under the copy (no eyebrows above headings: DESIGN.md §3). */
export type Beat = {
  start: number;
  end: number;
  title: string;
  body: string;
  tools?: string[];
  note?: string;
  status?: string;
  actions?: ReactNode;
  pad?: number;
};

/**
 * Each fade fills exactly half the gap to its neighbours: the outgoing beat reaches 0 at the gap's midpoint, where
 * the incoming one starts, so two headings never show at once and the blank moment is a single point. Timelines keep
 * their gaps short (≤ 0.04 of the track) so a copy block is readable on almost every frame.
 */
export const withPads = (timeline: Beat[]): Beat[] =>
  timeline.map((b, i) => {
    const before = i > 0 ? b.start - timeline[i - 1].end : Infinity;
    const after = i < timeline.length - 1 ? timeline[i + 1].start - b.end : Infinity;
    return { ...b, pad: Math.min(0.04, before / 2, after / 2) };
  });

/** The page's one orchestrated load moment: the name rises word by word. */
export function HeroName({ text }: { text: string }) {
  return (
    <h1 className="text-[clamp(2.75rem,7.5vw,7.5rem)] text-[var(--text)]">
      {text.split(" ").map((w, i) => (
        <span key={w} className="word-mask mr-[0.22em]">
          <span style={{ animationDelay: `${150 + i * 90}ms` }}>{w}</span>
        </span>
      ))}
    </h1>
  );
}

/**
 * True while `value` sits below `threshold`. State flips only on crossings, so a scroll-driven opacity can drive
 * `inert` / `aria-hidden` without re-rendering every frame.
 */
export function useHiddenBelow(value: MotionValue<number>, threshold = 0.05) {
  const [hidden, setHidden] = useState(() => value.get() < threshold);
  useMotionValueEvent(value, "change", (v) => setHidden(v < threshold));
  return hidden;
}

/** Availability line for recruiters: a live-status dot, not a button. */
export const AVAILABILITY = "Open to 2027 internship opportunities";
export function OpenTo({ text = AVAILABILITY, className = "" }: { text?: string; className?: string }) {
  return (
    <p className={`inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[13px] font-medium text-[var(--text)] ${className}`}>
      <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-[var(--success)] shadow-[0_0_0_3px_rgba(48,209,88,0.18)]" />
      {text}
    </p>
  );
}

export function BeatCopy({ progress, beat, hero }: { progress: MotionValue<number>; beat: Beat; hero?: boolean }) {
  const pad = beat.pad ?? 0.03;
  const range = [Math.max(0, beat.start - pad), beat.start, beat.end, Math.min(1, beat.end + pad)];
  const first = beat.start === 0;
  const last = beat.end === 1;
  const opacity = useMap(progress, range, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useMap(progress, range, [first ? 0 : 24, 0, 0, last ? 0 : -24]);
  // faded-out beats still sit in the DOM: keep them out of the tab order and the accessibility tree
  const hidden = useHiddenBelow(opacity);
  return (
    <motion.div
      style={{ opacity, y }}
      aria-hidden={hidden || undefined}
      inert={hidden}
      className="absolute inset-0 flex flex-col justify-center"
    >
      {hero ? (
        <HeroName text={beat.title} />
      ) : (
        <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] text-[var(--text)]">{beat.title}</h2>
      )}
      <p className="mt-3 max-w-[34rem] text-base leading-[1.55] sm:mt-5 text-[var(--text-secondary)] sm:text-lg 2xl:max-w-[40rem] 2xl:text-xl">{beat.body}</p>
      {beat.tools && (
        <div className="mt-4 flex max-w-md flex-wrap gap-1.5 sm:mt-5">
          {beat.tools.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}
      {beat.note && <p className="mt-3 max-w-[34rem] sm:mt-4 text-sm text-[var(--text-tertiary)] 2xl:max-w-[40rem] 2xl:text-base">{beat.note}</p>}
      {beat.status && <OpenTo text={beat.status} className="mt-3 sm:mt-4" />}
      {beat.actions && <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">{beat.actions}</div>}
    </motion.div>
  );
}

/**
 * Scales a fixed-size device to whatever box it is given, at any width and height. Tailwind scale classes only
 * knew the width, so on short or mid-width windows devices ran under the nav and pushed copy off-screen.
 */
export function Fit({ w, h, max = 1, children }: { w: number; h: number; max?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(max, width / w, height / h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, max]);
  return (
    <div ref={ref} className="relative h-full min-h-0 w-full min-w-0">
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

/** Pinned dark stage shared by the watch and phone chapters: key light, copy left, device right. */
export function DeviceStage({
  copy,
  device,
  overlay,
  shadow,
}: {
  copy: ReactNode;
  device: ReactNode;
  overlay?: ReactNode;
  shadow?: MotionValue<number>;
}) {
  return (
    <div className="sticky top-0 h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          // soft studio wash: a warm key from the accent, a cool fill opposite (Stripe/Apple-style, very low contrast)
          background:
            "radial-gradient(55% 60% at 75% 10%,rgba(var(--accent-rgb),0.09),transparent 70%),radial-gradient(45% 55% at 10% 90%,rgba(96,120,160,0.08),transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid h-full max-w-[1480px] grid-rows-[minmax(0,1fr)_auto] items-center gap-2 px-6 pb-5 pt-16 md:px-10 xl:px-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:grid-rows-1 md:gap-8 md:pb-6">
        <div className="relative order-2 h-[390px] md:order-1 md:h-[400px] 2xl:h-[480px]">{copy}</div>
        <div className="relative order-1 flex h-full min-h-0 items-center justify-center md:order-2 md:-mb-6">
          <motion.div
            className="absolute bottom-[12%] h-10 w-72 rounded-[50%] bg-[var(--mat-black)] blur-2xl"
            style={{ opacity: shadow ?? 0.5 }}
          />
          {device}
        </div>
      </div>
      {overlay}
    </div>
  );
}

/**
 * A chapter's scroll progress (0 → 1 across its pinned track), eased through a spring so every scroll-driven
 * animation glides into place instead of stepping with the wheel. Light damping keeps it responsive.
 */
export function useSmoothProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.35, restDelta: 0.0005 });
}

/**
 * True when the browser can create a WebGL context and the device is not very low-end. Flips to false for good once
 * the 3D canvas reports a lost context (`proto:webgl-lost`), so the page drops to the static layouts.
 */
let webgl: boolean | null = null;
let lost = false;
const hasWebGL = () => {
  if (lost) return false;
  if (webgl === null) {
    try {
      // two cores or fewer can't hold the shared canvas at a usable frame rate
      const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 2;
      const c = document.createElement("canvas");
      webgl = !lowEnd && !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
};
const subscribeWebGL = (notify: () => void) => {
  const onLost = () => {
    lost = true;
    notify();
  };
  window.addEventListener("proto:webgl-lost", onLost);
  return () => window.removeEventListener("proto:webgl-lost", onLost);
};
export const useWebGL = () => useSyncExternalStore(subscribeWebGL, hasWebGL, () => true);

/** Buttons (DESIGN.md §4). */
export const btn =
  "inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-[transform,background-color,border-color] duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]";
export const btnPrimaryDark = `${btn} bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--surface-light)]`;
export const btnGhostDark = `${btn} border border-[var(--border)] text-[var(--text)] hover:border-[var(--border-hover)] hover:bg-[var(--surface)]`;
export const btnPrimaryLight = `${btn} bg-[var(--text-on-light)] text-[var(--bg-light)] hover:bg-[var(--mat-graphite)]`;
export const btnGhostLight = `${btn} border border-[var(--border-light)] text-[var(--text-on-light)] hover:border-[var(--border-light-hover)] hover:bg-[var(--surface-light)]`;

export const CONTACT = {
  email: "louzhang15@gmail.com",
  github: "https://github.com/Louiszhang2005-1",
  linkedin: "https://www.linkedin.com/in/louis-zhang-ba2a17284/",
};
