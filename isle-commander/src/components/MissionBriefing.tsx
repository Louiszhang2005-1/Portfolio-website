"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SprocketAvatar from "./SprocketAvatar";

type Line = { text: string; color?: string; indent?: boolean; tag?: string; tagColor?: string };
type Phase = "booting" | "part1" | "part2" | "part3" | "outro" | "closed";

const PHASES: Phase[] = ["booting", "part1", "part2", "part3", "outro", "closed"];
const CHAR_DELAY = 15;
const PUNCT_PAUSE = 95;

const PHASE_LABELS: Record<string, string> = {
  booting: "PROFILE LINK",
  part1: "IDENTITY",
  part2: "HIGHLIGHTS",
  part3: "LAUNCH",
};

const PART1_LINES: Line[] = [
  { text: "Identity confirmed: Louis Zhang." },
  { text: "Mechanical engineering student building across hardware, manufacturing, aerospace, robotics, and software." },
  { text: "This portfolio is not a slide deck. It is a playable career map." },
  { text: "The internship route begins with City of Montreal, continues to Lockheed Martin, then reaches my upcoming Tesla Cell Engineering internship." },
  { text: "Pilot the ship, inspect islands, read blueprints, collect points, and dock for upgrades." },
];

const PART2_LINES: Line[] = [
  { text: "Signal highlights loaded:" },
  { text: "> City of Montreal", tag: "Water Testing", tagColor: "#0277bd" },
  { text: "Municipal water testing, lab workflows, environmental monitoring, and data analysis.", color: "rgba(199,232,255,0.76)", indent: true },
  { text: "> Lockheed Martin", tag: "Ship Integration", tagColor: "#1d4ed8" },
  { text: "CAD, structural layouts, FEA validation, and shipboard subsystem integration.", color: "rgba(199,232,255,0.76)", indent: true },
  { text: "> Tesla", tag: "Cell Engineering", tagColor: "#dc2626" },
  { text: "Battery manufacturing, automation, process optimization, and production thinking.", color: "rgba(199,232,255,0.76)", indent: true },
  { text: "> CSA Transport System", tag: "Systems", tagColor: "#b45309" },
  { text: "Lunar transport prototype, project management, controls, thermal and structural validation.", color: "rgba(199,232,255,0.76)", indent: true },
  { text: "> Rapid builds", tag: "Mechatronics", tagColor: "#059669" },
  { text: "Robots, NFC disaster response hardware, AI tools, dashboards, and prototypes.", color: "rgba(199,232,255,0.76)", indent: true },
];

const PART3_LINES: Line[] = [
  { text: "Launch protocol:" },
  { text: "Use Matter.js physics to navigate the islands." },
  { text: "Monitor Hull Stress (FEA) and Boiler Pressure." },
  { text: "Avoid thermal vents. They will cook your hull.", color: "#fb923c" },
  { text: "Collect Perseverance Points to upgrade at Polytechnique Port." },
  { text: "Controls:" },
  { text: "WASD / Arrows - Thrust & Steer", color: "rgba(100,220,220,0.86)", indent: true },
  { text: "iPhone / touch - Use the on-screen helm", color: "rgba(100,220,220,0.86)", indent: true },
  { text: "ENTER - Inspect / Dock", color: "rgba(100,220,220,0.86)", indent: true },
  { text: "M - Treasure map", color: "rgba(100,220,220,0.86)", indent: true },
  { text: "ESC - Close panels", color: "rgba(100,220,220,0.86)", indent: true },
  { text: "Engine armed. Impress mode: online." },
];

const SHORT_LINES: Line[] = [
  { text: "Louis Zhang: mechanical engineering, systems, CAD, FEA, manufacturing, robotics, and software." },
  { text: "Explore the islands to see internships, aerospace builds, hardware projects, and AI tools.", color: "rgba(199,232,255,0.76)" },
  { text: "WASD or touch helm to sail. Inspect / ENTER to inspect. Map / M opens the chart.", color: "rgba(125,252,255,0.82)" },
];

const PHASE_LINES: Record<string, Line[]> = {
  part1: PART1_LINES,
  part2: PART2_LINES,
  part3: PART3_LINES,
};

