"use client";

export default function GameChrome() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[35] overflow-hidden">
      <div className="absolute inset-0 game-vignette" />
      <div className="absolute inset-0 game-scanline" />

      <div className="absolute left-4 top-20 hidden h-28 w-px bg-gradient-to-b from-transparent via-cyan-200/40 to-transparent md:block" />
      <div className="absolute right-4 top-20 hidden h-28 w-px bg-gradient-to-b from-transparent via-cyan-200/40 to-transparent md:block" />

      <div className="game-corner left-4 top-4 border-l border-t" />
      <div className="game-corner right-4 top-4 border-r border-t" />
      <div className="game-corner bottom-4 left-4 border-b border-l" />
      <div className="game-corner bottom-4 right-4 border-b border-r" />

      <div className="absolute left-1/2 top-3 hidden -translate-x-1/2 items-center gap-3 rounded-md border border-cyan-200/15 bg-slate-950/30 px-3 py-1.5 backdrop-blur-sm md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
        <span className="font-label text-[9px] font-black uppercase tracking-[0.28em] text-cyan-50/70">
          Live Portfolio Expedition
        </span>
      </div>
    </div>
  );
}
