"use client";

import { useEffect, useRef, useState } from "react";

type Chapter = { id: string; label: string };
type Stop = { y: number; chapter: string; index: number; count: number };

/**
 * Every place worth stopping, as page offsets: the top of each chapter, plus each rest a pinned chapter publishes in
 * `data-stops` (fractions of its scroll track: where the animation holds still). Read from the DOM on demand, so it
 * follows resizes, the svh toolbar and the projects filter without any bookkeeping.
 */
function readStops(chapters: Chapter[]): Stop[] {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const all: Stop[] = [];
  for (const c of chapters) {
    const el = document.getElementById(c.id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const track = Math.max(0, el.offsetHeight - window.innerHeight);
    const at = el.dataset.stops ? el.dataset.stops.split(",").map(Number) : [0];
    // drop near-duplicates (a chapter's first rest can sit right at its top, the footer's top past the page end)
    const ys = at.map((f) => Math.min(max, Math.round(top + f * track))).filter((y, i, a) => i === 0 || y - a[i - 1] > 24);
    ys.forEach((y, index) => all.push({ y, chapter: c.label, index, count: ys.length }));
  }
  return all.sort((a, b) => a.y - b.y).filter((s, i, a) => i === 0 || s.y - a[i - 1].y > 24);
}

const NEAR = 12;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Step arrows in the top bar, for anyone who would rather click than scroll: each press glides to the next (or
 * previous) stop, so the watch teardown, every book spread, skill, role and project can be read at rest. They live in
 * the bar (which already names the chapter and shows progress) rather than floating over the page. Native scrolling
 * is untouched, and any wheel, touch or key from the visitor takes over from a glide at once.
 */
export default function StepNav({ chapters, color, className = "" }: { chapters: Chapter[]; color: string; className?: string }) {
  const [here, setHere] = useState<{ at: number; total: number; stop?: Stop }>({ at: 0, total: 0 });
  const [used, setUsed] = useState(false);
  const glide = useRef<{ to: number; raf: number } | null>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const all = readStops(chapters);
      const y = glide.current ? glide.current.to : window.scrollY;
      let at = 0;
      all.forEach((s, i) => s.y <= y + NEAR && (at = i));
      setHere((h) => (h.at === at && h.total === all.length && h.stop?.chapter === all[at]?.chapter ? h : { at, total: all.length, stop: all[at] }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // the visitor's own input always wins over a glide
    const cancel = () => {
      if (!glide.current) return;
      cancelAnimationFrame(glide.current.raf);
      glide.current = null;
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      cancelAnimationFrame(frame);
      cancel();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [chapters]);

  /** A glide of a steady length (longer for far jumps, capped), the same on every browser. */
  const glideTo = (to: number) => {
    if (glide.current) cancelAnimationFrame(glide.current.raf);
    const from = window.scrollY;
    const ms = Math.min(1100, 520 + Math.abs(to - from) * 0.12);
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      window.scrollTo({ top: from + (to - from) * ease(t), behavior: "instant" });
      if (t < 1 && glide.current) glide.current.raf = requestAnimationFrame(step);
      else glide.current = null;
    };
    glide.current = { to, raf: requestAnimationFrame(step) };
  };

  const go = (dir: 1 | -1) => {
    setUsed(true);
    const all = readStops(chapters);
    // a second press mid-glide steps on from where the glide is heading, not from where it is
    const from = glide.current ? glide.current.to : window.scrollY;
    const next = dir > 0 ? all.find((s) => s.y > from + NEAR) : [...all].reverse().find((s) => s.y < from - NEAR);
    if (!next) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo({ top: next.y, behavior: "instant" });
    else glideTo(next.y);
  };

  const first = here.at <= 0;
  const last = here.total > 0 && here.at >= here.total - 1;
  const s = here.stop;
  const where = s ? `${s.chapter}${s.count > 1 ? `, ${s.index + 1} of ${s.count}` : ""}` : "";
  const btn =
    "flex h-10 w-9 items-center justify-center rounded-[8px] transition-[color,background-color,opacity,transform] duration-200 hover:bg-black/[0.05] hover:!text-[var(--accent-on-light)] active:scale-90 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div role="group" aria-label={`Step through the page${where ? `, now at ${where}` : ""}`} className={`flex items-center ${className}`} style={{ color }}>
      <button type="button" onClick={() => go(-1)} disabled={first} aria-label="Previous stop" title="Previous stop" className={btn}>
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14">
          <path d="M7 12V2.5M3 6.5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        disabled={last}
        aria-label="Next stop"
        title={s ? `Next stop (now: ${where})` : "Next stop"}
        // until the first press, a slow nudge says this is the way to go
        className={`${btn} ${used ? "" : "step-nudge"}`}
      >
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14">
          <path d="M7 2v9.5M3 7.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