const INTERNSHIP_TIMELINE = [
  { title: "City of Montreal", role: "Scientific Intern - Water Testing", when: "May-Aug 2025", logo: "/logo/city-of-montreal.gif" },
  { title: "Lockheed Martin", role: "Mechanical Engineering Intern - Ship Integration", when: "Winter 2026", logo: "/logo/lockheed-martin.jpg" },
  { title: "Tesla", role: "Manufacturing Engineering Intern - Cell Engineering", when: "Summer-Fall 2026", logo: "/logo/tesla.jpg" },
];

const PLAY_SIGNALS = [
  { label: "CAD", value: "92", color: "#67e8f9" },
  { label: "FEA", value: "87", color: "#86efac" },
  { label: "Build", value: "95", color: "#fde68a" },
];

const COMMAND_CARDS = [
  { icon: "directions_boat", label: "Sail", hint: "WASD" },
  { icon: "radar", label: "Inspect", hint: "ENTER" },
  { icon: "gamepad", label: "Touch Helm", hint: "MOBILE" },
  { icon: "map", label: "Chart", hint: "M" },
];

const RADAR_BLIPS = [
  { x: 24, y: 31, label: "75" },
  { x: 62, y: 24, label: "65" },
  { x: 72, y: 58, label: "82" },
  { x: 38, y: 71, label: "51" },
  { x: 52, y: 47, label: "68" },
];

function useTypewriter(lines: Line[], active: boolean, onComplete: () => void) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (!active || allDone) return;
    const line = lines[lineIdx];
    if (!line) return;

    if (charIdx < line.text.length) {
      const ch = line.text[charIdx];
      const delay = /[.,!?:]/.test(ch) ? PUNCT_PAUSE : CHAR_DELAY;
      timerRef.current = setTimeout(() => setCharIdx((c) => c + 1), delay);
    } else {
      timerRef.current = setTimeout(() => {
        if (lineIdx + 1 < lines.length) {
          setLineIdx((i) => i + 1);
          setCharIdx(0);
        } else {
          setAllDone(true);
          onComplete();
        }
      }, 260);
    }
    return clear;
  });

  const skipToEnd = useCallback(() => {
    clear();
    setLineIdx(Math.max(0, lines.length - 1));
    setCharIdx(lines[lines.length - 1]?.text.length ?? 0);
    setAllDone(true);
    onComplete();
  }, [lines, onComplete]);

  const reset = useCallback(() => {
    clear();
    setLineIdx(0);
    setCharIdx(0);
    setAllDone(false);
  }, []);

  const visibleLines = lines.slice(0, lineIdx + 1).map((line, i) => ({
    ...line,
    partial: i < lineIdx ? line.text : line.text.slice(0, charIdx),
  }));

  return { visibleLines, allDone, skipToEnd, reset };
}

