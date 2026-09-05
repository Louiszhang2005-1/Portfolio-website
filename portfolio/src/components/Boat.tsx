"use client";

import React from "react";
import { motion } from "framer-motion";

interface BoatProps {
  boatHeadingRef: React.RefObject<HTMLDivElement | null>;
  speed: number;
  boatSquash?: boolean;
}

const MAX_SPEED = 5.5; // mirror constant for throttle calc

/* Memoize — only re-renders when speed crosses movement thresholds */
const Boat = React.memo(function Boat({ boatHeadingRef, speed, boatSquash }: BoatProps) {
  const isMoving = speed > 0.4;
  const throttle = Math.min(1, speed / MAX_SPEED);   // 0-1
  const isHighSpeed = throttle > 0.6;
  const isFullThrottle = throttle > 0.85;

  // Wake ellipse scale: grows with throttle
  const wakeW = 70 + throttle * 60;
  const wakeH = 28 + throttle * 20;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">

      {/* ── Sea-foam wake — 3 layers, scale with throttle ── */}
      {isMoving && (
        <>
          {/* Primary wake ellipse */}
          <div
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: wakeW,
              height: wakeH,
              transform: "translate(-50%, 20%)",
              background: `radial-gradient(ellipse, rgba(255,255,255,${0.25 + throttle * 0.3}) 0%, transparent 70%)`,
            }}
          />
          {/* Secondary wider foam ring */}
          <div
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: wakeW * 1.4,
              height: wakeH * 1.3,
              transform: "translate(-50%, 30%)",
              opacity: throttle * 0.45,
              background: "radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 65%)",
            }}
          />
          {/* Tight turbulent core */}
          <div
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: 22,
              height: 10,
              transform: "translate(-50%, 60%)",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)",
            }}
          />
          {/* Foam particle dots */}
          {[...Array(isHighSpeed ? 6 : 3)].map((_, fi) => (
            <div
              key={fi}
              className="absolute rounded-full bg-white/60"
              style={{
                width: 4 + fi * 1.5,
                height: 4 + fi * 1.5,
                left: `calc(50% + ${(fi % 2 === 0 ? 1 : -1) * (8 + fi * 5)}px)`,
                top: `calc(50% + ${14 + fi * 8}px)`,
                opacity: 0.5 - fi * 0.06,
                animation: `bubbleRise ${1.5 + fi * 0.4}s ease-out infinite`,
                animationDelay: `${fi * 0.22}s`,
              }}
            />
          ))}
        </>
      )}

      {/* ── Boat body with bob + squash-and-stretch on boundary hit ── */}
      <motion.div
        className="relative flex flex-col items-center"
        style={{ animation: "float 2.5s ease-in-out infinite" }}
        animate={boatSquash
          ? { scaleX: [1, 1.35, 0.75, 1.1, 1], scaleY: [1, 0.65, 1.25, 0.9, 1] }
          : { scaleX: 1, scaleY: 1 }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      >

        {/* ── Steam puffs (scale with throttle) ── */}
        {isMoving && (
          <>
            <div className="absolute -top-6 rounded-full bg-white/50"
              style={{ left: "calc(50% - 10px)", width: 8 + throttle * 4, height: 8 + throttle * 4, animation: "bubbleRise 1.2s ease-out infinite" }}
            />
            <div className="absolute -top-6 rounded-full bg-white/50"
              style={{ left: "calc(50% + 5px)", width: 8 + throttle * 4, height: 8 + throttle * 4, animation: "bubbleRise 1.2s ease-out infinite 0.6s" }}
            />
            {isHighSpeed && (
              <>
                <div className="absolute -top-8 rounded-full bg-white/35"
                  style={{ left: "calc(50% - 4px)", width: 12, height: 12, animation: "bubbleRise 0.9s ease-out infinite 0.3s" }}
                />
                <div className="absolute -top-8 rounded-full bg-white/35"
                  style={{ left: "calc(50% + 10px)", width: 10, height: 10, animation: "bubbleRise 0.9s ease-out infinite 0.15s" }}
                />
              </>
            )}
            {isFullThrottle && (
              <div className="absolute -top-10 rounded-full bg-white/25"
                style={{ left: "calc(50% - 2px)", width: 16, height: 16, animation: "bubbleRise 0.7s ease-out infinite 0.45s" }}
              />
            )}
          </>
        )}

        {/* ── Ship hull — heading rotation controlled via ref by game loop ── */}
        <div
          ref={boatHeadingRef}
          className="relative w-28 h-28 flex items-center justify-center"
          style={{ willChange: "transform" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-24 relative">
              {/* Hull */}
              <div className="absolute inset-0 rounded-t-2xl rounded-b-[40%]"
                style={{ background: "linear-gradient(180deg, #00838f 0%, #006064 60%, #004d40 100%)", boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)" }}
              />
              {/* Orange stripe */}
              <div className="absolute top-3 left-2 right-2 h-3 rounded-sm" style={{ background: "#ffab40" }} />
              {/* Wheelhouse */}
              <div className="absolute top-7 left-4 right-4 h-6 rounded-sm" style={{ background: "linear-gradient(180deg, #fff3e0, #ffe0b2)", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                <div className="flex justify-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-sm bg-cyan-400 shadow-inner" />
                  <div className="w-2 h-2 rounded-sm bg-cyan-400 shadow-inner" />
                </div>
              </div>
              {/* Mast */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-5 rounded-t-sm" style={{ background: "linear-gradient(180deg, #d32f2f, #b71c1c)" }}>
                <div className="absolute -top-1 left-0 right-0 h-1 bg-yellow-400 rounded-t-sm" />
              </div>
            </div>
          </div>

          {/* Hull shadow / water-line shimmer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full opacity-40"
            style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)" }}
          />
        </div>

        {/* ── FLAG with wave animation ── */}
        <div
          className="absolute overflow-hidden rounded-sm shadow-sm flex items-center justify-center"
          style={{
            top: "-16px",
            right: "-4px",
            width: 34,
            height: 20,
            background: "linear-gradient(135deg, #e53935, #c62828)",
            borderLeft: "2px solid #fff",
            transformOrigin: "left center",
            animation: "flagWave 1.8s ease-in-out infinite",
          }}
        >
          <div className="text-[5px] text-white font-bold leading-none text-center select-none">L.Z.</div>
        </div>
      </motion.div>

      {/* ── WASD hint ── */}
      {!isMoving && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap animate-pulse">
          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-4 py-2 rounded-full font-label tracking-widest uppercase flex items-center gap-2">
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">W/S</span> Throttle
            <span className="text-white/30">·</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">A/D</span> Steer
          </div>
        </div>
      )}
    </div>
  );
});

export default Boat;
