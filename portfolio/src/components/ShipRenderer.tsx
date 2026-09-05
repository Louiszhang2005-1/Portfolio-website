"use client";

import React from "react";
import { motion } from "framer-motion";
import { StressState, FEA_ZONE_COUNT, stressToColor } from "@/systems/StressSystem";

interface ShipRendererProps {
  boatHeadingRef: React.RefObject<HTMLDivElement | null>;
  speed: number;
  boatSquash?: boolean;
  stressState: StressState;
  inHazard?: boolean;
}

const MAX_SPEED = 5.1;

const ShipRenderer = React.memo(function ShipRenderer({
  boatHeadingRef,
  speed,
  boatSquash,
  stressState,
  inHazard,
}: ShipRendererProps) {
  const isMoving = speed > 0.3;
  const throttle = Math.min(1, speed / MAX_SPEED);
  const isHighSpeed = throttle > 0.6;
  const wakeW = 74 + throttle * 78;
  const wakeH = 30 + throttle * 24;

  const feaSegments = Array.from({ length: FEA_ZONE_COUNT }, (_, i) => {
    const startAngle = (i / FEA_ZONE_COUNT) * 360;
    const endAngle = ((i + 1) / FEA_ZONE_COUNT) * 360;
    const stress = stressState.zones[i] || 0;
    return {
      startAngle,
      endAngle,
      stress,
      color: stressToColor(stress),
      isImpact: stressState.impactFlash > 0 && stressState.impactZone === i,
    };
  });

  return (
    <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {isMoving && (
        <>
          <div
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: wakeW,
              height: wakeH,
              transform: "translate(-50%, 38%)",
              background: `radial-gradient(ellipse, rgba(255,255,255,${0.32 + throttle * 0.35}) 0%, rgba(255,255,255,0.12) 45%, transparent 72%)`,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: wakeW * 1.45,
              height: wakeH * 1.35,
              transform: "translate(-50%, 48%)",
              opacity: throttle * 0.55,
              background: "radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 67%)",
            }}
          />
          {[...Array(isHighSpeed ? 8 : 4)].map((_, fi) => (
            <div
              key={fi}
              className="absolute rounded-full bg-white/70"
              style={{
                width: 4 + fi * 1.4,
                height: 4 + fi * 1.4,
                left: `calc(50% + ${(fi % 2 === 0 ? 1 : -1) * (10 + fi * 5)}px)`,
                top: `calc(50% + ${18 + fi * 7}px)`,
                opacity: 0.55 - fi * 0.05,
                animation: `bubbleRise ${1.4 + fi * 0.34}s ease-out infinite`,
                animationDelay: `${fi * 0.18}s`,
              }}
            />
          ))}
        </>
      )}

      <motion.div
        className="relative flex flex-col items-center"
        style={{ animation: "float 2.6s ease-in-out infinite" }}
        animate={boatSquash ? { scaleX: [1, 1.28, 0.82, 1.08, 1], scaleY: [1, 0.72, 1.16, 0.94, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.48, ease: "easeOut" }}
      >
        {isMoving && (
          <>
            <div className="absolute -top-6 left-[38%] h-3 w-3 rounded-full bg-white/55" style={{ animation: "bubbleRise 1.25s ease-out infinite" }} />
            <div className="absolute -top-7 left-[52%] h-4 w-4 rounded-full bg-white/45" style={{ animation: "bubbleRise 1.35s ease-out infinite 0.45s" }} />
          </>
        )}

        <div ref={boatHeadingRef} className="relative flex h-32 w-32 items-center justify-center" style={{ willChange: "transform" }}>
          <svg className="absolute inset-0 pointer-events-none" viewBox="-50 -50 100 100" width="128" height="128" style={{ overflow: "visible" }}>
            {feaSegments.map((seg, i) => {
              if (seg.stress < 3) return null;
              const r = 37;
              const startRad = ((seg.startAngle - 90) * Math.PI) / 180;
              const endRad = ((seg.endAngle - 90) * Math.PI) / 180;
              const x1 = Math.cos(startRad) * r;
              const y1 = Math.sin(startRad) * r;
              const x2 = Math.cos(endRad) * r;
              const y2 = Math.sin(endRad) * r;
              const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
              return (
                <path
                  key={i}
                  d={`M0,0 L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={seg.color}
                  style={{ animation: seg.isImpact ? "stressGlow 0.3s ease-in-out infinite" : undefined }}
                />
              );
            })}
          </svg>

          <div className="absolute h-28 w-[92px]" style={{ filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.32))" }}>
            <div
              className="absolute inset-x-2 bottom-1 h-[100px] rounded-t-[34px] rounded-b-[45%]"
              style={{
                background: inHazard
                  ? "linear-gradient(180deg, #b95f22 0%, #7a3517 62%, #4d2010 100%)"
                  : "linear-gradient(180deg, #16a3b8 0%, #087c87 58%, #07505d 100%)",
                border: "4px solid rgba(255,255,255,0.38)",
                boxShadow: "inset 0 5px 0 rgba(255,255,255,0.22), inset 0 -8px 0 rgba(0,0,0,0.16)",
                transition: "background 0.35s ease",
              }}
            />
            <div className="absolute left-1/2 top-0 h-8 w-11 -translate-x-1/2 rounded-t-full bg-red-500 shadow-[inset_0_4px_0_rgba(255,255,255,0.2)]" />
            <div className="absolute left-1/2 top-10 h-8 w-[52px] -translate-x-1/2 rounded-lg bg-amber-100 shadow-md">
              <div className="mx-auto mt-1 flex w-9 justify-between">
                <span className="h-3 w-3 rounded-sm bg-cyan-400 shadow-inner" />
                <span className="h-3 w-3 rounded-sm bg-cyan-400 shadow-inner" />
              </div>
            </div>
            <div className="absolute left-5 top-[76px] h-6 w-6 rounded-md bg-yellow-400 shadow-md" />
            <div className="absolute right-5 top-[76px] h-6 w-6 rounded-md bg-emerald-400 shadow-md" />
            <div className="absolute left-1/2 bottom-4 h-3 w-11 -translate-x-1/2 rounded-full bg-orange-300" />
            <div className="absolute left-1/2 top-6 h-16 w-1 -translate-x-1/2 bg-slate-800" />
            <div className="absolute left-[52%] top-7 h-7 w-9 rounded-r-md bg-red-500 shadow-md" style={{ transformOrigin: "left center", animation: "flagWave 1.6s ease-in-out infinite" }}>
              <div className="grid h-full place-items-center text-[6px] font-black leading-none text-white">LZ</div>
            </div>
          </div>

          <div className="absolute -bottom-2 left-1/2 h-8 w-[104px] -translate-x-1/2 rounded-full opacity-45" style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.58) 0%, transparent 70%)" }} />
        </div>
      </motion.div>

      {!isMoving && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse">
          <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-slate-950/62 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md">
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px]">W/S</span> Thrust
            <span className="text-white/30">/</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px]">A/D</span> Steer
            <span className="text-cyan-200/80 text-[8px]">Slingshot around nodes</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default ShipRenderer;
