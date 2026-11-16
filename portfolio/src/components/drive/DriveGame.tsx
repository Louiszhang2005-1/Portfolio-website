"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Stop, WorldData } from "./driveData";
import DriveList from "./DriveList";
import { driveStore, input } from "./driveStore";
import Minimap from "./Minimap";
import TouchStick from "./TouchStick";

/* the 3D chunk (three + R3F + the world) only loads when the visitor actually drives */
const DriveScene = dynamic(() => import("./DriveScene"), { ssr: false, loading: () => null });

type Caps = "unknown" | "drive" | "reduced" | "nogl";

let glSupport: boolean | null = null;
function hasWebGL() {
  if (glSupport === null) {
    try {
      const c = document.createElement("canvas");
      glSupport = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      glSupport = false;
    }
  }
  return glSupport;
}
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeCaps = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getCaps = (): Caps => (!hasWebGL() ? "nogl" : window.matchMedia(REDUCED).matches ? "reduced" : "drive");
const getServerCaps = (): Caps => "unknown";

const KEYS: Record<string, "up" | "down" | "left" | "right" | "boost" | "drift"> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  Space: "drift",
};

function useKeyboard(active: boolean, onEnter: () => void) {
  useEffect(() => {
    if (!active) return;
    const held = new Set<string>();
    const apply = () => {
      input.throttle = (held.has("up") ? 1 : 0) - (held.has("down") ? 1 : 0);
      input.steer = (held.has("left") ? 1 : 0) - (held.has("right") ? 1 : 0);
      input.boost = held.has("boost");
      input.handbrake = held.has("drift");
    };
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = KEYS[e.code];
      if (k) {
        e.preventDefault();
        held.add(k);
        apply();
      } else if (e.code === "KeyR" && !e.repeat) {
        input.reset = true;
      } else if (e.code === "Enter" && !e.repeat && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) {
        onEnter();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYS[e.code];
      if (!k) return;
      held.delete(k);
      apply();
    };
    const clear = () => {
      held.clear();
      apply();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      clear();
    };
  }, [active, onEnter]);
}

const panel = "rounded-[6px] border border-[#1d2321]/12 bg-[#fbfaf6]/92 shadow-[0_1px_2px_rgba(29,35,33,0.06),0_8px_24px_-12px_rgba(29,35,33,0.25)] backdrop-blur-md";

