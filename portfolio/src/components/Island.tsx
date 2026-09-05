"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Mission } from "@/data/missions";

interface IslandProps {
  mission: Mission;
  isNearby: boolean;
  isVisited: boolean;
  index: number;
  onClick?: () => void;
}

const HV_BOLT_POSITIONS = [
  { top: "-26px", left: "50%", transform: "translateX(-50%)" },
  { top: "50%", right: "-26px", transform: "translateY(-50%)" },
  { bottom: "-26px", left: "50%", transform: "translateX(-50%)" },
  { top: "50%", left: "-26px", transform: "translateY(-50%)" },
];

function islandTheme(mission: Mission) {
  if (mission.sector.includes("Internship")) {
    return {
      turf: "#ffb45c",
      turfDark: "#d87925",
      trim: "#7c3f18",
      detail: mission.color,
      water: "rgba(255, 180, 92, 0.2)",
    };
  }
  if (mission.sector.includes("Aero")) {
    return {
      turf: "#d9c785",
      turfDark: "#a6863e",
      trim: "#6f5a2b",
      detail: mission.color,
      water: "rgba(250, 204, 21, 0.2)",
    };
  }
  if (mission.sector.includes("Robotics")) {
    return {
      turf: "#e07a6a",
      turfDark: "#9f2d2d",
      trim: "#5b1d1d",
      detail: mission.color,
      water: "rgba(248, 113, 113, 0.18)",
    };
  }
  return {
    turf: "#b985e8",
    turfDark: "#6f3ba4",
    trim: "#3d2460",
    detail: mission.color,
    water: "rgba(192, 132, 252, 0.18)",
  };
}

