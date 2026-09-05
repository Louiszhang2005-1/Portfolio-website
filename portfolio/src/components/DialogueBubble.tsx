"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mission } from "@/data/missions";

interface DialogueBubbleProps {
  nearbyIsland: Mission | null;
  onInspect: () => void;
}

export default function DialogueBubble({ nearbyIsland, onInspect }: DialogueBubbleProps) {
  const isLocked = nearbyIsland?.status === "locked";

  return (
    <AnimatePresence>
      {nearbyIsland && (
        <motion.div
          key={nearbyIsland.id}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+10.25rem)] left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4 md:bottom-6"
          initial={{ opacity: 0, y: 44, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
        >
          <div className="relative overflow-hidden rounded-lg border border-cyan-100/20 bg-slate-950/88 shadow-[0_-18px_70px_rgba(8,47,73,0.34)] backdrop-blur-xl">
            <div className="absolute inset-0 pointer-events-none game-scanline opacity-35" />
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: `linear-gradient(90deg, transparent, ${nearbyIsland.color}, transparent)` }}
            />

            <div className="grid gap-4 p-4 sm:grid-cols-[74px_1fr_auto] sm:items-center">
              <div
                className="grid h-[74px] w-[74px] place-items-center rounded-md border text-3xl shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]"
                style={{
                  borderColor: `${nearbyIsland.color}66`,
                  background: `radial-gradient(circle, ${nearbyIsland.color}33, rgba(15,23,42,0.82) 68%)`,
                  boxShadow: `0 0 24px ${nearbyIsland.color}33`,
                }}
              >
                <span>{nearbyIsland.emoji}</span>
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-label text-[9px] font-black uppercase tracking-[0.28em] text-cyan-100/60">
                    Mission Contact
                  </span>
                  <span
                    className="rounded border px-2 py-0.5 font-label text-[9px] font-black uppercase tracking-wider"
                    style={{
                      borderColor: `${nearbyIsland.sectorColor}55`,
                      color: nearbyIsland.sectorColor,
                      background: `${nearbyIsland.sectorColor}18`,
                    }}
                  >
                    {nearbyIsland.id}
                  </span>
                </div>

                {isLocked ? (
                  <p className="font-headline text-base font-black leading-snug text-amber-100">
                    Sector restricted. The {nearbyIsland.title} mission is staged for a future deployment.
                  </p>
                ) : (
                  <p className="font-headline text-base font-black leading-snug text-white sm:text-lg">
                    Arrived at <span style={{ color: nearbyIsland.color }}>{nearbyIsland.title}</span>.
                    <span className="text-cyan-100/72"> Inspect the {nearbyIsland.subtitle} blueprint?</span>
                  </p>
                )}

                {!isLocked && (
                  <p className="mt-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/42">
                    Tap Inspect or press ENTER
                  </p>
                )}
              </div>

              {!isLocked && (
                <motion.button
                  onClick={onInspect}
                  className="flex min-h-12 items-center justify-center rounded-md border border-white/25 px-5 py-3 font-label text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${nearbyIsland.color}, ${nearbyIsland.color}aa)` }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Inspect
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
