"use client";

import { missions, sectorInfo, Mission } from "@/data/missions";

interface MapProjectListProps {
  visitedIds: Set<string>;
  /** Open the blueprint right away (and sail there in the background) */
  onInspect: (mission: Mission) => void;
  /** Only sail to the island */
  onSail: (mission: Mission) => void;
}

const SECTOR_LABELS: Record<string, string> = {
  "Internship Shores": "Internships",
  "Aero Atoll": "Mechanical & Aerospace",
  "Robotics & IoT": "Robotics & IoT",
  "Code Cove": "Software & AI",
};

/* Newest first within each sector */
const GROUPS = sectorInfo.map((sector) => ({
  ...sector,
  items: missions
    .filter((m) => m.sector === sector.name && m.status === "active")
    .sort((a, b) => (b.chronoOrder ?? 0) - (a.chronoOrder ?? 0)),
}));

/**
 * Text list of every internship and project — the recruiter fast path. Lives
 * inside the treasure map so it is one key (M) or one tap away.
 */
export default function MapProjectList({ visitedIds, onInspect, onSail }: MapProjectListProps) {
  return (
    <nav aria-label="All projects and internships" className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-1 pb-2">
        <h3 className="font-headline text-sm font-black text-[#3b2a17]">All projects &amp; internships</h3>
        <p className="text-[11px] font-semibold text-[#5c4526]">Click to open the blueprint. ⛵ sails there.</p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {GROUPS.map((group) => (
          <section key={group.name}>
            <h4
              className="mb-1 flex items-center gap-1.5 font-label text-[10px] font-black uppercase tracking-[0.14em]"
              style={{ color: group.color }}
            >
              <span aria-hidden>{group.emoji}</span>
              {SECTOR_LABELS[group.name] ?? group.name}
            </h4>
            <ul className="space-y-1">
              {group.items.map((m) => (
                <li key={m.id} className="flex items-stretch gap-1">
                  <button
                    onClick={() => onInspect(m)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#6f4c21]/20 bg-[#fff8e6]/80 px-2 py-1.5 text-left transition-colors hover:border-[#6f4c21]/45 hover:bg-white"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded text-sm" style={{ background: `${m.color}22` }} aria-hidden>
                      {m.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-[12px] font-black leading-tight text-[#2e2112]">
                        <span className="truncate">{m.title}</span>
                        {visitedIds.has(m.id) && <span className="shrink-0 text-[10px]" title="Visited">⭐</span>}
                      </span>
                      <span className="block truncate text-[10.5px] font-semibold leading-tight text-[#5c4526]">{m.subtitle}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => onSail(m)}
                    className="grid w-8 shrink-0 place-items-center rounded-md border border-[#6f4c21]/20 bg-[#0f7ea6]/12 text-sm hover:bg-[#0f7ea6]/25"
                    aria-label={`Sail to ${m.title}`}
                    title={`Sail to ${m.title}`}
                  >
                    ⛵
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
