"use client";

import React, { useMemo } from "react";
import { missions, collectibles, Mission, fogZones, WORLD_BOUNDS, hazardZones, barrels } from "@/data/missions";
import Island from "./Island";

interface GameWorldProps {
  worldRef: React.RefObject<HTMLDivElement | null>;
  paralaxBgRef: React.RefObject<HTMLDivElement | null>;
  paralaxMidRef: React.RefObject<HTMLDivElement | null>;
  paralaxFgRef: React.RefObject<HTMLDivElement | null>;
  nearbyIsland: Mission | null;
  visitedIds: Set<string>;
  collectedItems: Set<string>;
  fogRevealedZones: Set<number>;
  onIslandClick: (mission: Mission) => void;
}

interface RouteCurve {
  d: string;
  color: string;
}

const WORLD_SIZE = 5000;
const HALF = WORLD_SIZE / 2;
const BG_SIZE = 12000;
const MID_SIZE = 10000;
const FG_SIZE = 7000;
const SAFE_ROUTE_RADIUS = 145;
const ISLAND_VISIBLE_BARRIER_RADIUS = 112;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const GameWorld = React.memo(function GameWorld({
  worldRef,
  paralaxBgRef,
  paralaxMidRef,
  paralaxFgRef,
  nearbyIsland,
  visitedIds,
  collectedItems,
  fogRevealedZones,
  onIslandClick,
}: GameWorldProps) {
  const decor = useMemo(() => {
    const rng = seededRandom(42);
    const islets = Array.from({ length: 35 }, () => ({
      x: (rng() - 0.5) * 4200,
      y: (rng() - 0.5) * 4200,
      size: 18 + rng() * 20,
      hue: 82 + rng() * 45,
      rot: rng() * 70 - 35,
    }));
    const buoys = Array.from({ length: 14 }, (_, i) => ({
      x: (rng() - 0.5) * 3900,
      y: (rng() - 0.5) * 3900,
      size: 10 + rng() * 8,
      color: ["#ff4f58", "#ffd166", "#06d6a0", "#3fc7ff"][i % 4],
      delay: rng() * 2,
    }));
    const rocks = Array.from({ length: 10 }, () => ({
      x: (rng() - 0.5) * 4200,
      y: (rng() - 0.5) * 4200,
      size: 12 + rng() * 18,
      shade: 120 + rng() * 70,
    }));
    return { islets, buoys, rocks };
  }, []);

  const clouds = useMemo(() => {
    const rng = seededRandom(77);
    return Array.from({ length: 6 }, () => ({
      x: (rng() - 0.5) * 4500,
      y: (rng() - 0.5) * 4500,
      size: 80 + rng() * 100,
      delay: rng() * 20,
      opacity: 0.42 + rng() * 0.28,
    }));
  }, []);

  const routeCurves = useMemo<RouteCurve[]>(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const sectorGroups: Record<string, Mission[]> = {};
    missions.forEach((m) => {
      if (!sectorGroups[m.sector]) sectorGroups[m.sector] = [];
      sectorGroups[m.sector].push(m);
    });

    Object.values(sectorGroups).forEach((group) => {
      // Chronological order by chronoOrder; locked missions (no date) are excluded from the path.
      const ordered = group
        .filter((m) => m.chronoOrder != null)
        .sort((a, b) => (a.chronoOrder ?? 0) - (b.chronoOrder ?? 0));
      if (ordered.length === 0) return;
      lines.push({ x1: 0, y1: 0, x2: ordered[0].position.x, y2: ordered[0].position.y, color: ordered[0].sectorColor });
      for (let i = 0; i < ordered.length - 1; i++) {
        lines.push({
          x1: ordered[i].position.x,
          y1: ordered[i].position.y,
          x2: ordered[i + 1].position.x,
          y2: ordered[i + 1].position.y,
          color: ordered[i].sectorColor,
        });
      }
    });

    return lines.map((line, i) => {
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const ux = dx / len;
      const uy = dy / len;
      const startRadius = line.x1 === 0 && line.y1 === 0 ? 0 : SAFE_ROUTE_RADIUS;
      const endRadius = SAFE_ROUTE_RADIUS;
      const sx = line.x1 + ux * startRadius + HALF;
      const sy = line.y1 + uy * startRadius + HALF;
      const ex = line.x2 - ux * endRadius + HALF;
      const ey = line.y2 - uy * endRadius + HALF;
      const bend = (i % 2 === 0 ? 1 : -1) * 82;
      const cx = (sx + ex) / 2 + -uy * bend;
      const cy = (sy + ey) / 2 + ux * bend;
      return { color: line.color, d: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}` };
    });
  }, []);

  const edgeFog = useMemo(() => {
    const rng = seededRandom(111);
    const span = WORLD_BOUNDS - 100;
    return Array.from({ length: 16 }, (_, i) => {
      const side = i % 4;
      if (side === 0) return { x: -span + rng() * span * 2, y: -WORLD_BOUNDS, size: 160 + rng() * 140 };
      if (side === 1) return { x: -span + rng() * span * 2, y: WORLD_BOUNDS, size: 160 + rng() * 140 };
      if (side === 2) return { x: -WORLD_BOUNDS, y: -span + rng() * span * 2, size: 160 + rng() * 140 };
      return { x: WORLD_BOUNDS, y: -span + rng() * span * 2, size: 160 + rng() * 140 };
    });
  }, []);

  const fish = useMemo(() => {
    const rng = seededRandom(888);
    return Array.from({ length: 6 }, (_, i) => ({
      x: (rng() - 0.5) * 2600,
      y: (rng() - 0.5) * 2600,
      scale: 0.75 + rng() * 0.75,
      speed: 7 + rng() * 10,
      delay: rng() * 12,
      color: `hsl(${180 + rng() * 35}, 78%, ${52 + rng() * 18}%)`,
      flip: i % 2 === 0 ? 1 : -1,
    }));
  }, []);

  const midDebris = useMemo(() => {
    const rng = seededRandom(555);
    const driftAnims = ["mechDrift1", "mechDrift2", "mechDrift3"];
    return Array.from({ length: 20 }, (_, i) => ({
      x: (rng() - 0.5) * (MID_SIZE - 200),
      y: (rng() - 0.5) * (MID_SIZE - 200),
      size: 12 + rng() * 18,
      anim: driftAnims[i % 3],
      delay: rng() * 12,
      opacity: 0.13 + rng() * 0.2,
      color: rng() > 0.5 ? "#facc15" : "#cbd5e1",
    }));
  }, []);

  const fgParticles = useMemo(() => {
    const rng = seededRandom(666);
    const kinds = ["spark", "steam", "drop"] as const;
    return Array.from({ length: 12 }, (_, i) => ({
      x: (rng() - 0.5) * (FG_SIZE - 200),
      y: (rng() - 0.5) * (FG_SIZE - 200),
      size: 10 + rng() * 16,
      delay: rng() * 10,
      opacity: 0.1 + rng() * 0.16,
      kind: kinds[i % 3],
    }));
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.32) 0 7%, transparent 18%), radial-gradient(circle at 82% 22%, rgba(255,214,102,0.22) 0 8%, transparent 19%), linear-gradient(160deg, #54d8e8 0%, #2fb6ca 30%, #1689a6 62%, #075166 100%)",
      }}
    >
      <div
        ref={paralaxBgRef}
        className="absolute pointer-events-none"
        style={{ width: BG_SIZE, height: BG_SIZE, left: "50%", top: "50%", willChange: "transform", zIndex: 1 }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "repeating-linear-gradient(135deg, transparent 0 44px, rgba(255,255,255,0.38) 45px, transparent 48px)",
            animation: "deepWave 7s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 2px)", backgroundSize: "90px 90px" }}
        />
      </div>

      <div
        ref={paralaxMidRef}
        className="absolute pointer-events-none"
        style={{ width: MID_SIZE, height: MID_SIZE, left: "50%", top: "50%", willChange: "transform", zIndex: 2 }}
      >
        {midDebris.map((item, i) => (
          <div
            key={`debris-${i}`}
            className="absolute rounded-sm"
            style={{
              left: item.x + MID_SIZE / 2,
              top: item.y + MID_SIZE / 2,
              width: item.size,
              height: item.size * 0.55,
              opacity: item.opacity,
              transform: "translate(-50%, -50%)",
              animation: `${item.anim} ${18 + (i % 7) * 4}s linear infinite`,
              animationDelay: `${item.delay}s`,
              background: item.color,
              border: "2px solid rgba(255,255,255,0.25)",
              boxShadow: "0 5px 10px rgba(0,0,0,0.14)",
            }}
          />
        ))}
      </div>

      <div
        ref={paralaxFgRef}
        className="absolute pointer-events-none"
        style={{ width: FG_SIZE, height: FG_SIZE, left: "50%", top: "50%", willChange: "transform", zIndex: 5 }}
      >
        {fgParticles.map((item, i) => (
          <div
            key={`fg-${i}`}
            className="absolute rounded-full"
            style={{
              left: item.x + FG_SIZE / 2,
              top: item.y + FG_SIZE / 2,
              width: item.kind === "spark" ? item.size * 0.55 : item.size,
              height: item.kind === "steam" ? item.size * 0.7 : item.size,
              opacity: item.opacity,
              transform: "translate(-50%, -50%)",
              animation: `mechDrift${(i % 3) + 1} ${15 + (i % 5) * 3}s linear infinite`,
              animationDelay: `${item.delay}s`,
              background: item.kind === "spark" ? "#ffd166" : item.kind === "drop" ? "#b6f3ff" : "rgba(255,255,255,0.78)",

            }}
          />
        ))}
      </div>

      <div
        ref={worldRef}
        className="absolute"
        style={{ width: WORLD_SIZE, height: WORLD_SIZE, left: "50%", top: "50%", willChange: "transform", transform: "translate3d(0,0,0)", zIndex: 3 }}
      >
        <div className="absolute rounded-[50%]" style={{ left: HALF - 1450, top: HALF - 1350, width: 1100, height: 900, background: "radial-gradient(ellipse, rgba(255,145,77,0.26) 0%, rgba(255,145,77,0.08) 55%, transparent 78%)" }} />
        <div className="absolute rounded-[50%]" style={{ left: HALF + 300, top: HALF - 1350, width: 1200, height: 900, background: "radial-gradient(ellipse, rgba(255,220,109,0.24) 0%, rgba(255,220,109,0.08) 55%, transparent 78%)" }} />
        <div className="absolute rounded-[50%]" style={{ left: HALF - 1450, top: HALF + 200, width: 1050, height: 850, background: "radial-gradient(ellipse, rgba(248,113,113,0.22) 0%, rgba(248,113,113,0.07) 55%, transparent 78%)" }} />
        <div className="absolute rounded-[50%]" style={{ left: HALF + 150, top: HALF + 220, width: 1250, height: 900, background: "radial-gradient(ellipse, rgba(192,132,252,0.23) 0%, rgba(192,132,252,0.08) 55%, transparent 78%)" }} />
        <div className="absolute rounded-full" style={{ left: HALF - 160, top: HALF - 160, width: 320, height: 320, background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(77,213,232,0.08) 52%, transparent 72%)" }} />

        <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 2px)", backgroundSize: "58px 58px" }} />

        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox={`0 0 ${WORLD_SIZE} ${WORLD_SIZE}`}>
          {routeCurves.map((route, i) => {
            return (
              <g key={i}>
                <path d={route.d} stroke="rgba(3,20,30,0.16)" strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d={route.d} stroke="rgba(255,255,255,0.48)" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d={route.d} stroke={route.color} strokeWidth="4" strokeLinecap="round" strokeDasharray="18 22" opacity="0.68" fill="none" />
              </g>
            );
          })}
        </svg>

        {decor.islets.map((t, i) => (
          <div key={`islet-${i}`} className="absolute pointer-events-none" style={{ left: t.x + HALF, top: t.y + HALF, transform: "translate(-50%, -50%)" }}>
            <div
              className="rounded-[45%] shadow-md"
              style={{
                width: t.size * 1.9,
                height: t.size,
                background: `linear-gradient(145deg, hsl(${t.hue}, 45%, 56%), hsl(${t.hue}, 45%, 34%))`,
                border: "2px solid rgba(75,55,25,0.35)",
                transform: `rotate(${t.rot}deg)`,
              }}
            />
          </div>
        ))}

        {decor.buoys.map((b, i) => (
          <div key={`buoy-${i}`} className="absolute pointer-events-none" style={{ left: b.x + HALF, top: b.y + HALF, transform: "translate(-50%, -50%)", animation: `float ${2.5 + (i % 4) * 0.4}s ease-in-out infinite`, animationDelay: `${b.delay}s` }}>
            <div
              className="rounded-full shadow-lg"
              style={{
                width: b.size,
                height: b.size,
                background: `linear-gradient(145deg, #fff, ${b.color})`,
                border: "2px solid rgba(255,255,255,0.72)",
                boxShadow: `0 0 12px ${b.color}66`,
              }}
            />
            <div className="mx-auto h-5 w-0.5 bg-white/40" />
          </div>
        ))}

        {decor.rocks.map((r, i) => (
          <div
            key={`rock-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: r.x + HALF,
              top: r.y + HALF,
              width: r.size,
              height: r.size * 0.65,
              borderRadius: "35% 40% 45% 30%",
              background: `rgb(${r.shade}, ${r.shade - 10}, ${r.shade - 22})`,
              boxShadow: "1px 4px 8px rgba(0,0,0,0.2)",
            }}
          />
        ))}

        {hazardZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: zone.position.x + HALF - zone.radius,
              top: zone.position.y + HALF - zone.radius,
              width: zone.radius * 2,
              height: zone.radius * 2,
              border: zone.type === "thermal" ? "3px dashed rgba(255,116,54,0.5)" : "3px dashed rgba(124,92,255,0.42)",
              background: zone.type === "thermal"
                ? "radial-gradient(circle, rgba(255,134,54,0.25), rgba(255,134,54,0.06) 55%, transparent 72%)"
                : "radial-gradient(circle, rgba(124,92,255,0.2), rgba(124,92,255,0.05) 55%, transparent 72%)",
              animation: zone.type === "thermal" ? "thermalPulse 1.6s ease-in-out infinite" : "pressureCompress 2s ease-in-out infinite",
              zIndex: 4,
            }}
          />
        ))}

        {missions.filter((mission) => mission.status === "active").map((mission) => {
          const radius = (mission.fieldRadius ?? 250) * 1.28;
          return (
            <div
              key={`current-${mission.id}`}
              className={`absolute pointer-events-none rounded-full ${nearbyIsland?.id === mission.id ? "game-current-ring" : "game-current-ring game-current-ring--calm"}`}
              style={{
                left: mission.position.x + HALF - radius,
                top: mission.position.y + HALF - radius,
                width: radius * 2,
                height: radius * 2,
                borderColor: `${mission.color}44`,
                ["--current-color" as string]: mission.color,
              }}
            >
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
            </div>
          );
        })}

        {missions.filter((mission) => mission.status === "active").map((mission) => (
          <div
            key={`barrier-${mission.id}`}
            className="island-barrier absolute pointer-events-none rounded-full"
            style={{
              left: mission.position.x + HALF - ISLAND_VISIBLE_BARRIER_RADIUS,
              top: mission.position.y + HALF - ISLAND_VISIBLE_BARRIER_RADIUS,
              width: ISLAND_VISIBLE_BARRIER_RADIUS * 2,
              height: ISLAND_VISIBLE_BARRIER_RADIUS * 2,
              borderColor: `${mission.color}b8`,
              ["--barrier-color" as string]: mission.color,
            }}
          >
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-slate-950/65 px-2 py-0.5 font-label text-[7px] font-black uppercase tracking-[0.16em] text-cyan-50/72">
              no-sail
            </span>
          </div>
        ))}

        {fish.map((f, i) => (
          <div key={`fish-${i}`} className="absolute pointer-events-none" style={{ left: f.x + HALF, top: f.y + HALF, transform: `translate(-50%, -50%) scale(${f.scale})`, animation: `fishSwim ${f.speed}s linear infinite`, animationDelay: `${f.delay}s`, zIndex: 12 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", transform: `scaleX(${f.flip})` }}>
              <span className="h-3 w-5 rounded-full border border-white/45 bg-cyan-300/70" />
              <div style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `9px solid ${f.color}`, marginLeft: 1 }} />
            </div>
          </div>
        ))}

        {collectibles.map((item) => {
          if (collectedItems.has(item.id)) return null;
          const isCoin = item.type === "coin";
          return (
            <div
              key={item.id}
              className="absolute pointer-events-none"
              style={{
                left: item.position.x + HALF,
                top: item.position.y + HALF,
                transform: "translate(-50%, -50%)",
                animation: isCoin ? `float ${2.8 + ((item.position.x * 7) % 1.5)}s ease-in-out infinite` : `float ${3.5 + ((item.position.y * 5) % 1.2)}s ease-in-out infinite`,
                zIndex: 15,
              }}
            >
              {isCoin ? (
                <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-white/55 bg-gradient-to-br from-yellow-200 to-amber-600 shadow-[0_0_12px_rgba(255,215,0,0.72)]">
                  <span className="text-[9px] font-black text-yellow-950">$</span>
                </div>
              ) : (
                <div className="grid h-8 w-10 place-items-center rounded-lg border-2 border-cyan-100/60 bg-gradient-to-br from-cyan-200 to-blue-600 shadow-[0_0_14px_rgba(125,211,252,0.85)]">
                  <span className="h-3 w-4 rotate-45 rounded-sm bg-cyan-100 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
                </div>
              )}
            </div>
          );
        })}

        {barrels.map((barrel) => (
          <div key={barrel.id} className="absolute pointer-events-none" style={{ left: barrel.position.x + HALF, top: barrel.position.y + HALF, transform: "translate(-50%, -50%)", zIndex: 14 }}>
            <div className="h-12 w-12 rounded-full border-4 border-orange-200 bg-gradient-to-br from-red-500 to-red-800 shadow-xl">
              <div className="mx-auto mt-2 h-2 w-7 rounded bg-yellow-300/80" />
              <div className="mx-auto mt-3 h-2 w-7 rounded bg-yellow-300/80" />
            </div>
          </div>
        ))}

        {clouds.map((c, i) => (
          <div key={`cloud-${i}`} className="absolute pointer-events-none" style={{ left: c.x + HALF, top: c.y + HALF, width: c.size, height: c.size * 0.45, opacity: c.opacity * 0.55, animation: `cloudDrift ${22 + (i % 4) * 4}s linear infinite`, animationDelay: `${c.delay}s`, zIndex: 25 }}>
            <div className="relative h-full w-full">
              <div className="absolute rounded-full bg-white/50" style={{ left: "10%", top: "30%", width: "45%", height: "70%" }} />
              <div className="absolute rounded-full bg-white/60" style={{ left: "30%", top: "10%", width: "50%", height: "80%" }} />
              <div className="absolute rounded-full bg-white/45" style={{ left: "55%", top: "25%", width: "35%", height: "60%" }} />
            </div>
          </div>
        ))}

        {edgeFog.map((ec, i) => (
          <div key={`edge-fog-${i}`} className="absolute pointer-events-none rounded-full" style={{ left: ec.x + HALF - ec.size / 2, top: ec.y + HALF - ec.size / 2, width: ec.size, height: ec.size * 0.6, background: "radial-gradient(ellipse, rgba(10,22,40,0.56) 0%, rgba(10,22,40,0.16) 52%, transparent 72%)", zIndex: 26 }} />
        ))}

        {fogZones.map((zone, i) => (
          <div
            key={`fog-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: zone.x + HALF - zone.size / 2,
              top: zone.y + HALF - zone.size / 2,
              width: zone.size,
              height: zone.size,
              background: "radial-gradient(ellipse, rgba(5,15,30,0.82) 0%, rgba(10,22,40,0.58) 40%, rgba(10,20,35,0.24) 70%, transparent 100%)",
              transition: "opacity 1.8s ease-out",
              opacity: fogRevealedZones.has(i) ? 0 : 0.9,
              zIndex: 24,
            }}
          />
        ))}

        <div className="absolute flex flex-col items-center" style={{ left: HALF, top: HALF, transform: "translate(-50%, -50%)", zIndex: 10 }}>
          <div className="flex h-36 w-36 items-center justify-center rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(0,180,215,0.18) 48%, transparent 72%)", boxShadow: "0 0 35px rgba(255,255,255,0.18)" }}>
            <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border-4 border-amber-100 bg-amber-300 shadow-xl" style={{ transform: "rotateX(54deg) rotateZ(-45deg)" }}>
              <div className="h-9 w-9 rounded bg-red-500 shadow-inner" />
            </div>
          </div>
          <span className="mt-1 rounded-lg border border-white/40 bg-slate-950/55 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white drop-shadow-lg">Home Port</span>
          <span className="mt-1 rounded-full bg-cyan-400/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-100">Tap Dock / Enter</span>
        </div>

        {missions.map((mission, index) => (
          <div key={mission.id} style={{ position: "absolute", left: HALF, top: HALF }}>
            <Island
              mission={mission}
              isNearby={nearbyIsland?.id === mission.id}
              isVisited={visitedIds.has(mission.id)}
              index={index}
              onClick={() => onIslandClick(mission)}
            />
          </div>
        ))}

        <SectorLabel label="Internship Shores" x={-900} y={-780} color="#ff914d" />
        <SectorLabel label="Aero Atoll" x={1000} y={-700} color="#facc15" />
        <SectorLabel label="Robotics & IoT" x={-800} y={750} color="#f87171" />
        <SectorLabel label="Code Cove" x={750} y={800} color="#c084fc" />
      </div>
    </div>
  );
});

export default GameWorld;

function SectorLabel({ label, x, y, color }: { label: string; x: number; y: number; color: string }) {
  return (
    <div className="absolute font-headline flex flex-col items-center gap-1 select-none pointer-events-none" style={{ left: x + WORLD_SIZE / 2, top: y + WORLD_SIZE / 2, transform: "translate(-50%, -50%)" }}>
      <span className="h-2 w-[104px] rounded-full" style={{ background: color, opacity: 0.18, boxShadow: `0 0 20px ${color}` }} />
      <span className="text-2xl font-black uppercase tracking-[0.25em]" style={{ color, opacity: 0.18, textShadow: `0 0 20px ${color}` }}>{label}</span>
    </div>
  );
}
