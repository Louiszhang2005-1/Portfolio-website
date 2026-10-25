"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SprocketAvatar from "./SprocketAvatar";
import {
  Line, Phase, PHASES, PHASE_LABELS, PHASE_LINES, INTERNSHIP_TIMELINE, PLAY_SIGNALS, COMMAND_CARDS, RADAR_BLIPS,
} from "./briefingContent";
import { hasSeenBriefing, markBriefingSeen, prefersReducedMotion } from "@/systems/gameStorage";

const CHAR_DELAY = 15;
const PUNCT_PAUSE = 95;

interface MissionBriefingProps {
  /** Close the briefing and open the project list / treasure map */
  onOpenProjects: () => void;
  /** Close the briefing and open the contact quick brief */
  onOpenContact: () => void;
}

function useTypewriter(lines: Line[], active: boolean, instant: boolean, onComplete: () => void) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const skipToEnd = useCallback(() => {
    clear();
    setLineIdx(Math.max(0, lines.length - 1));
    setCharIdx(lines[lines.length - 1]?.text.length ?? 0);
    setAllDone(true);
    onComplete();
  }, [lines, onComplete]);

  useEffect(() => {
    if (!active || allDone) return;
    if (instant) {
      timerRef.current = setTimeout(skipToEnd, 0);
      return clear;
    }
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

/**
 * First-visit onboarding. Shown once per browser (remembered in localStorage),
 * skippable with ESC / "Skip intro", and re-openable from nowhere else on
 * purpose: the quick brief + map cover everything it says.
 */
export default function MissionBriefing({ onOpenProjects, onOpenContact }: MissionBriefingProps) {
  // Start closed (nothing in the SSR HTML) so returning visitors never see a
  // flash of the briefing; first-time visitors get it right after hydration.
  const [phase, setPhase] = useState<Phase>("closed");
  const [phaseReady, setPhaseReady] = useState(false);
  const [instant, setInstant] = useState(false);
  const phaseIdx = PHASES.indexOf(phase);
  const currentLines = PHASE_LINES[phase] ?? [];

  // Returning visitors (or ?skipBriefing) go straight to the game.
  useEffect(() => {
    const forceSkip = new URLSearchParams(window.location.search).has("skipBriefing");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!forceSkip && !hasSeenBriefing()) setPhase("booting");
    setInstant(prefersReducedMotion());
  }, []);

  const handlePhaseComplete = useCallback(() => setPhaseReady(true), []);
  const { visibleLines, allDone, skipToEnd, reset } = useTypewriter(
    currentLines,
    phase !== "booting" && phase !== "outro" && phase !== "closed",
    instant,
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

  const dismiss = useCallback(() => {
    markBriefingSeen();
    setPhase("closed");
  }, []);

  const advance = useCallback(() => {
    if (phase === "booting" || phase === "outro" || phase === "closed") return;
    if (!allDone && currentLines.length > 0) {
      skipToEnd();
      return;
    }

    const next = PHASES[phaseIdx + 1];
    if (next === "outro" || next === "closed") {
      markBriefingSeen();
      setPhase("outro");
      setTimeout(() => setPhase("closed"), 650);
      return;
    }

    if (next) {
      setPhase(next);
      reset();
      setPhaseReady(false);
    }
  }, [allDone, currentLines.length, phase, phaseIdx, reset, skipToEnd]);

  // Auto-advance between scans, but never auto-launch past the final screen.
  useEffect(() => {
    if (!phaseReady || phase === "booting" || phase === "outro" || phase === "closed" || phase === "part3") return;
    const t = setTimeout(() => advance(), instant ? 2600 : 1400);
    return () => clearTimeout(t);
  }, [advance, phase, phaseReady, instant]);

  // Capture phase + stopPropagation so ENTER / M / WASD don't also drive the
  // game underneath while the briefing is open.
  useEffect(() => {
    if (phase === "closed") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        dismiss();
        return;
      }
      const target = e.target as HTMLElement | null;
      if ((e.key === "Enter" || e.key === " ") && !(target && target.closest("button, a"))) {
        e.preventDefault();
        advance();
      }
      e.stopPropagation();
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
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

  const exitTo = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    dismiss();
    fn();
  };

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
            className="fixed inset-0 z-[201] flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: isOutro ? 0 : 1, scale: isOutro ? 0.95 : 1, y: 0, filter: isOutro ? "blur(2px)" : "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={advance}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Portfolio game briefing"
              className="launch-panel launch-panel--alive relative w-full max-w-[1040px] overflow-hidden rounded-lg border border-cyan-200/25 bg-slate-950/90 shadow-[0_0_90px_rgba(34,211,238,0.2)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(125,252,255,0.07),transparent_44%,rgba(251,191,36,0.05),transparent_70%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-40 game-scanline" />

              <div className="relative flex items-center gap-3 border-b border-cyan-200/15 bg-cyan-300/5 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
                <span className="font-label text-[10px] font-black uppercase tracking-[0.32em] text-cyan-100/85">
                  {label}
                </span>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-label text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/75 sm:flex">
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
                    className="ml-3 rounded-md border border-white/20 bg-white/[0.08] px-3 py-1.5 font-label text-[10px] font-black uppercase tracking-[0.16em] text-white/90 transition-colors hover:bg-cyan-200/15 hover:text-white"
                  >
                    Skip Intro
                  </button>
                </div>
              </div>

              <div className="relative grid max-h-[calc(100svh-5rem)] gap-5 overflow-y-auto p-4 lg:grid-cols-[300px_minmax(0,1fr)_230px] md:p-6">
                <div className="relative hidden overflow-hidden rounded-md border border-cyan-200/16 bg-cyan-200/[0.045] p-4 sm:block">
                  <div className="absolute left-1/2 top-8 h-44 w-44 -translate-x-1/2 rounded-full border border-cyan-100/12 launch-radar" />
                  <div className="relative flex flex-col items-center">
                    <SprocketAvatar size={146} />
                    <h1 className="mt-4 text-center font-headline text-3xl font-black tracking-normal text-white">
                      Louis Zhang
                    </h1>
                    <p className="mt-2 text-center font-label text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/75">
                      Mechanical Engineering Portfolio
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {PLAY_SIGNALS.map((signal) => (
                      <div key={signal.label} className="rounded-md border border-white/10 bg-slate-950/55 p-2">
                        <div className="truncate font-label text-[8px] font-black uppercase tracking-[0.12em] text-cyan-100/70">{signal.label}</div>
                        <div className="mt-1 font-headline text-lg font-black leading-none" style={{ color: signal.color }}>{signal.value}</div>
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
                          <p className="truncate font-label text-[11px] font-black text-white">{item.title}</p>
                          <p className="truncate font-label text-[9px] font-bold uppercase tracking-wider text-cyan-100/75">{item.role}</p>
                          <p className="truncate font-label text-[9px] font-bold uppercase tracking-wider text-emerald-100/70">{item.when}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex min-w-0 flex-col sm:min-h-[420px]">
                  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="font-label text-[10px] font-black uppercase tracking-[0.32em] text-emerald-200/85">
                        Isle Commander
                      </p>
                      <h2 className="mt-1 font-headline text-2xl font-black text-white md:text-4xl">
                        A playable map of what I build.
                      </h2>
                    </div>
                    <div className="hidden min-w-[160px] rounded-md border border-white/10 bg-white/[0.04] p-3 sm:block">
                      <div className="mb-2 flex items-center justify-between font-label text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/70">
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

                  <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-md border border-white/10 bg-black/28 p-4 font-mono text-[12px] leading-7 text-cyan-50/90 sm:min-h-[256px]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent blueprint-scan" />
                    <div className="relative h-full overflow-y-auto pr-1">
                      {phase === "booting" && (
                        <p className="text-cyan-100/80" style={{ animation: "holoFlicker 0.8s steps(1) infinite" }}>
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
                    {phase === "part3" && allDone ? "Start sailing" : allDone ? "Continue" : "Complete Scan"}
                    <kbd className="rounded border border-slate-900/20 bg-slate-950/15 px-2 py-1 text-[9px]">ENTER</kbd>
                  </motion.button>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={exitTo(onOpenProjects)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-100/30 bg-cyan-300/10 px-3 font-label text-[11px] font-black uppercase tracking-[0.12em] text-cyan-50 hover:bg-cyan-300/20"
                    >
                      <span className="material-symbols-outlined icon-lock text-[18px]">list</span>
                      Project list
                    </button>
                    <button
                      onClick={exitTo(onOpenContact)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-100/30 bg-emerald-300/10 px-3 font-label text-[11px] font-black uppercase tracking-[0.12em] text-emerald-50 hover:bg-emerald-300/20"
                    >
                      <span className="material-symbols-outlined icon-lock text-[18px]">mail</span>
                      Contact
                    </button>
                  </div>
                  <p className="mt-2 text-center font-label text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                    In a hurry? Skip straight to the project list · ESC skips intro
                  </p>
                </div>

                <div className="hidden min-w-0 gap-3 lg:grid lg:content-start">
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="font-label text-[9px] font-black uppercase tracking-[0.2em] text-cyan-100/70">
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
                          <kbd className="shrink-0 rounded border border-white/10 bg-white/[0.05] px-2 py-1 font-label text-[9px] font-black text-amber-100/90">
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
                    <div className="absolute inset-x-0 bottom-3 text-center font-label text-[9px] font-black uppercase tracking-[0.2em] text-lime-200/70">
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