function Landmark({ mission }: { mission: Mission }) {
  const type = useMemo(() => {
    const title = `${mission.title} ${mission.subtitle}`.toLowerCase();
    if (title.includes("tesla") || title.includes("cell")) return "factory";
    if (title.includes("lockheed") || title.includes("ship")) return "shipyard";
    if (title.includes("water") || title.includes("montreal")) return "lab";
    if (title.includes("robot") || title.includes("nursie") || title.includes("resq")) return "robotics";
    if (title.includes("lunar") || title.includes("aero") || title.includes("star")) return "rocket";
    if (title.includes("pump") || title.includes("mech")) return "machine";
    return "code";
  }, [mission.title, mission.subtitle]);

  if (type === "factory") {
    return (
      <div className="absolute left-1/2 top-[44%] h-20 w-28 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute bottom-0 left-2 h-11 w-[72px] rounded-md bg-slate-700 shadow-[inset_0_3px_0_rgba(255,255,255,0.18)]" />
        <div className="absolute bottom-0 right-2 h-14 w-14 rounded-md bg-red-600 shadow-[inset_0_3px_0_rgba(255,255,255,0.18)]" />
        <div className="absolute bottom-14 right-5 h-9 w-4 rounded-sm bg-slate-800" />
        <div className="absolute bottom-[60px] right-4 h-4 w-6 rounded-full bg-white/45 blur-[1px] animate-[bubbleRise_2.4s_ease-out_infinite]" />
        {[14, 34, 54, 82].map((left) => (
          <div key={left} className="absolute bottom-4 h-3 w-3 rounded-sm bg-cyan-200/90" style={{ left }} />
        ))}
      </div>
    );
  }

  if (type === "shipyard") {
    return (
      <div className="absolute left-1/2 top-[43%] h-20 w-[120px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute bottom-1 left-4 h-9 w-[88px] rounded-b-[28px] rounded-t-md bg-slate-700 shadow-xl" />
        <div className="absolute bottom-8 left-9 h-6 w-12 rounded-sm bg-slate-200" />
        <div className="absolute bottom-[52px] left-[60px] h-10 w-1.5 bg-amber-600" />
        <div className="absolute bottom-[72px] left-[60px] h-1.5 w-24 origin-left rotate-[18deg] bg-amber-500" />
        <div className="absolute bottom-2 left-7 h-2 w-3 rounded-sm bg-cyan-300" />
        <div className="absolute bottom-2 left-14 h-2 w-3 rounded-sm bg-cyan-300" />
      </div>
    );
  }

  if (type === "lab") {
    return (
      <div className="absolute left-1/2 top-[44%] h-20 w-28 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute bottom-0 left-5 h-12 w-[72px] rounded-lg bg-white shadow-xl" />
        <div className="absolute bottom-9 left-8 h-9 w-4 rounded-b-full bg-cyan-300" />
        <div className="absolute bottom-9 left-[60px] h-9 w-4 rounded-b-full bg-sky-400" />
        <div className="absolute bottom-16 left-6 h-2 w-[72px] rounded-full bg-slate-600" />
        <div className="absolute bottom-3 left-9 h-3 w-10 rounded-sm bg-slate-200" />
      </div>
    );
  }

  if (type === "rocket") {
    return (
      <div className="absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute bottom-2 left-1/2 h-[68px] w-9 -translate-x-1/2 rounded-t-full rounded-b-md bg-white shadow-xl" />
        <div className="absolute bottom-[52px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-cyan-300" />
        <div className="absolute bottom-2 left-6 h-7 w-4 skew-x-[-18deg] rounded-sm bg-red-500" />
        <div className="absolute bottom-2 right-6 h-7 w-4 skew-x-[18deg] rounded-sm bg-red-500" />
        <div className="absolute bottom-0 left-1/2 h-7 w-5 -translate-x-1/2 rounded-full bg-orange-300 blur-[2px]" />
      </div>
    );
  }

  if (type === "robotics") {
    return (
      <div className="absolute left-1/2 top-[44%] h-20 w-24 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute bottom-1 left-1/2 h-12 w-16 -translate-x-1/2 rounded-lg bg-slate-200 shadow-xl" />
        <div className="absolute bottom-12 left-1/2 h-9 w-12 -translate-x-1/2 rounded-lg bg-slate-100" />
        <div className="absolute bottom-[68px] left-1/2 h-5 w-1 -translate-x-1/2 bg-slate-600" />
        <div className="absolute bottom-[84px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-400" />
        <div className="absolute bottom-16 left-8 h-2.5 w-2.5 rounded-full bg-cyan-500" />
        <div className="absolute bottom-16 right-8 h-2.5 w-2.5 rounded-full bg-cyan-500" />
      </div>
    );
  }

  if (type === "machine") {
    return (
      <div className="absolute left-1/2 top-[44%] h-20 w-24 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute bottom-4 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-slate-600 shadow-xl animate-[gearSpin_9s_linear_infinite]" />
        <div className="absolute bottom-8 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-slate-300" />
        <div className="absolute bottom-11 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300" />
        {[0, 45, 90, 135].map((r) => (
          <div key={r} className="absolute bottom-11 left-1/2 h-3 w-[88px] -translate-x-1/2 rounded-full bg-slate-700" style={{ transform: `translateX(-50%) rotate(${r}deg)` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute left-1/2 top-[44%] h-20 w-28 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute bottom-0 left-4 h-12 w-20 rounded-lg bg-slate-900 shadow-xl" />
      <div className="absolute bottom-4 left-8 h-4 w-12 rounded bg-cyan-400/80 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
      <div className="absolute bottom-[52px] left-11 h-5 w-5 rounded-md bg-purple-400" />
      <div className="absolute bottom-[52px] right-9 h-5 w-5 rounded-md bg-emerald-400" />
      <div className="absolute bottom-2 left-9 h-1 w-10 rounded-full bg-cyan-200/70" />
    </div>
  );
}

export default function Island({ mission, isNearby, isVisited, index, onClick }: IslandProps) {
  const isLocked = mission.status === "locked";
  const isTesla = mission.id === "I-1";
  const theme = islandTheme(mission);
  const [hopCount, setHopCount] = useState(0);

  useEffect(() => {
    if (isNearby && !isLocked) setHopCount((c) => c + 1);
  }, [isNearby, isLocked]);

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: mission.position.x,
        top: mission.position.y,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.div
        key={`hop-${hopCount}`}
        animate={hopCount > 0 ? { scale: [1, 1.04, 0.97, 1.02, 1], y: [0, 4, -15, -4, 0] } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative flex flex-col items-center">
          <div
            className="absolute top-[88px] h-20 w-[216px] rounded-[50%] blur-sm"
            style={{ background: "rgba(4, 23, 34, 0.34)", transform: "translateY(42px)" }}
          />

          {isVisited && !isLocked && (
            <div className="absolute -top-8 left-1/2 z-30 -translate-x-1/2">
              <div className="grid h-8 w-8 place-items-center rounded-full border border-amber-200 bg-amber-400 text-xs font-black text-amber-950 shadow-lg">
                OK
              </div>
            </div>
          )}

          {isLocked && !isTesla && (
            <div className="absolute -top-20 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap">
              <div
                className="grid h-16 w-16 place-items-center rounded-full border-4 border-red-400/70 bg-slate-950/90 text-4xl font-black text-red-200 shadow-[0_0_24px_rgba(248,113,113,0.55)]"
                style={{ animation: "hvPulse 1.8s ease-in-out infinite" }}
              >
                ?
              </div>
            </div>
          )}

          {isTesla && (
            <>
              <div className="absolute -top-10 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap">
                <div
                  className="rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg"
                  style={{
                    background: "rgba(31, 18, 2, 0.92)",
                    borderColor: "#ffee00",
                    color: "#fff59d",
                    boxShadow: "0 0 10px #ffee0066",
                    animation: "hvPulse 1.4s ease-in-out infinite",
                  }}
                >
                  High voltage · Sector restricted
                </div>
              </div>
              <div className="absolute z-0 rounded-[28px]" style={{ inset: "-20px", border: "3px solid #ffee00", animation: "hvPulse 1.8s ease-in-out infinite" }} />
              {HV_BOLT_POSITIONS.map((pos, bi) => (
                <div key={bi} className="absolute z-30 h-4 w-4 select-none rounded-full bg-yellow-300 shadow-[0_0_14px_#ffee00]" style={{ ...pos, animation: `hvZap 2s ${bi * 0.5}s infinite` }} />
              ))}
            </>
          )}

          {isNearby && !isLocked && (
            <div
              className="absolute -inset-8 z-0 rounded-[32px]"
              style={{ boxShadow: `0 0 0 5px rgba(255,255,255,0.45), 0 0 42px ${mission.color}aa` }}
            />
          )}

          <div
            className={`relative h-44 w-[216px] overflow-visible transition-all duration-300 ${isLocked ? "grayscale-[65%] opacity-80" : ""}`}
            style={{ transform: "rotateX(52deg) rotateZ(-45deg)" }}
          >
            <div
              className="absolute inset-3 rounded-[30px] shadow-[0_22px_0_rgba(44,24,10,0.55),0_30px_30px_rgba(0,0,0,0.22)]"
              style={{
                background: `linear-gradient(145deg, ${theme.turf}, ${theme.turfDark})`,
                border: `6px solid ${theme.trim}`,
              }}
            />
            <div
              className="absolute inset-8 rounded-[24px] opacity-70"
              style={{
                background: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.38), transparent 24%), radial-gradient(circle at 70% 70%, ${theme.detail}66, transparent 38%)`,
              }}
            />
            <div className="absolute left-12 top-12 h-4 w-24 rounded-full bg-white/20" />
            <div className="absolute bottom-8 right-10 h-5 w-[72px] rounded-full bg-black/10" />
          </div>

          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
            <Landmark mission={mission} />
          </div>

          {mission.logo && (
            <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2">
              <div className="grid h-14 w-20 place-items-center overflow-hidden rounded-md border border-white/50 bg-white/95 p-1.5 shadow-xl">
                <img src={mission.logo} alt={`${mission.title} logo`} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          )}

          <div className="absolute -bottom-3 flex flex-col items-center">
            <div
              className="max-w-[190px] rounded-lg border px-3 py-1.5 text-center text-sm font-black shadow-xl"
              style={{
                background: isLocked ? "rgba(15,23,42,0.9)" : "rgba(255,249,230,0.97)",
                color: isLocked ? "#94a3b8" : mission.color,
                borderColor: isLocked ? "rgba(148,163,184,0.25)" : `${mission.color}55`,
              }}
            >
              {mission.title}
            </div>
            <span
              className="mt-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
              style={{ color: "#fff9e6", background: `${mission.sectorColor}dd` }}
            >
              {mission.sector}
            </span>
            {!isLocked && mission.date && (
              <span
                className="mt-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-black tracking-wide shadow"
                style={{
                  color: isTesla ? "#1f1202" : "#1f2937",
                  background: isTesla ? "#fff59d" : "rgba(255,249,230,0.97)",
                  borderColor: isTesla ? "#ffee00" : `${mission.color}55`,
                  boxShadow: isTesla ? "0 0 10px #ffee0066" : undefined,
                }}
              >
                {mission.date}
              </span>
            )}
          </div>

          {isNearby && !isLocked && (
            <div className="absolute -bottom-14">
              <div className="animate-bounce rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                Enter to inspect
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
