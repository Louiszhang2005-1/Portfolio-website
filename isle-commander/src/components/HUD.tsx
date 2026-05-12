"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { missions, Mission, WORLD_BOUNDS, MAX_COLLECTIBLE_SCORE } from "@/data/missions";
import { StressState, FEA_ZONE_COUNT, stressToColor } from "@/systems/StressSystem";
import { getSectorRoutes } from "@/lib/routeGeometry";

interface HUDProps {
  visitedCount: number;
  speed: number;
  boilerPressure: number;
  stressState: StressState;
  nearbyIsland: Mission | null;
  gameState: string;
  boatPosition: { x: number; y: number };
  boatHeading: number;
  nearestGravityAngle: number;
  onIslandClick: (mission: Mission) => void;
  onToggleMap: () => void;
  onReturnHome: () => void;
  score: number;
  collectedItems: Set<string>;
  isHullCritical: boolean;
  isBoilerCritical: boolean;
  isDocked: boolean;
}

const SECTORS = [
  { name: "Internship Shores", color: "#e65100", quadrant: "NW", labelX: "13%", labelY: "6%" },
  { name: "Aero Atoll",        color: "#b8860b", quadrant: "NE", labelX: "63%", labelY: "6%" },
  { name: "Robotics & IoT",    color: "#c62828", quadrant: "SW", labelX: "13%", labelY: "56%" },
  { name: "Code Cove",         color: "#6a1b9a", quadrant: "SE", labelX: "63%", labelY: "56%" },
] as const;

const QUADRANT_BG: Record<string, string> = {
  NW: "linear-gradient(135deg, rgba(230,81,0,0.22) 0%, transparent 80%)",
  NE: "linear-gradient(225deg, rgba(184,134,11,0.22) 0%, transparent 80%)",
  SW: "linear-gradient(45deg,  rgba(198,40,40,0.22) 0%, transparent 80%)",
  SE: "linear-gradient(315deg, rgba(106,27,154,0.22) 0%, transparent 80%)",
};

const MINIMAP_ROUTES = getSectorRoutes();

const INTERNSHIP_ROUTE = [
  { title: "Montreal", logo: "/logo/city-of-montreal.gif" },
  { title: "Lockheed", logo: "/logo/Lockheed.webp" },
  { title: "Tesla", logo: "/logo/tesla.jpg" },
];

const IDLE_TIPS = [
  "🌀 Use gravitational slingshots to navigate efficiently",
  "🔧 Dock at Home Port to repair hull stress",
  "🧩 Some islands have Assembly Mode — build the project!",
  "🗺️ Open the full Treasure Map with Map or M",
  "⚓ Use Inspect or ENTER near an island",
  "⚙️ This is Louis Zhang's interactive résumé — explore!",
  "🔥 Avoid thermal vents — they spike boiler pressure!",
  "💰 Collect coins to earn Perseverance Points",
];

/* Spring-physics offset hook for HUD elements */
function useSpringOffset(cameraX: number, cameraY: number, factor: number = 0.03) {
  const offsetRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const prevCamRef = useRef({ x: cameraX, y: cameraY });

  useEffect(() => {
    const o = offsetRef.current;
    const dx = cameraX - prevCamRef.current.x;
    const dy = cameraY - prevCamRef.current.y;
    o.vx += dx * factor;
    o.vy += dy * factor;
    prevCamRef.current = { x: cameraX, y: cameraY };
  }, [cameraX, cameraY, factor]);

  // Decay spring
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const o = offsetRef.current;
      o.x += o.vx;
      o.y += o.vy;
      o.vx *= 0.85;
      o.vy *= 0.85;
      o.x *= 0.9;
      o.y *= 0.9;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return offsetRef;
}

