"use client";

import React, { useState } from "react";
import { missions, sectorInfo, Mission, WORLD_BOUNDS } from "@/data/missions";

interface TreasureMapProps {
  isOpen: boolean;
  onClose: () => void;
  visitedIds: Set<string>;
  onNavigate: (mission: Mission) => void;
  boatPosition: { x: number; y: number };
  boatHeading: number;
}

/* Deterministic random */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const TreasureMap = React.memo(function TreasureMap({ isOpen, onClose, visitedIds, onNavigate, boatPosition, boatHeading }: TreasureMapProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalActive = missions.filter((m) => m.status === "active").length;

  // Pre-generate terrain features
  const rng = seededRng(42);
  const terrainBlobs: { x: number; y: number; w: number; h: number; color: string; borderR: string }[] = [];
  // Green land patches
  for (let i = 0; i < 18; i++) {
    terrainBlobs.push({
      x: rng() * 85 + 5, y: rng() * 80 + 5,
      w: 12 + rng() * 18, h: 10 + rng() * 14,
      color: `rgba(${60 + rng() * 60}, ${120 + rng() * 80}, ${40 + rng() * 40}, ${0.35 + rng() * 0.25})`,
      borderR: `${35 + rng() * 25}% ${40 + rng() * 30}% ${35 + rng() * 25}% ${40 + rng() * 30}%`,
    });
  }
  // Water bodies
  const waterBodies: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < 8; i++) {
    waterBodies.push({
      x: rng() * 80 + 8, y: rng() * 75 + 8,
      w: 6 + rng() * 10, h: 4 + rng() * 8,
    });
  }
  // Small detail trees/flowers
  const details: { x: number; y: number; emoji: string; size: number }[] = [];
  const detailEmojis = ["🌲", "🌳", "🌸", "🌿", "🌼", "🌴", "🏔️"];
  for (let i = 0; i < 30; i++) {
    details.push({
      x: rng() * 90 + 3, y: rng() * 85 + 3,
      emoji: detailEmojis[Math.floor(rng() * detailEmojis.length)],
      size: 6 + rng() * 6,
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Map card */}
      <div
        className="relative w-full max-w-5xl max-h-[88svh] overflow-y-auto rounded-[8px] shadow-[0_32px_100px_rgba(0,0,0,0.5)]"
        style={{
          background: "linear-gradient(145deg, #fff1c8, #e0bf79)",
          border: "1px solid rgba(255, 235, 190, 0.72)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Parchment texture overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #8B6914 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }} />

        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-[#8b6730]/25 bg-[#f8e5b7]/92 px-6 pb-4 pt-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🗺️</span>
              <div>
                <h2 className="text-2xl font-headline font-black text-[#4a3520] tracking-tight">
                  Captain&apos;s Treasure Map
                </h2>
                <p className="text-[11px] font-label uppercase tracking-widest text-[#8a6e40] font-bold">
                  ⭐ {visitedIds.size}/{totalActive} locations discovered
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[8px] border border-[#6f4c21]/10 bg-[#a08050]/16 text-lg font-bold text-[#4a3520] transition-colors hover:bg-[#a08050]/28"
            >
              ✕
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-label text-[#8a6e40] uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#e65100] inline-block" /> Internships</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#b8860b] inline-block" /> Mech/Aero</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c62828] inline-block" /> Robotics/IoT</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6a1b9a] inline-block" /> Software/AI</span>
            <span className="flex items-center gap-1 ml-2 pl-2 border-l border-[#a08050]/30">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "conic-gradient(#e65100, #b8860b, #e65100)" }} /> Typhoon
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block border border-[#6a1b9a]" style={{ background: "radial-gradient(circle, #6a1b9a 30%, transparent 70%)" }} /> Gravity
            </span>
          </div>
        </div>

        {/* ═══ MAP VIEWPORT ═══ */}
        <div className="relative mx-6 my-4 overflow-hidden rounded-[8px] border border-[#6f4c21]/24 shadow-[inset_0_0_38px_rgba(9,44,56,0.34),0_18px_40px_rgba(64,42,10,0.16)]" style={{ background: "linear-gradient(160deg, #56c6dc, #2890a8 35%, #1e7a92 65%, #164e5e)" }}>
          <div className="relative" style={{ paddingBottom: "62%" }}>

            {/* Ocean wave texture */}
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 10px)",
            }} />

            {/* Terrain blobs — land masses */}
            {terrainBlobs.map((blob, i) => (
              <div key={`terrain-${i}`} className="absolute" style={{
                left: `${blob.x}%`, top: `${blob.y}%`,
                width: `${blob.w}%`, height: `${blob.h}%`,
                background: blob.color,
                borderRadius: blob.borderR,
                filter: "blur(2px)",
              }} />
            ))}

            {/* Water bodies — darker patches within land */}
            {waterBodies.map((wb, i) => (
              <div key={`water-${i}`} className="absolute" style={{
                left: `${wb.x}%`, top: `${wb.y}%`,
                width: `${wb.w}%`, height: `${wb.h}%`,
                background: "radial-gradient(ellipse, rgba(20,100,140,0.35) 0%, rgba(20,80,120,0.15) 60%, transparent 100%)",
                borderRadius: "50%",
              }} />
            ))}

            {/* Territory sector zones */}
            {[
              { name: "Internship Shores", left: "5%", top: "3%", width: "42%", height: "48%", color: "rgba(230,81,0,0.2)" },
              { name: "Aero Atoll", left: "48%", top: "0%", width: "50%", height: "52%", color: "rgba(184,134,11,0.2)" },
              { name: "Robotics & IoT", left: "3%", top: "48%", width: "44%", height: "50%", color: "rgba(198,40,40,0.2)" },
              { name: "Code Cove", left: "42%", top: "45%", width: "56%", height: "53%", color: "rgba(106,27,154,0.2)" },
            ].map((zone) => (
              <div key={zone.name}
                className="absolute rounded-[40%] transition-all duration-300"
                style={{
                  left: zone.left, top: zone.top, width: zone.width, height: zone.height,
                  background: `radial-gradient(ellipse, ${zone.color} 0%, transparent 75%)`,
                  opacity: hoveredSector === zone.name ? 1 : 0.5,
                  transform: hoveredSector === zone.name ? "scale(1.02)" : "scale(1)",
                }}
              />
            ))}

            {/* Coastline edge — darker vignette */}
            <div className="absolute inset-0 rounded-2xl" style={{
              boxShadow: "inset 0 0 40px rgba(10,40,50,0.5), inset 0 0 80px rgba(10,40,50,0.25)",
            }} />

            {/* Small terrain details (trees, flowers) */}
            {details.map((d, i) => (
              <div key={`detail-${i}`} className="absolute pointer-events-none select-none"
                style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: `${d.size}px`, opacity: 0.5 }}
              >{d.emoji}</div>
            ))}

            {/* ── Path connections between islands ── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 70" preserveAspectRatio="none">
              {sectorInfo.map((sector) => {
                const active = missions.filter((m) => m.sector === sector.name && m.status === "active");
                if (active.length === 0) return null;

                // Nearest-neighbor order starting from the island closest to origin
                const dist2 = (a: { x: number; y: number }, b: { x: number; y: number }) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
                const origin = { x: 0, y: 0 };
                const remaining = [...active];
                remaining.sort((a, b) => dist2(a.position, origin) - dist2(b.position, origin));
                const ordered: Mission[] = [remaining.shift()!];
                while (remaining.length > 0) {
                  const last = ordered[ordered.length - 1].position;
                  let bestIdx = 0, bestD = dist2(last, remaining[0].position);
                  for (let i = 1; i < remaining.length; i++) {
                    const d = dist2(last, remaining[i].position);
                    if (d < bestD) { bestD = d; bestIdx = i; }
                  }
                  ordered.push(remaining.splice(bestIdx, 1)[0]);
                }

                const toX = (wx: number) => ((wx + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;
                const toY = (wy: number) => ((wy + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 70;

                const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
                // Spoke: center → entry island
                segments.push({ x1: 50, y1: 35, x2: toX(ordered[0].position.x), y2: toY(ordered[0].position.y) });
                // Sector chain
                for (let i = 0; i < ordered.length - 1; i++) {
                  segments.push({ x1: toX(ordered[i].position.x), y1: toY(ordered[i].position.y), x2: toX(ordered[i + 1].position.x), y2: toY(ordered[i + 1].position.y) });
                }

                return (
                  <g key={sector.name}>
                    {/* Drop shadow for depth */}
                    {segments.map((s, i) => (
                      <line key={`sh-${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                        stroke="rgba(0,0,0,0.35)" strokeWidth="2.4" strokeLinecap="round" />
                    ))}
                    {/* Colored route */}
                    {segments.map((s, i) => (
                      <line key={`rt-${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                        stroke={sector.color} strokeWidth="1.5" strokeOpacity={0.9} strokeLinecap="round" />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Center home port */}
            <div className="absolute z-10" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-white/60 border-2 border-cyan-300/80 shadow-lg" style={{ boxShadow: "0 0 12px rgba(0,200,255,0.4)" }} />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[6px] font-label font-bold text-white/80 bg-black/30 px-1.5 py-0.5 rounded">
                  🏠 Home Port
                </div>
              </div>
            </div>

            {/* ── Island markers with force field indicators ── */}
            {missions.map((m) => {
              const x = ((m.position.x + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;
              const y = ((m.position.y + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 70;
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
                  {/* Force field ring */}
                  <div className="absolute rounded-full pointer-events-none transition-all duration-300"
                    style={{
                      width: `${fieldR * 3}vw`,
                      height: `${fieldR * 3}vw`,
                      maxWidth: "80px",
                      maxHeight: "80px",
                      left: "50%", top: "50%",
                      transform: "translate(-50%,-50%)",
                      border: m.fieldType === "typhoon"
                        ? `1.5px solid ${m.color}40`
                        : `1.5px dashed ${m.color}35`,
                      background: m.fieldType === "typhoon"
                        ? `conic-gradient(${m.color}15, transparent 30%, ${m.color}10, transparent 60%, ${m.color}15)`
                        : `radial-gradient(circle, ${m.color}20 0%, transparent 70%)`,
                      opacity: isHovered ? 1 : 0.6,
                      animation: m.fieldType === "typhoon" ? "spin 8s linear infinite" : "pulse 3s ease-in-out infinite",
                    }}
                  />
                  {/* Island marker */}
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
                    {/* Field type indicator dot */}
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
                  {/* Tooltip on hover */}
                  {isHovered && !isLocked && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[7px] font-label px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none border border-white/10">
                      {m.subtitle} · <span style={{ color: m.fieldType === "typhoon" ? "#ff9800" : "#ab47bc" }}>{m.fieldType === "typhoon" ? "🌀 Typhoon" : "🕳️ Gravity"}</span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* ── Player "You Are Here" marker ── */}
            {(() => {
              const px = ((boatPosition.x + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 100;
              const py = ((boatPosition.y + WORLD_BOUNDS) / (WORLD_BOUNDS * 2)) * 70;
              return (
                <div
                  className="absolute z-30 pointer-events-none"
                  style={{ left: `${px}%`, top: `${py}%`, transform: `translate(-50%, -50%) rotate(${boatHeading}deg)` }}
                >
                  {/* Pulsing ring */}
                  <div className="absolute rounded-full border-2 border-cyan-300/70"
                    style={{
                      width: "22px", height: "22px",
                      left: "50%", top: "50%",
                      transform: "translate(-50%,-50%)",
                      animation: "playerPulse 1.5s ease-in-out infinite",
                    }}
                  />
                  {/* Boat arrow */}
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
            <div className="absolute top-2 right-3 text-white/50 font-label text-[8px] font-bold text-center z-10">
              <div>N</div>
              <div className="flex gap-2"><span>W</span><span className="text-[12px]">🧭</span><span>E</span></div>
              <div>S</div>
            </div>

            {/* Sector labels on map */}
            <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "15%", top: "18%", color: "#e65100", opacity: 0.5, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>Internship Shores</div>
            <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "65%", top: "12%", color: "#b8860b", opacity: 0.5, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>Aero Atoll</div>
            <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "12%", top: "72%", color: "#c62828", opacity: 0.5, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>Robotics & IoT</div>
            <div className="absolute text-[7px] font-label font-black uppercase tracking-widest z-10" style={{ left: "62%", top: "70%", color: "#6a1b9a", opacity: 0.5, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>Code Cove</div>
          </div>
        </div>

        {/* Territory cards */}
        <div className="px-6 pb-6 space-y-3">
          {sectorInfo.map((sector) => {
            const sectorMissions = missions.filter((m) => m.sector === sector.name);
            const discovered = sectorMissions.filter((m) => visitedIds.has(m.id)).length;
            const total = sectorMissions.filter((m) => m.status === "active").length;
            const isInternship = sector.name === "Internship Shores";

            return (
              <div
                key={sector.name}
                className="cursor-default rounded-[8px] border p-4 transition-colors"
                style={{
                  background: `${sector.color}0a`,
                  borderColor: `${sector.color}25`,
                }}
                onMouseEnter={() => setHoveredSector(sector.name)}
                onMouseLeave={() => setHoveredSector(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{sector.emoji}</span>
                    <div>
                      <h3 className="font-headline font-bold text-[#4a3520] text-sm flex items-center gap-2">
                        {sector.name}
                        {isInternship && (
                          <span className="text-[8px] font-label uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                            Work Experience
                          </span>
                        )}
                        {!isInternship && (
                          <span className="text-[8px] font-label uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                            Build
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] font-label text-[#8a6e40]">
                        {sector.description} · {sector.quadrant}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-headline font-bold" style={{ color: sector.color }}>
                      {discovered}/{total}
                    </div>
                    <div className="text-[8px] font-label text-[#8a6e40] uppercase">Discovered</div>
                  </div>
                </div>

                {/* Mission list */}
                <div className="flex flex-wrap gap-2">
                  {sectorMissions.map((m) => {
                    const visited = visitedIds.has(m.id);
                    const locked = m.status === "locked";
                    return (
                      <button
                        key={m.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all hover:scale-105 cursor-pointer"
                        style={{
                          background: locked ? "#eee" : visited ? `${m.color}15` : "white",
                          color: locked ? "#999" : m.color,
                          border: `1.5px solid ${locked ? "#ddd" : m.color}30`,
                          boxShadow: visited ? `0 2px 8px ${m.color}15` : "none",
                        }}
                        onClick={() => { onNavigate(m); onClose(); }}
                      >
                        <span className="text-sm">{m.emoji}</span>
                        {m.title}
                        {m.fieldType === "typhoon" && <span className="text-[8px] opacity-50">🌀</span>}
                        {m.fieldType === "gravity" && <span className="text-[8px] opacity-50">🕳️</span>}
                        {visited && <span className="text-xs">⭐</span>}
                        {locked && <span className="text-[8px]">🔒</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <span className="text-[10px] font-label text-[#8a6e40]/60 uppercase tracking-widest">
            Press <kbd className="bg-[#a08050]/15 px-1.5 py-0.5 rounded font-bold mx-0.5">M</kbd> or <kbd className="bg-[#a08050]/15 px-1.5 py-0.5 rounded font-bold mx-0.5">ESC</kbd> to close
          </span>
        </div>
      </div>

      {/* CSS animation for map field rings */}
      <style jsx>{`
        @keyframes spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.7; transform: translate(-50%,-50%) scale(1.08); } }
        @keyframes playerPulse { 0%,100% { opacity: 0.8; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.2; transform: translate(-50%,-50%) scale(1.6); } }
      `}</style>
    </div>
  );
});

export default TreasureMap;
