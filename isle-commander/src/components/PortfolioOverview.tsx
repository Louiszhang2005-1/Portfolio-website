"use client";

import { useMemo, useState } from "react";
import { getActiveMissions, sectorInfo } from "@/data/missions";

export default function PortfolioOverview() {
  const [isOpen, setIsOpen] = useState(true);

  const stats = useMemo(() => {
    const missions = getActiveMissions();
    const experienceCount = missions.filter((m) => m.sector === "Internship Shores").length;
    return {
      missions: missions.length,
      sectors: sectorInfo.length,
      experienceCount,
      projectCount: missions.length - experienceCount,
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        className="fixed left-4 top-[82px] z-40 rounded-full border border-white/15 bg-slate-950/65 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900/80"
        onClick={() => setIsOpen(true)}
      >
        Overview
      </button>
    );
  }

  return (
    <aside className="fixed left-4 right-4 top-[82px] z-40 max-w-[360px] rounded-lg border border-white/15 bg-slate-950/68 p-4 text-white shadow-xl backdrop-blur-sm md:right-auto">
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300/15 text-lg">
          LZ
        </div>
        <div className="min-w-0">
          <p className="m-0 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">
            Portfolio Map
          </p>
          <h2 className="m-0 text-lg font-black leading-tight tracking-normal text-white">
            Louis Zhang
          </h2>
        </div>
        <button
          className="ml-auto grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => setIsOpen(false)}
          aria-label="Minimize portfolio overview"
        >
          -
        </button>
      </div>

      <p className="mb-3 text-sm font-semibold leading-snug text-cyan-50/90">
        Mechanical engineering portfolio presented as a playable island map. Sail between internships, aerospace work,
        robotics, IoT, software, and AI projects.
      </p>

      <div className="mb-3 grid grid-cols-4 gap-2">
        <Stat value={stats.experienceCount} label="roles" />
        <Stat value={stats.projectCount} label="projects" />
        <Stat value={stats.sectors} label="sectors" />
        <Stat value={stats.missions} label="nodes" />
      </div>

      <div className="space-y-2 text-[11px] leading-snug text-white/72">
        <p className="m-0">
          <span className="font-black text-orange-200">Experience:</span> City of Montreal water testing, Lockheed
          Martin ship integration, and Tesla cell engineering.
        </p>
        <p className="m-0">
          <span className="font-black text-yellow-200">Highlights:</span> CSA Transport System, Autonomous
          Reforestation Robot, Nursie, ResQ - Link, and Fully Integrated CRM Outreach Tool.
        </p>
        <p className="m-0">
          <span className="font-black text-emerald-200">Honors:</span> Lina & Jean-Guy Gaudreault Perseverance
          Scholarship, Best Use of ElevenLabs, and RoboHacks Unexpected Expedition Award.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
        <span>WASD / touch sail</span>
        <span className="text-white/25">/</span>
        <span>Inspect / Enter</span>
        <span className="text-white/25">/</span>
        <span>M map</span>
      </div>
    </aside>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/6 px-2 py-2 text-center">
      <div className="text-base font-black leading-none text-white">{value}</div>
      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-cyan-100/55">{label}</div>
    </div>
  );
}