function StopCard({ stop, visible }: { stop: Stop; visible: boolean }) {
  return (
    <div
      className={`pointer-events-auto mx-auto w-full max-w-[440px] transition-all duration-200 ease-out ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      aria-live="polite"
    >
      <div className={`${panel} grid grid-cols-[3px_1fr] overflow-hidden`}>
        <span style={{ background: stop.accent }} aria-hidden />
        <div className="px-4 py-3.5">
          <p className="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b625e]">{stop.kicker}</p>
          <p className="mt-0.5 font-label text-xl font-bold leading-tight text-[#1d2321]">{stop.title}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#5b625e]">{stop.line}</p>
          {stop.href ? (
            <Link
              href={stop.href}
              tabIndex={visible ? 0 : -1}
              className="mt-3 inline-flex items-center gap-2 rounded-[4px] bg-[#1d2321] px-3 py-2 font-label text-sm font-semibold text-[#fbfaf6] hover:bg-black"
            >
              Open case study
              <kbd className="hidden rounded-[3px] border border-white/25 px-1 font-sans text-[10px] font-medium text-white/70 pointer-fine:inline">Enter</kbd>
            </Link>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {stop.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  tabIndex={visible ? 0 : -1}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  className="rounded-[4px] border border-[#1d2321]/20 bg-white px-3 py-1.5 font-label text-sm font-semibold text-[#1d2321] hover:border-[#1d2321]/50"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DriveGame({ world }: { world: WorldData }) {
  const caps = useSyncExternalStore(subscribeCaps, getCaps, getServerCaps);
  const [choice, setChoice] = useState<"drive" | "list" | null>(null);
  const [lost, setLost] = useState(false);
  const [doneDismissed, setDoneDismissed] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const nearbyId = useSyncExternalStore(driveStore.subscribe, driveStore.getNearby, () => null);
  const visited = useSyncExternalStore(driveStore.subscribe, driveStore.getVisited, driveStore.getVisited);
  const moved = useSyncExternalStore(driveStore.subscribe, driveStore.getMoved, () => false);
  const nearby = world.stops.find((s) => s.id === nearbyId) ?? null;
  // keep the last card mounted while it fades out
  const [shown, setShown] = useState<Stop | null>(null);
  if (nearby && nearby !== shown) setShown(nearby);

  const mode = lost || caps === "nogl" ? "list" : (choice ?? (caps === "unknown" ? "pending" : caps === "drive" ? "drive" : "list"));

  const openNearby = useCallback(() => {
    const id = driveStore.getNearby();
    const stop = world.stops.find((s) => s.id === id);
    if (stop?.href) router.push(stop.href);
  }, [world, router]);
  useKeyboard(mode === "drive", openNearby);

  useEffect(() => {
    if (mode !== "drive") return;
    // warm the case-study routes the visitor is driving towards
    for (const s of world.stops) if (s.href) router.prefetch(s.href);
  }, [mode, world, router]);

  if (mode === "list") {
    return <DriveList world={world} onDrive={caps === "reduced" && !lost ? () => setChoice("drive") : undefined} />;
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#e7ecdf] text-[#1d2321] select-none">
      <h1 className="sr-only">Louis Zhang: drive around the portfolio</h1>
      {mode === "drive" && (
        <DriveScene world={world} onReady={() => setReady(true)} onLost={() => setLost(true)} />
      )}
      {mode === "drive" && <TouchStick />}

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-5 sm:pt-4">
        <div className={`${panel} pointer-events-auto flex items-center gap-3 px-3 py-2`}>
          <Link href="/" className="font-label text-sm font-semibold text-[#1d2321]/70 hover:text-[#1d2321]">
            ← Portfolio
          </Link>
          <span className="h-4 w-px bg-[#1d2321]/15" aria-hidden />
          <span className="font-label text-sm font-bold">Louis Zhang</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`${panel} pointer-events-auto p-1.5`}>
            <div className="hidden sm:block">
              <Minimap world={world} size={132} />
            </div>
            <div className="sm:hidden">
              <Minimap world={world} size={96} />
            </div>
            <div className="flex items-center justify-between gap-2 px-1 pb-0.5 pt-1.5">
              <span
                key={visited.size}
                className={`font-label text-[11px] font-semibold tabular-nums ${visited.size > 0 ? "inline-block animate-[drive-pop_700ms_ease-out] text-[#1d2321]" : "text-[#5b625e]"}`}
              >
                {visited.size}/{world.stops.length} found
              </span>
              <button
                type="button"
                onClick={() => setChoice("list")}
                className="font-label text-[11px] font-semibold text-[#1d2321] underline decoration-[#1d2321]/30 underline-offset-2 hover:decoration-[#1d2321]"
              >
                List view
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* everything found: a small thank-you with the way to reach out */}
      {visited.size === world.stops.length && !doneDismissed && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] z-20 flex justify-center px-4 sm:top-5">
          <div className={`${panel} pointer-events-auto flex max-w-[420px] items-start gap-3 px-4 py-3`} role="status">
            <div className="min-w-0">
              <p className="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9971c]">All {world.stops.length} found</p>
              <p className="mt-0.5 text-sm leading-snug text-[#1d2321]">
                Thanks for driving by. The mailbox in the south-west has my email, LinkedIn and GitHub.
              </p>
            </div>
            <button type="button" onClick={() => setDoneDismissed(true)} className="-mr-1 px-1 text-sm text-[#5b625e] hover:text-[#1d2321]" aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* proximity card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-6">
        {shown && <StopCard stop={shown} visible={Boolean(nearby)} />}
      </div>

      {/* controls hint */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 z-20 hidden px-5 pb-6 transition-opacity duration-700 pointer-fine:block ${nearby ? "opacity-0" : moved ? "opacity-60" : "opacity-100"}`}
      >
        <p className={`${panel} px-3 py-2 font-label text-xs text-[#5b625e]`}>
          <b className="text-[#1d2321]">WASD</b> or <b className="text-[#1d2321]">arrows</b> to drive · <b className="text-[#1d2321]">Shift</b> boost ·{" "}
          <b className="text-[#1d2321]">Space</b> drift · <b className="text-[#1d2321]">R</b> reset
        </p>
      </div>
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] transition-opacity duration-500 pointer-coarse:flex ${moved || nearby ? "opacity-0" : "opacity-100"}`}
      >
        <p className={`${panel} px-3 py-2 font-label text-xs font-semibold text-[#1d2321]`}>Drag anywhere to drive</p>
      </div>

      {/* light loading state: no assets to wait for, only the 3D chunk and a first frame */}
      <div
        className={`absolute inset-0 z-30 grid place-items-center bg-[#e7ecdf] transition-opacity duration-500 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-hidden={ready}
      >
        <div className="w-48 text-center">
          <p className="font-label text-lg font-bold">Louis Zhang</p>
          <p className="mt-1 text-xs text-[#5b625e]">Warming up the engine</p>
          <div className="mt-4 h-px w-full overflow-hidden bg-[#1d2321]/15">
            <div className="h-full w-1/3 animate-[drive-load_1.1s_ease-in-out_infinite] bg-[#1d2321]" />
          </div>
        </div>
      </div>
      <style>{`@keyframes drive-load{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}@keyframes drive-pop{0%{transform:scale(1)}30%{transform:scale(1.35);color:#c9971c}100%{transform:scale(1)}}`}</style>
    </main>
  );
}