export default function MissionBriefing() {
  const forceSkip = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).has("skipBriefing")
    : false;

  const [phase, setPhase] = useState<Phase>(forceSkip ? "closed" : "booting");
  const [phaseReady, setPhaseReady] = useState(false);
  const phaseIdx = PHASES.indexOf(phase);
  const currentLines = PHASE_LINES[phase] ?? [];

  const handlePhaseComplete = useCallback(() => setPhaseReady(true), []);
  const { visibleLines, allDone, skipToEnd, reset } = useTypewriter(
    currentLines,
    phase !== "booting" && phase !== "outro" && phase !== "closed",
    handlePhaseComplete,
  );

  useEffect(() => {
    if (phase !== "booting") return;
    const t = setTimeout(() => {
      setPhase("part1");
      reset();
      setPhaseReady(false);
    }, 850);
    return () => clearTimeout(t);
  }, [phase, reset]);

  const advance = useCallback(() => {
    if (phase === "booting" || phase === "outro" || phase === "closed") return;
    if (!allDone && currentLines.length > 0) {
      skipToEnd();
      return;
    }

    const next = PHASES[phaseIdx + 1];
    if (next === "outro" || next === "closed") {
      setPhase("outro");
      setTimeout(() => {
        setPhase("closed");
      }, 650);
      return;
    }

    if (next) {
      setPhase(next);
      reset();
      setPhaseReady(false);
    }
  }, [allDone, currentLines.length, phase, phaseIdx, reset, skipToEnd]);

  const dismiss = useCallback(() => {
    setPhase("closed");
  }, []);

  useEffect(() => {
    if (!phaseReady || phase === "booting" || phase === "outro" || phase === "closed") return;
    const t = setTimeout(() => advance(), phase === "part3" ? 1400 : 1100);
    return () => clearTimeout(t);
  }, [advance, phase, phaseReady]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "closed") return;
      if (e.key === "Escape") dismiss();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, dismiss, phase]);

  const isOpen = phase !== "closed";
  const isOutro = phase === "outro";
  const label = PHASE_LABELS[phase] ?? "";
  const stepDots = (["part1", "part2", "part3"] as Phase[]).map((p) => ({
    p,
    done: phaseIdx > PHASES.indexOf(p),
    active: p === phase,
  }));
  const livePhaseIdx = Math.min(Math.max(phaseIdx, 1), 3);
  const phaseProgress = `${Math.round((livePhaseIdx / 3) * 100)}%`;
  const statusText = phase === "booting" ? "Syncing" : phaseReady ? "Ready" : "Streaming";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mb-bg"
            className="fixed inset-0 z-[200] overflow-hidden bg-[radial-gradient(circle_at_28%_20%,rgba(20,184,166,0.24),transparent_34%),radial-gradient(circle_at_76%_12%,rgba(250,204,21,0.16),transparent_26%),linear-gradient(145deg,rgba(2,6,23,0.96),rgba(7,21,37,0.95)_55%,#020617)] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOutro ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.36 }}
          >
            <div className="absolute inset-0 game-scanline opacity-45" />
            <div className="absolute left-[9%] top-[13%] h-28 w-28 rounded-full border border-cyan-200/18 launch-orbit" />
            <div className="absolute bottom-[11%] right-[14%] h-36 w-36 rounded-full border border-amber-200/20 launch-orbit launch-orbit--slow" />
            <div className="absolute left-1/2 top-1/2 h-[58vh] w-[58vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/8 launch-radar" />
          </motion.div>

          <motion.div
            key="mb-panel"
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: isOutro ? 0 : 1, scale: isOutro ? 0.95 : 1, y: 0, filter: isOutro ? "blur(2px)" : "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={advance}
          >
            <div className="launch-panel launch-panel--alive relative w-full max-w-[1040px] overflow-hidden rounded-lg border border-cyan-200/25 bg-slate-950/90 shadow-[0_0_90px_rgba(34,211,238,0.2)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(125,252,255,0.07),transparent_44%,rgba(251,191,36,0.05),transparent_70%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-40 game-scanline" />

              <div className="relative flex items-center gap-3 border-b border-cyan-200/15 bg-cyan-300/5 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
                <span className="font-label text-[10px] font-black uppercase tracking-[0.32em] text-cyan-100/70">
                  {label}
                </span>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-label text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/58 sm:flex">
                  <span className="material-symbols-outlined icon-lock text-[14px] text-amber-200">bolt</span>
                  {statusText}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  {stepDots.map(({ p, done, active }) => (
                    <span
                      key={p}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: active ? 28 : 8,
                        background: done ? "rgba(125,252,255,0.85)" : active ? "rgba(125,252,255,0.62)" : "rgba(125,252,255,0.18)",
                      }}
                    />
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss();
                    }}
                    className="ml-3 rounded-md border border-white/12 bg-white/[0.06] px-3 py-1 font-label text-[9px] font-black uppercase tracking-[0.16em] text-cyan-50/70 transition-colors hover:bg-cyan-200/12 hover:text-white"
                  >
                    Skip Intro
                  </button>
                </div>
              </div>

              <div className="relative grid max-h-[86vh] gap-5 overflow-y-auto p-4 lg:grid-cols-[300px_minmax(0,1fr)_230px] md:p-6">
                <div className="relative overflow-hidden rounded-md border border-cyan-200/16 bg-cyan-200/[0.045] p-4">
                  <div className="absolute left-1/2 top-8 h-44 w-44 -translate-x-1/2 rounded-full border border-cyan-100/12 launch-radar" />
                  <div className="relative flex flex-col items-center">
                    <SprocketAvatar size={146} />
                    <h1 className="mt-4 text-center font-headline text-3xl font-black tracking-normal text-white">
                      Louis Zhang
                    </h1>
                    <p className="mt-2 text-center font-label text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/58">
                      Mechanical Engineering Portfolio
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {PLAY_SIGNALS.map((signal) => (
                      <div key={signal.label} className="rounded-md border border-white/10 bg-slate-950/55 p-2">
                        <div className="font-label text-[8px] font-black uppercase tracking-[0.18em] text-cyan-100/45">{signal.label}</div>
                        <div className="mt-1 flex items-end gap-1">
                          <span className="font-headline text-lg font-black leading-none" style={{ color: signal.color }}>{signal.value}</span>
                          <span className="pb-0.5 font-label text-[8px] font-bold text-white/35">%</span>
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-white/10">
                          <div className="h-full rounded-full" style={{ width: `${signal.value}%`, background: signal.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {INTERNSHIP_TIMELINE.map((item, index) => (
                      <motion.div
                        key={item.title}
                        className="group flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.045] p-2 transition-colors hover:border-cyan-100/35 hover:bg-cyan-100/[0.08]"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + index * 0.08 }}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-cyan-200/15 font-label text-[10px] font-black text-cyan-100 group-hover:bg-cyan-200/25">
                          {index + 1}
                        </span>
                        <div className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded bg-white p-1">
                          <img src={item.logo} alt={`${item.title} logo`} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-label text-[10px] font-black text-white">{item.title}</p>
                          <p className="truncate font-label text-[8px] font-bold uppercase tracking-wider text-cyan-100/42">{item.role}</p>
                          <p className="truncate font-label text-[8px] font-bold uppercase tracking-wider text-emerald-100/38">{item.when}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-[420px] min-w-0 flex-col">
                  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                    <p className="font-label text-[10px] font-black uppercase tracking-[0.32em] text-emerald-200/70">
                      Isle Commander
                    </p>
                    <h2 className="mt-1 font-headline text-2xl font-black text-white md:text-4xl">
                      A playable map of what I build.
                    </h2>
                    </div>
                    <div className="min-w-[160px] rounded-md border border-white/10 bg-white/[0.04] p-3">
                      <div className="mb-2 flex items-center justify-between font-label text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/50">
                        <span>Scan</span>
                        <span>{phaseProgress}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-200 to-amber-200"
                          animate={{ width: phaseProgress }}
                          transition={{ type: "spring", stiffness: 160, damping: 22 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative min-h-[256px] flex-1 overflow-hidden rounded-md border border-white/10 bg-black/28 p-4 font-mono text-[12px] leading-7 text-cyan-50/88">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent blueprint-scan" />
                    <div className="relative h-full overflow-y-auto pr-1">
                    {phase === "booting" && (
                      <p className="text-cyan-100/70" style={{ animation: "holoFlicker 0.8s steps(1) infinite" }}>
                        INITIALIZING PORTFOLIO INTERFACE...
                      </p>
                    )}
                    {visibleLines.map((line, i) => (
                      <p
                        key={i}
                        className="mb-1"
                        style={{
                          paddingLeft: line.indent ? 16 : 0,
                          color: line.color ?? "#dff9ff",
                        }}
                      >
                        {line.tag && (
                          <span
                            className="mr-2 inline-block rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
                            style={{ background: line.tagColor ?? "#075985" }}
                          >
                            {line.tag}
                          </span>
                        )}
                        {line.partial}
                        {i === visibleLines.length - 1 && !allDone && (
                          <span className="text-cyan-200" style={{ animation: "holoFlicker 0.7s steps(1) infinite" }}>
                            |
                          </span>
                        )}
                      </p>
                    ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      advance();
                    }}
                    className="mt-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-cyan-100/35 bg-gradient-to-r from-cyan-300 via-emerald-200 to-amber-200 px-4 py-3 font-label text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_24px_rgba(125,252,255,0.24)]"
                    whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(125,252,255,0.36)" }}
                    whileTap={{ scale: 0.985 }}
                  >
                    {phase === "part3" && allDone ? "Launch Game" : allDone ? "Continue" : "Complete Scan"}
                    <kbd className="rounded border border-slate-900/20 bg-slate-950/15 px-2 py-1 text-[9px]">ENTER</kbd>
                  </motion.button>
                  <p className="mt-2 text-center font-label text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-100/28">
                    Auto-advances when each scan finishes · ESC skips intro
                  </p>
                </div>

                <div className="grid min-w-0 gap-3 lg:content-start">
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="font-label text-[9px] font-black uppercase tracking-[0.2em] text-cyan-100/45">
                      Command Deck
                    </div>
                    <div className="mt-3 grid gap-2">
                      {COMMAND_CARDS.map((card, index) => (
                        <motion.div
                          key={card.label}
                          className="flex min-h-14 items-center gap-3 rounded-md border border-cyan-100/12 bg-slate-950/55 px-3 py-2"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.16 + index * 0.07 }}
                        >
                          <span className="material-symbols-outlined icon-lock text-[22px] text-cyan-200">{card.icon}</span>
                          <span className="min-w-0 flex-1 truncate font-headline text-sm font-black text-white">{card.label}</span>
                          <kbd className="shrink-0 rounded border border-white/10 bg-white/[0.05] px-2 py-1 font-label text-[9px] font-black text-amber-100/80">
                            {card.hint}
                          </kbd>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="radar-screen relative aspect-square min-h-48 overflow-hidden rounded-md border border-lime-300/18 bg-[#020b07]">
                    <div className="radar-face absolute inset-3 rounded-full" />
                    <div className="radar-bearing radar-bearing--top">000</div>
                    <div className="radar-bearing radar-bearing--right">090</div>
                    <div className="radar-bearing radar-bearing--bottom">180</div>
                    <div className="radar-bearing radar-bearing--left">270</div>
                    {RADAR_BLIPS.map((blip) => (
                      <span
                        key={`${blip.x}-${blip.y}`}
                        className="radar-blip"
                        style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                      >
                        {blip.label}
                      </span>
                    ))}
                    <div className="absolute inset-x-0 bottom-3 text-center font-label text-[9px] font-black uppercase tracking-[0.2em] text-lime-200/58">
                      Live Map Ping
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SprocketCornerButton() {
  const [open, setOpen] = useState(false);
  const [typedIdx, setTypedIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  const close = () => {
    setOpen(false);
    setTypedIdx(0);
    setCharIdx(0);
  };

  useEffect(() => {
    if (!open) return;
    const line = SHORT_LINES[typedIdx];
    if (!line) return;
    if (charIdx < line.text.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 18);
      return () => clearTimeout(t);
    }
    if (typedIdx + 1 < SHORT_LINES.length) {
      const t = setTimeout(() => {
        setTypedIdx((i) => i + 1);
        setCharIdx(0);
      }, 300);
      return () => clearTimeout(t);
    }
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <motion.button
        onClick={() => {
          setOpen(true);
          setTypedIdx(0);
          setCharIdx(0);
        }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+11.5rem)] left-4 z-50 grid h-12 w-12 place-items-center rounded-md border border-cyan-100/35 bg-slate-950/80 shadow-[0_0_24px_rgba(34,211,238,0.28)] backdrop-blur-md md:bottom-4"
        whileHover={{ scale: 1.08, boxShadow: "0 0 34px rgba(34,211,238,0.48)" }}
        whileTap={{ scale: 0.94 }}
        title="Open quick portfolio brief"
      >
        <SprocketAvatar size={38} idle />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sprocket-short"
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+15.5rem)] left-4 z-50 w-[300px] overflow-hidden rounded-[8px] border border-cyan-100/25 bg-slate-950/90 p-4 shadow-[0_0_44px_rgba(34,211,238,0.2)] backdrop-blur-md md:bottom-20"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 440, damping: 24 }}
          >
            <div className="absolute inset-0 pointer-events-none game-scanline opacity-40" />
            <div className="mb-3 flex items-center gap-2">
              <SprocketAvatar size={34} idle />
              <span className="font-label text-[9px] font-black uppercase tracking-[0.26em] text-cyan-100/64">
                Quick Brief
              </span>
              <button
                onClick={close}
                className="ml-auto rounded border border-white/10 px-2 py-0.5 text-xs text-cyan-100/60"
                aria-label="Close quick brief"
              >
                x
              </button>
            </div>
            <div className="font-mono text-[11px] leading-6">
              {SHORT_LINES.slice(0, typedIdx + 1).map((line, i) => (
                <p key={i} className="mb-1" style={{ color: line.color ?? "#dff9ff" }}>
                  {i < typedIdx ? line.text : line.text.slice(0, charIdx)}
                  {i === typedIdx && charIdx < line.text.length && (
                    <span style={{ animation: "holoFlicker 0.7s steps(1) infinite" }}>|</span>
                  )}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