/* Circular Gauge */
function CircularGauge({ value, label, icon, warning }: {
  value: number; label: string; icon: string; warning?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, value / 100));
  const circumference = 2 * Math.PI * 28;
  const offset = circumference * (1 - pct);
  const gaugeColor = pct < 0.5 ? "#22c55e" : pct < 0.8 ? "#eab308" : "#ef4444";

  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Background ring */}
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        {/* Value arc */}
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={gaugeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{
            transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
            filter: warning ? `drop-shadow(0 0 4px ${gaugeColor})` : "none",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm">{icon}</span>
        <span className="text-[9px] font-label font-bold tabular-nums" style={{ color: gaugeColor }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="text-center mt-0.5">
        <span className="text-[7px] font-label uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function HUD({
  visitedCount, speed, boilerPressure, stressState, nearbyIsland, boatPosition, boatHeading,
  nearestGravityAngle, onIslandClick, onToggleMap, onReturnHome, score, collectedItems, isHullCritical: hullCrit, isBoilerCritical: boilerCrit, isDocked,
}: HUDProps) {
  const totalActive = missions.filter((m) => m.status === "active").length;
  const scorePercent = MAX_COLLECTIBLE_SCORE > 0 ? (score / MAX_COLLECTIBLE_SCORE) * 100 : 0;
  const isMoving = speed > 0.3;
  const springOffset = useSpringOffset(boatPosition.x, boatPosition.y);

  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % IDLE_TIPS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const isAlert = hullCrit || boilerCrit;
  const statusColor = isAlert ? "#ef4444" : isDocked ? "#00d4ff" : nearbyIsland ? "#eab308" : "#22c55e";
  const statusLabel = isAlert ? "ALERT" : isDocked ? "DOCKED" : nearbyIsland ? "PROXIMITY" : "SAILING";
  const logLine = hullCrit
    ? "⚠️ STRUCTURAL ALERT! Dock for repairs!"
    : boilerCrit
    ? "🔥 OVERPRESSURE! Leave hazard zone!"
    : isDocked
    ? "🏠 Welcome to Home Port — Dock or ENTER"
    : nearbyIsland
    ? `📍 ${nearbyIsland.title} in range — Inspect or ENTER`
    : speed > 1.5
    ? "🌀 Feel the gravitational pull of nearby nodes..."
    : IDLE_TIPS[tipIndex];

  const boatMinimapX = ((boatPosition.x + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;
  const boatMinimapY = ((boatPosition.y + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;

  return (
    <>
      {/* ── Hull Critical Warning ── */}
      <AnimatePresence>
        {hullCrit && (
          <motion.div
            key="hull-alert"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="fixed top-14 left-1/2 z-[80] pointer-events-none"
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(90deg, rgba(180,20,20,0.92), rgba(220,40,40,0.92))", border: "1.5px solid rgba(255,80,80,0.7)", color: "#fff", boxShadow: "0 0 18px rgba(255,60,60,0.4)" }}>
              ⚠️ STRUCTURAL ALERT: Hull stress critical! Dock at Home Port!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Boiler Critical Warning ── */}
      <AnimatePresence>
        {boilerCrit && (
          <motion.div
            key="boiler-alert"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="fixed top-14 left-1/2 z-[79] pointer-events-none"
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(90deg, rgba(160,80,0,0.92), rgba(200,100,0,0.92))", border: "1.5px solid rgba(251,146,60,0.7)", color: "#fff7ed", boxShadow: "0 0 18px rgba(251,146,60,0.4)" }}>
              🔥 OVERPRESSURE! Exit thermal zone immediately!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-6 py-3">
        <motion.div className="shrink min-w-0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
          <h1 className="text-xl md:text-2xl font-black text-white font-headline tracking-normal drop-shadow-lg">
            Isle Commander
          </h1>
          <p className="text-[9px] font-label uppercase tracking-[0.28em] text-cyan-100/62 -mt-0.5">
            Louis Zhang Portfolio
          </p>
          <div className="mt-2 hidden items-center gap-1.5 rounded-md border border-cyan-100/15 bg-slate-950/45 px-2 py-1 backdrop-blur-md lg:flex">
            <span className="mr-1 font-label text-[8px] font-black uppercase tracking-[0.2em] text-cyan-100/42">Route</span>
            {INTERNSHIP_ROUTE.map((item, index) => (
              <div key={item.title} className="flex items-center gap-1">
                <span className="grid h-6 w-8 place-items-center overflow-hidden rounded bg-white p-0.5">
                  <img src={item.logo} alt={`${item.title} logo`} className="max-h-full max-w-full object-contain" />
                </span>
                {index < INTERNSHIP_ROUTE.length - 1 && <span className="text-[10px] text-cyan-100/35">/</span>}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="flex flex-wrap items-center justify-end gap-2 max-w-[64vw]" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}>
          <div className="shrink-0 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/10">
            <span className="text-base">⭐</span>
            <span className="font-headline font-bold text-white text-xs tracking-tight">{visitedCount}/{totalActive} Discovered</span>
          </div>
          <div className="hidden lg:flex shrink-0 bg-yellow-500/15 backdrop-blur-md px-3 py-2 rounded-full shadow-lg items-center gap-2 border border-yellow-300/20">
            <span className="text-base">💰</span>
            <span className="font-headline font-bold text-yellow-100 text-xs tracking-tight">{score} pts</span>
          </div>
          <div className="hidden xl:flex shrink-0 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full shadow-lg items-center gap-2 border border-white/10">
            <span className="text-sm" style={{ animation: isMoving ? "gearSpin 2s linear infinite" : "none" }}>⚙️</span>
            <span className="font-label font-bold text-white text-xs">{(speed * 20).toFixed(0)} kn</span>
          </div>
          <button onClick={onToggleMap} className="hidden shrink-0 bg-cyan-500/50 hover:bg-cyan-500/70 backdrop-blur-md px-3 py-2 rounded-full shadow-lg md:flex items-center gap-2 border border-cyan-300/30 transition-colors cursor-pointer">
            <span className="text-base">🗺️</span>
            <span className="font-label font-bold text-white text-xs uppercase tracking-wider hidden lg:inline">Map</span>
            <kbd className="hidden xl:inline text-[8px] font-label text-cyan-200/60 bg-black/20 px-1 rounded">M</kbd>
          </button>
          <button onClick={onReturnHome} className="hidden shrink-0 bg-emerald-500/35 hover:bg-emerald-500/55 backdrop-blur-md px-3 py-2 rounded-full shadow-lg md:flex items-center gap-2 border border-emerald-200/30 transition-colors cursor-pointer">
            <span className="material-symbols-outlined icon-lock text-[17px] text-emerald-100">home</span>
            <span className="font-label font-bold text-white text-xs uppercase tracking-wider hidden lg:inline">Home</span>
          </button>
          <Link href="/" className="hidden shrink-0 bg-rose-500/30 hover:bg-rose-500/50 backdrop-blur-md px-3 py-2 rounded-full shadow-lg md:flex items-center gap-2 border border-rose-200/30 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[17px] text-rose-100">logout</span>
            <span className="font-label font-bold text-white text-xs uppercase tracking-wider hidden lg:inline">Exit</span>
          </Link>
        </motion.div>
      </header>

      {/* ── Engine Bay — Circular Gauges (Bottom Left) ── */}
      <div className="fixed bottom-4 left-4 z-40 hidden md:block">
        <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/10" style={{ transform: `translate(${springOffset.current.x * 0.5}px, ${springOffset.current.y * 0.5}px)` }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs" style={{ animation: isMoving ? "gearSpin 1.5s linear infinite" : "none" }}>⚙️</span>
            <span className="font-label text-[9px] uppercase font-bold tracking-widest text-cyan-300/80">Engineering Bay</span>
            <span className={`ml-auto text-[8px] font-label font-bold ${isMoving ? "text-green-400" : "text-white/30"}`}>
              {isMoving ? "● ACTIVE" : "● IDLE"}
            </span>
          </div>
          <div className="flex gap-3 items-start">
            <CircularGauge value={boilerPressure} label="Boiler PSI" icon="🔥" warning={boilerCrit} />
            <CircularGauge value={stressState.totalStress} label="Hull Stress" icon="🛡️" warning={hullCrit} />
          </div>
          {/* Mini FEA hull map */}
          <div className="mt-2 flex justify-center">
            <svg viewBox="-20 -20 40 40" width="60" height="60">
              {Array.from({ length: FEA_ZONE_COUNT }).map((_, i) => {
                const startA = (i / FEA_ZONE_COUNT) * 360 - 90;
                const endA = ((i + 1) / FEA_ZONE_COUNT) * 360 - 90;
                const r = 15;
                const x1 = Math.cos((startA * Math.PI) / 180) * r;
                const y1 = Math.sin((startA * Math.PI) / 180) * r;
                const x2 = Math.cos((endA * Math.PI) / 180) * r;
                const y2 = Math.sin((endA * Math.PI) / 180) * r;
                return (
                  <path
                    key={i}
                    d={`M0,0 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                    fill={stressToColor(stressState.zones[i] || 0)}
                    stroke="rgba(0,200,255,0.2)"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Captain's Log (Bottom Left, above gauges) ── */}
      <div className="fixed bottom-52 left-4 w-64 z-40 hidden md:block">
        <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs">📟</span>
            <span className="font-label text-[9px] uppercase font-bold tracking-widest text-cyan-300/80">Captain&apos;s Log</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 5px ${statusColor}`, animation: isAlert ? "stressGlow 0.5s ease-in-out infinite" : "none" }} />
              <span className="font-label text-[8px] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
            </div>
          </div>
          <div className="font-label text-[10px] leading-snug mb-2.5 min-h-[2.4em]">
            <AnimatePresence mode="wait">
              <motion.p key={logLine} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="font-bold" style={{ color: isAlert ? "#fca5a5" : isDocked ? "#67e8f9" : nearbyIsland ? "#fde68a" : "#a5f3fc" }}>
                {logLine}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="font-label text-[9px] text-white/35 leading-relaxed space-y-0.5 border-t border-white/10 pt-2">
            <div className="flex justify-between"><span>HDG</span><span className="text-white/55">{Math.round(boatHeading)}°</span></div>
            <div className="flex justify-between"><span>SPEED</span><span className="text-white/55">{(speed * 20).toFixed(0)} kn</span></div>
            <div className="flex justify-between"><span>PROGRESS</span><span className="text-white/55">{visitedCount}/{totalActive} islands</span></div>
          </div>
        </div>
      </div>

      {/* ── Score Panel (Bottom Centre) ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <div className="bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-yellow-400/15 min-w-[220px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label text-[9px] uppercase font-bold tracking-widest text-yellow-300/70">Perseverance Points</span>
            <span className="font-headline font-black text-yellow-300 text-sm">{score} <span className="text-yellow-500/60 font-normal text-[10px]">/ {MAX_COLLECTIBLE_SCORE}</span></span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${scorePercent}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)", boxShadow: "0 0 6px rgba(251,191,36,0.6)" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-label text-[8px] text-white/30">🪙 {collectedItems.size} collected</span>
            <span className="font-label text-[8px] text-white/30">{scorePercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* ── MiniMap (Top Right) ── */}
      <div className="fixed top-16 right-4 z-40 hidden lg:block group">
        <div
          className="relative bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl cursor-pointer hover:border-white/25 transition-colors"
          style={{ width: 240, height: 240 }}
          onClick={onToggleMap}
          role="button"
          title="Open full map"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute" style={{ left: 0, top: 0, width: "50%", height: "50%", background: QUADRANT_BG.NW }} />
            <div className="absolute" style={{ left: "50%", top: 0, width: "50%", height: "50%", background: QUADRANT_BG.NE }} />
            <div className="absolute" style={{ left: 0, top: "50%", width: "50%", height: "50%", background: QUADRANT_BG.SW }} />
            <div className="absolute" style={{ left: "50%", top: "50%", width: "50%", height: "50%", background: QUADRANT_BG.SE }} />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0" style={{ left: "50%", width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div className="absolute left-0 right-0" style={{ top: "50%", height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>
          {SECTORS.map(s => (
            <div key={s.name} className="absolute pointer-events-none" style={{ left: s.labelX, top: s.labelY }}>
              <span className="font-label text-[6px] uppercase font-black tracking-wider px-1 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>{s.name.split(" ")[0]}</span>
            </div>
          ))}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 font-label text-[8px] uppercase tracking-widest text-white/40 font-bold z-10">Radar</div>

          {/* Route lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="mmGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.2" />
              </filter>
            </defs>
            {MINIMAP_ROUTES.map((route) => {
              const pts = route.points.map((p) => `${p.x * 100},${p.y * 100}`).join(" ");
              return (
                <g key={route.name}>
                  <polyline points={pts} fill="none" stroke={route.color} strokeWidth="3.5" strokeOpacity="0.22" strokeLinecap="round" filter="url(#mmGlow)" />
                  <polyline points={pts} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.6" strokeLinecap="round" />
                  <polyline points={pts} fill="none" stroke={route.color} strokeWidth="1" strokeOpacity="0.95" strokeDasharray="3 2" strokeLinecap="round" className="mm-route-dash" />
                  {route.points.map((p, i) => i > 0 && (
                    <circle key={i} cx={p.x * 100} cy={p.y * 100} r="0.9" fill={route.color} opacity="0.8" />
                  ))}
                </g>
              );
            })}
          </svg>

          {missions.map(m => (
            <button key={m.id} className="absolute w-2.5 h-2.5 rounded-full transition-all cursor-pointer hover:scale-150 z-10"
              style={{ left: `${((m.position.x + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100}%`, top: `${((m.position.y + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100}%`, backgroundColor: nearbyIsland?.id === m.id ? "#fff" : m.sectorColor, opacity: m.status === "locked" ? 0.3 : 0.85, boxShadow: nearbyIsland?.id === m.id ? "0 0 8px white" : "none" }}
              onClick={(e) => { e.stopPropagation(); onIslandClick(m); }} title={m.title} />
          ))}
          <div className="absolute w-2 h-2 rounded-full bg-cyan-400/50 z-10" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
          <div className="absolute w-3 h-3 z-20" style={{ left: `${boatMinimapX}%`, top: `${boatMinimapY}%`, transform: `translate(-50%, -50%) rotate(${boatHeading}deg)` }}>
            <div className="w-0 h-0" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: "8px solid #00ff88", filter: "drop-shadow(0 0 3px #00ff88)" }} />
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(0,255,200,0.06) 10%, transparent 30%)", animation: "gearSpin 4s linear infinite" }} />
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex justify-between items-center bg-black/30 z-10">
            <span className="font-label text-[7px] text-yellow-300/70 font-bold">💰 {score}pts</span>
            <span className="font-label text-[7px] text-white/40">{visitedCount}/{totalActive}</span>
          </div>
          {/* Hover hint */}
          <div className="absolute inset-x-0 bottom-7 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <span className="font-label text-[7px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">Click to expand</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mmDash { to { stroke-dashoffset: -20; } }
        .mm-route-dash { animation: mmDash 6s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .mm-route-dash { animation: none; } }
      `}</style>

      {/* ── Gravity Compass (Bottom Right) ── */}
      <div className="fixed bottom-4 right-4 z-40 hidden md:block">
        <div className="relative bg-black/50 backdrop-blur-md w-20 h-20 rounded-full border border-cyan-400/30 flex items-center justify-center shadow-lg overflow-hidden"
          style={{ boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
          {[...Array(8)].map((_, ti) => (
            <div key={ti} className="absolute rounded-full" style={{ width: 3, height: 3, background: "rgba(0,212,255,0.3)", top: "50%", left: "50%", transform: `rotate(${ti * 45}deg) translateY(-34px) translate(-50%, -50%)`, transformOrigin: "center center" }} />
          ))}
          <div className="absolute text-3xl" style={{ animation: "gearSpin 8s linear infinite", color: "#00d4ff", opacity: 0.2, filter: "drop-shadow(0 0 4px #00d4ff)" }}>⚙️</div>
          <div className="absolute text-[8px] font-label font-black" style={{ transform: `rotate(${-boatHeading}deg)`, color: "rgba(255,255,255,0.3)" }}>
            <div className="flex flex-col items-center" style={{ marginTop: "-28px" }}>
              <span className="text-cyan-300 text-[9px]">N</span>
            </div>
          </div>
          <div className="absolute z-10" style={{ transform: `rotate(${nearestGravityAngle - boatHeading}deg)`, transition: "transform 0.3s ease-out" }}>
            <div className="relative flex flex-col items-center" style={{ height: 36 }}>
              <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "12px solid #00d4ff", filter: "drop-shadow(0 0 4px #00d4ff)", marginBottom: 2 }} />
              <div style={{ width: 2, height: 14, background: "#00d4ff", borderRadius: 2, opacity: 0.8 }} />
            </div>
          </div>
          <div className="absolute w-2 h-2 rounded-full z-20" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
        </div>
        <div className="text-center mt-1">
          <span className="font-label text-[7px] text-cyan-300/50 uppercase tracking-widest">Gravity</span>
        </div>
      </div>
    </>
  );
}
