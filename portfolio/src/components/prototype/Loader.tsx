"use client";

import { useEffect, useState } from "react";

/* Same signal DeviceSkeleton listens to: ThreeRoot fires it once the canvas has drawn a frame. */
const READY = "proto:three-ready";
type ReadyWindow = Window & { __protoThreeReady?: boolean };

const STATUS = [
  "Machining the case",
  "Routing the board",
  "Seating the cell",
  "Calibrating the sensors",
  "Bonding the display",
  "Torquing screws to spec",
  "Running final QA",
];

/** Bottom to top, like the watch teardown on the page. */
const LAYERS = ["Band", "Sensors", "Cell", "Board", "Case", "Display", "Glass"];

/* layers drop in one by one, then the finished stack breathes apart and back like the teardown on the page */
const LOADER_CSS = `
@keyframes proto-layer-in { from { opacity: 0; transform: translate(-50%, -40px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes proto-breathe { from { transform: translate(-50%, 0); } to { transform: translate(-50%, calc(var(--i) * -6px)); } }
.proto-loader .proto-layer { opacity: 0; animation: proto-layer-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both, proto-breathe 1.6s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) { .proto-loader .proto-layer { animation: none; opacity: 1; transform: translate(-50%, 0); } }
`;

const MIN_MS = 900; // no flash on a warm cache
const IDLE_MS = 4500; // loaded but no device on screen (deep link): don't wait for a 3D frame
const MAX_MS = 9000; // never hold anyone hostage

/**
 * First-load screen: a watch assembling layer by layer while three.js downloads and compiles. Server-rendered,
 * so it is on screen before any JS runs; lifts on the first 3D frame, or right away for the static layouts.
 */
export default function Loader({ static: isStatic }: { static: boolean }) {
  const [progress, setProgress] = useState(0.06);
  const [status, setStatus] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    if (phase !== "loading") return;
    let ready = false;
    let loaded = document.readyState === "complete";
    let fonts = false;
    document.fonts?.ready.then(() => (fonts = true));
    const onReady = () => (ready = true);
    const onLoad = () => (loaded = true);
    window.addEventListener(READY, onReady);
    window.addEventListener("load", onLoad);
    if ((window as ReadyWindow).__protoThreeReady) ready = true;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const tick = window.setInterval(() => {
      // time since navigation start, so a slow JS download can't stretch the caps
      const t = performance.now();
      // real milestones set the floor; time eases toward 90% between them so the bar never stalls
      const floor = (fonts ? 0.2 : 0) + (loaded ? 0.3 : 0) + (ready ? 0.5 : 0);
      const eased = 0.9 * (1 - Math.exp(-t / 2600));
      setProgress((p) => Math.max(p, Math.min(1, Math.max(floor, eased))));
      setStatus(Math.min(STATUS.length - 1, Math.floor(t / 700)));
      const done = ready || isStatic || (loaded && t > IDLE_MS) || t > MAX_MS;
      if (done && t > MIN_MS) {
        setProgress(1);
        setPhase("leaving");
      }
    }, 120);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener(READY, onReady);
      window.removeEventListener("load", onLoad);
      html.style.overflow = prevOverflow;
    };
  }, [phase, isStatic]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = window.setTimeout(() => setPhase("gone"), 650);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Louis Zhang's portfolio"
      className="proto-loader fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[var(--bg)] px-6 transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={phase === "leaving" ? { opacity: 0, transform: "translateY(-2%)", pointerEvents: "none" } : undefined}
    >
      {/* pure CSS so the watch assembles from the very first paint, before any JS has loaded */}
      <style>{LOADER_CSS}</style>
      <div className="relative h-[230px] w-[220px]" aria-hidden>
        {LAYERS.map((name, i) => {
          return (
            <div
              key={name}
              className="proto-layer absolute left-1/2 flex items-center"
              style={{
                bottom: 22 + i * 24,
                zIndex: i,
                ["--i" as string]: i,
                animationDelay: `${0.15 + i * 0.3}s, ${0.15 + LAYERS.length * 0.3 + 0.4}s`,
              }}
            >
              {/* an isometric plate per layer; the top plate carries the display */}
              <svg width="132" height="46" viewBox="0 0 132 46" className="overflow-visible">
                <path
                  d="M66 2 L128 20 L66 38 L4 20 Z"
                  fill={i === LAYERS.length - 2 ? "#141518" : "#ffffff"}
                  stroke={i === LAYERS.length - 1 ? "rgba(212,132,47,0.9)" : "#1d1d1f"}
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  fillOpacity={i === LAYERS.length - 1 ? 0.35 : 1}
                />
                <path d="M4 20 L4 26 L66 44 L128 26 L128 20" fill="none" stroke="#1d1d1f" strokeWidth="1.25" strokeLinejoin="round" opacity="0.55" />
              </svg>
              <span className="ml-3 w-16 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{name}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[15px] font-semibold tracking-tight text-[var(--text)]" style={{ fontStretch: "118%" }}>
        Louis Zhang
      </p>
      <p className="mt-1 h-5 font-mono text-[12px] text-[var(--text-tertiary)]">
        {STATUS[status]}…
      </p>

      <div className="mt-6 h-[3px] w-[min(240px,60vw)] overflow-hidden rounded-full bg-[var(--surface-alt)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[11px] tabular-nums text-[var(--text-tertiary)]">{Math.round(progress * 100)}%</p>

      {/* without JS nothing would ever lift the screen */}
      <noscript>
        <style>{".proto-loader{display:none!important}"}</style>
      </noscript>
      <button
        onClick={() => setPhase("leaving")}
        className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] min-h-[44px] px-4 text-[13px] text-[var(--text-tertiary)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline"
      >
        Skip
      </button>
    </div>
  );
}
