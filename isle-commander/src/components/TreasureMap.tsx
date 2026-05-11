"use client";

import React, { useState } from "react";
import { missions, sectorInfo, Mission, WORLD_BOUNDS } from "@/data/missions";
import { getSectorRoutes } from "@/lib/routeGeometry";

interface TreasureMapProps {
  isOpen: boolean;
  onClose: () => void;
  visitedIds: Set<string>;
  onNavigate: (mission: Mission) => void;
  boatPosition: { x: number; y: number };
  boatHeading: number;
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const rngInstance = seededRng(42);
const TERRAIN_BLOBS = Array.from({ length: 8 }, () => ({
  x: rngInstance() * 80 + 8,
  y: rngInstance() * 75 + 8,
  w: 12 + rngInstance() * 22,
  h: 10 + rngInstance() * 18,
  color: `rgba(${120 + Math.floor(rngInstance() * 50)}, ${155 + Math.floor(rngInstance() * 45)}, ${75 + Math.floor(rngInstance() * 35)}, ${0.42 + rngInstance() * 0.22})`,
  borderR: `${35 + Math.floor(rngInstance() * 25)}% ${40 + Math.floor(rngInstance() * 30)}% ${35 + Math.floor(rngInstance() * 25)}% ${40 + Math.floor(rngInstance() * 30)}%`,
}));

const toMapX = (wx: number) => ((wx + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;
const toMapY = (wy: number) => ((wy + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;

const SECTOR_ROUTES = getSectorRoutes();

const TreasureMap = React.memo(function TreasureMap({
  isOpen, onClose, visitedIds, onNavigate, boatPosition, boatHeading,
}: TreasureMapProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalActive = missions.filter((m) => m.status === "active").length;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Map card — fixed height flex column, no scroll */}
      <div
        className="relative w-full max-w-6xl flex flex-col overflow-hidden rounded-[8px] shadow-[0_32px_100px_rgba(0,0,0,0.5)]"
        style={{
          height: "min(92svh, 92vh)",
          background: "linear-gradient(145deg, #fff1c8, #e0bf79)",
          border: "1px solid rgba(255, 235, 190, 0.72)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Parchment texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #8B6914 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }} />

        {/* ── Header ── */}
        <div className="shrink-0 z-40 border-b border-[#8b6730]/25 bg-[#f8e5b7]/92 px-6 pb-3 pt-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              <div>
                <h2 className="text-xl font-headline font-black text-[#4a3520] tracking-tight">
                  Captain&apos;s Treasure Map
                </h2>
                <p className="text-[11px] font-label uppercase tracking-widest text-[#8a6e40] font-bold">
                  ⭐ {visitedIds.size}/{totalActive} locations discovered
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] border border-[#6f4c21]/10 bg-[#a08050]/16 text-lg font-bold text-[#4a3520] transition-colors hover:bg-[#a08050]/28"
            >
              ✕
            </button>
          </div>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-label text-[#8a6e40] uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#e65100] inline-block" /> Internships</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#b8860b] inline-block" /> Mech/Aero</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c62828] inline-block" /> Robotics/IoT</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6a1b9a] inline-block" /> Software/AI</span>
          </div>
        </div>

        {/* ── MAP VIEWPORT — fills remaining space ── */}
        <div
          className="relative flex-1 min-h-0 mx-4 my-3 overflow-hidden rounded-[8px] border border-[#6f4c21]/24 shadow-[inset_0_0_60px_rgba(4,30,40,0.55),0_18px_40px_rgba(64,42,10,0.16)]"
          style={{ background: "linear-gradient(160deg, #0c5b7d, #0f7ea6 30%, #0a6486 60%, #06384c)" }}
        >
          {/* Nautical chart grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 9.09%, rgba(255,255,255,0.04) 9.09%, rgba(255,255,255,0.04) calc(9.09% + 1px)), repeating-linear-gradient(90deg, transparent, transparent 9.09%, rgba(255,255,255,0.04) 9.09%, rgba(255,255,255,0.04) calc(9.09% + 1px))",
          }} />

          {/* Ocean wave texture */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 10px)",
          }} />

          {/* Land masses */}
          {TERRAIN_BLOBS.map((blob, i) => (
            <div key={`t-${i}`} className="absolute" style={{
              left: `${blob.x}%`, top: `${blob.y}%`,
              width: `${blob.w}%`, height: `${blob.h}%`,
              background: blob.color,
              borderRadius: blob.borderR,
              filter: "blur(1px)",
              boxShadow: "inset 0 0 8px rgba(80,60,20,0.25)",
            }} />
          ))}

          {/* Territory sector zones */}
          {[
            { name: "Internship Shores", left: "5%", top: "3%", width: "42%", height: "48%", color: "rgba(230,81,0,0.22)" },
            { name: "Aero Atoll",        left: "48%", top: "0%", width: "50%", height: "52%", color: "rgba(184,134,11,0.22)" },
            { name: "Robotics & IoT",    left: "3%", top: "48%", width: "44%", height: "50%", color: "rgba(198,40,40,0.22)" },
            { name: "Code Cove",         left: "42%", top: "45%", width: "56%", height: "53%", color: "rgba(106,27,154,0.22)" },
          ].map((zone) => (
            <div key={zone.name} className="absolute rounded-[40%] transition-all duration-300" style={{
              left: zone.left, top: zone.top, width: zone.width, height: zone.height,
              background: `radial-gradient(ellipse, ${zone.color} 0%, transparent 75%)`,
              opacity: hoveredSector === zone.name ? 1 : 0.5,
              transform: hoveredSector === zone.name ? "scale(1.02)" : "scale(1)",
            }} />
          ))}

          {/* ── Route lines ── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
              </filter>
              {SECTOR_ROUTES.map((route) => {
                const light = route.color.replace(/^#/, "");
                return (
                  <linearGradient key={`grad-${route.name}`} id={`grad-${route.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={route.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={`#${light}`} stopOpacity="0.7" />
                  </linearGradient>
                );
              })}
            </defs>

            {SECTOR_ROUTES.map((route) => {
              const pts = route.points.map((p) => `${p.x * 100},${p.y * 100}`).join(" ");
              return (
                <g key={route.name}>
                  {/* Glow */}
                  <polyline points={pts} fill="none"
                    stroke={route.color} strokeWidth="5" strokeOpacity="0.28"
                    strokeLinecap="round" strokeLinejoin="round"
                    filter="url(#mapGlow)" />
                  {/* Shadow */}
                  <polyline points={pts} fill="none"
                    stroke="rgba(0,0,0,0.45)" strokeWidth="2.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                  {/* Core — animated dashes */}
                  <polyline points={pts} fill="none"
                    stroke={`url(#grad-${route.name})`} strokeWidth="1.5"
                    strokeOpacity="0.95" strokeDasharray="4 2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="route-line" />
                  {/* Waypoint dots */}
                  {route.points.map((p, i) => (
                    <circle key={i} cx={p.x * 100} cy={p.y * 100} r={i === 0 ? 0 : 1.2}
                      fill="white" stroke={route.color} strokeWidth="0.5" opacity="0.9" />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Center home port */}
          <div className="absolute z-10" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-white/60 border-2 border-cyan-300/80 shadow-lg"
                style={{ boxShadow: "0 0 12px rgba(0,200,255,0.4)" }} />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[6px] font-label font-bold text-white/80 bg-black/30 px-1.5 py-0.5 rounded">
                🏠 Home Port
              </div>
            </div>
          </div>

          {/* Island markers */}
          {missions.map((m) => {
            const x = toMapX(m.position.x);
            const y = toMapY(m.position.y);
            const isVisited = visitedIds.has(m.id);
            const isLocked = m.status === "locked";
            const isHovered = hoveredIsland === m.id;
            const fieldR = ((m.fieldRadius ?? 250) / (WORLD_BOUNDS * 2)) * 100;

            return (
              <button
                key={m.id}
                className="absolute flex flex-col items-center cursor-pointer group z-20"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                onClick={() => { onNavigate(m); onClose(); }}
                onMouseEnter={() => setHoveredIsland(m.id)}
                onMouseLeave={() => setHoveredIsland(null)}
              >
                <div className="absolute rounded-full pointer-events-none transition-all duration-300"
                  style={{
                    width: `${fieldR * 3}vw`, height: `${fieldR * 3}vw`,
                    maxWidth: "80px", maxHeight: "80px",
                    left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                    border: m.fieldType === "typhoon" ? `1.5px solid ${m.color}40` : `1.5px dashed ${m.color}35`,
                    background: m.fieldType === "typhoon"
                      ? `conic-gradient(${m.color}15, transparent 30%, ${m.color}10, transparent 60%, ${m.color}15)`
                      : `radial-gradient(circle, ${m.color}20 0%, transparent 70%)`,
                    opacity: isHovered ? 1 : 0.6,
                    animation: m.fieldType === "typhoon" ? "spin 8s linear infinite" : "pulse 3s ease-in-out infinite",
                  }}
                />
                <div
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center border-2 shadow-lg transition-all duration-200"
                  style={{
                    background: isLocked ? "#555" : `linear-gradient(135deg, ${m.color}, ${m.color}cc)`,
                    borderColor: isLocked ? "#777" : isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                    opacity: isLocked ? 0.5 : 1,
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                    boxShadow: isHovered ? `0 0 16px ${m.color}60` : `0 2px 6px rgba(0,0,0,0.3)`,
                  }}
                >
                  <span className="text-sm">{m.emoji}</span>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white/60"
                    style={{
                      background: m.fieldType === "typhoon"
                        ? `conic-gradient(${m.color}, transparent, ${m.color})`
                        : `radial-gradient(circle, ${m.color} 40%, transparent)`,
                    }}
                  />
                </div>
                {isVisited && <span className="text-[8px] -mt-0.5">⭐</span>}
                {isLocked && <span className="text-[7px] text-white/60 font-bold">🔒</span>}
                <span className="text-[7px] font-label font-bold text-white/90 mt-0.5 whitespace-nowrap drop-shadow-lg max-w-[60px] truncate">
                  {m.title}
                </span>
                {isHovered && !isLocked && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[7px] font-label px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none border border-white/10">
                    {m.subtitle} · <span style={{ color: m.fieldType === "typhoon" ? "#ff9800" : "#ab47bc" }}>{m.fieldType === "typhoon" ? "🌀 Typhoon" : "🕳️ Gravity"}</span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Player position */}
          {(() => {
            const px = toMapX(boatPosition.x);
            const py = toMapY(boatPosition.y);
            return (
              <div className="absolute z-30 pointer-events-none"
                style={{ left: `${px}%`, top: `${py}%`, transform: `translate(-50%, -50%) rotate(${boatHeading}deg)` }}
              >
                <div className="absolute rounded-full border-2 border-cyan-300/70" style={{
                  width: "22px", height: "22px",
                  left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                  animation: "playerPulse 1.5s ease-in-out infinite",
                }} />
                <div style={{
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderBottom: "12px solid #00e5ff",
                  filter: "drop-shadow(0 0 4px #00e5ff)",
                }} />
              </div>
            );
          })()}

          {/* Compass rose */}
          <div className="absolute top-2 right-3 z-10 bg-black/28 rounded-md px-2 py-1 text-center" style={{ backdropFilter: "blur(4px)" }}>
            <div className="text-white/90 font-label text-[10px] font-black drop-shadow">N</div>
            <div className="flex gap-1.5 items-center text-white/90 font-label text-[10px] font-black">
              <span>W</span>
              <span className="text-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">🧭</span>
              <span>E</span>
            </div>
            <div className="text-white/90 font-label text-[10px] font-black drop-shadow">S</div>
          </div>

          {/* Sector labels */}
          <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "12%", top: "16%", color: "#e65100", opacity: 0.65, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>Internship Shores</div>
          <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "62%", top: "10%", color: "#b8860b", opacity: 0.65, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>Aero Atoll</div>
          <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "10%", top: "70%", color: "#c62828", opacity: 0.65, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>Robotics &amp; IoT</div>
          <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "60%", top: "68%", color: "#6a1b9a", opacity: 0.65, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>Code Cove</div>
        </div>

        {/* ── Sector strip (replaces Territory cards) ── */}
        <div className="shrink-0 flex flex-wrap gap-2 px-4 py-3 border-t border-[#8b6730]/20">
          {sectorInfo.map((sector) => {
            const sectorMissions = missions.filter((m) => m.sector === sector.name);
            const discovered = sectorMissions.filter((m) => visitedIds.has(m.id)).length;
            const total = sectorMissions.filter((m) => m.status === "active").length;
            return (
              <div
                key={sector.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-label font-bold border cursor-default transition-all"
                style={{
                  background: `${sector.color}14`,
                  borderColor: `${sector.color}35`,
                }}
                onMouseEnter={() => setHoveredSector(sector.name)}
                onMouseLeave={() => setHoveredSector(null)}
              >
                <span>{sector.emoji}</span>
                <span className="text-[#4a3520]">{sector.name}</span>
                <span className="font-headline font-black tabular-nums" style={{ color: sector.color }}>
                  {discovered}/{total}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 pb-4 text-center">
          <span className="text-[10px] font-label text-[#8a6e40]/60 uppercase tracking-widest">
            Press <kbd className="bg-[#a08050]/15 px-1.5 py-0.5 rounded font-bold mx-0.5">M</kbd> or <kbd className="bg-[#a08050]/15 px-1.5 py-0.5 rounded font-bold mx-0.5">ESC</kbd> to close
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes routeDash { to { stroke-dashoffset: -50; } }
        @keyframes spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4; transform: translate(-50%,-50%) scale(1); } 50% { opacity:0.7; transform: translate(-50%,-50%) scale(1.08); } }
        @keyframes playerPulse { 0%,100% { opacity:0.8; transform: translate(-50%,-50%) scale(1); } 50% { opacity:0.2; transform: translate(-50%,-50%) scale(1.6); } }
        .route-line { animation: routeDash 8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .route-line { animation: none; } }
      `}</style>
    </div>
  );
});

export default TreasureMap;
