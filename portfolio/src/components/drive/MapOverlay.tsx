"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { Stop, WorldData } from "./driveData";
import { car, SCREEN_RIGHT, SCREEN_UP, WORLD_RADIUS } from "./driveStore";
import { PALETTE } from "./palette";
import { buildRoads, ROAD_WIDTH, STOP_TRIGGER } from "./worldLayout";

const KIND_LABEL: Record<Stop["kind"], string> = { internship: "Internship", project: "Project", win: "Hackathon win", contact: "Contact" };

/** world -> map units, oriented like the 3D view (screen up = map up) */
const project = (x: number, z: number) => [x * SCREEN_RIGHT.x + z * SCREEN_RIGHT.z, -(x * SCREEN_UP.x + z * SCREEN_UP.z)] as const;

/** puts the car at the near edge of a stop's pad, facing it */
export function teleportTo(stop: Stop) {
  const back = STOP_TRIGGER[stop.kind] - 1.6;
  car.x = stop.x - SCREEN_UP.x * back;
  car.z = stop.z - SCREEN_UP.z * back;
  car.vx = 0;
  car.vz = 0;
  car.speed = 0;
  car.heading = Math.atan2(-(stop.x - car.x), -(stop.z - car.z));
  car.moved = true;
}

/** full map: every stop is a button that drops the car right there */
export default function MapOverlay({ world, visited, onClose }: { world: WorldData; visited: ReadonlySet<string>; onClose: () => void }) {
  const roads = useMemo(() => buildRoads(world.districts, world.stops), [world]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const R = WORLD_RADIUS + 6;
  const [cx, cy] = project(car.x, car.z);

  useEffect(() => {
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "KeyM") onClose();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const groups: { title: string; kind: Stop["kind"] }[] = [
    { title: "Internships", kind: "internship" },
    { title: "Projects", kind: "project" },
    { title: "Hackathon wins", kind: "win" },
    { title: "Contact", kind: "contact" },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-stretch justify-center bg-[#1d2321]/35 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="World map">
      <div className="flex max-h-full w-full max-w-[980px] flex-col overflow-hidden rounded-[8px] border border-[#1d2321]/15 bg-[#fbfaf6] shadow-2xl sm:flex-row">
        <div className="relative shrink-0 border-b border-[#1d2321]/10 bg-[#e7ecdf] sm:w-[55%] sm:border-b-0 sm:border-r">
          <svg viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} className="mx-auto block aspect-square max-h-[42vh] w-full sm:max-h-none">
            <circle r={WORLD_RADIUS + 2} fill={PALETTE.ground} />
            {roads.segments.map((s, i) => {
              const [ax, ay] = project(s.ax, s.az);
              const [bx, by] = project(s.bx, s.bz);
              return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={PALETTE.road} strokeWidth={ROAD_WIDTH} strokeLinecap="round" />;
            })}
            {roads.plazas.map((p, i) => {
              const [x, y] = project(p.x, p.z);
              return <circle key={i} cx={x} cy={y} r={p.r} fill={PALETTE.road} />;
            })}
            {world.stops.map((s) => {
              const [x, y] = project(s.x, s.z);
              const seen = visited.has(s.id);
              return (
                <g key={s.id} transform={`translate(${x} ${y})`} className="cursor-pointer" onClick={() => (teleportTo(s), onClose())}>
                  <circle r={3.2} fill={seen ? s.accent : PALETTE.paper} stroke={s.accent} strokeWidth={1.4} />
                  <title>{s.title}</title>
                </g>
              );
            })}
            <g transform={`translate(${cx} ${cy})`}>
              <circle r={2.4} fill={PALETTE.ink} />
              <circle r={4.6} fill="none" stroke={PALETTE.ink} strokeOpacity={0.35} strokeWidth={0.8} />
            </g>
          </svg>
          <p className="pointer-events-none absolute bottom-2 left-3 font-label text-[11px] font-semibold text-[#5b625e]">● You are here</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[#1d2321]/10 px-4 py-3">
            <p className="font-label text-sm font-bold">Jump to a stop</p>
            <button ref={closeRef} type="button" onClick={onClose} className="rounded-[4px] px-2 py-1 font-label text-sm font-semibold text-[#5b625e] hover:bg-[#1d2321]/5 hover:text-[#1d2321]">
              Close <kbd className="ml-1 hidden text-[10px] text-[#5b625e] pointer-fine:inline">Esc</kbd>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {groups.map((g) => {
              const items = world.stops.filter((s) => s.kind === g.kind);
              if (!items.length) return null;
              return (
                <section key={g.kind} className="pt-3">
                  <h3 className="px-2 pb-1 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-[#5b625e]">{g.title}</h3>
                  <ul>
                    {items.map((s) => (
                      <li key={s.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => (teleportTo(s), onClose())}
                          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-[4px] px-2 py-1.5 text-left hover:bg-[#1d2321]/[0.05]"
                          aria-label={`Drive to ${s.title} (${KIND_LABEL[s.kind]})`}
                        >
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full border" style={{ borderColor: s.accent, background: visited.has(s.id) ? s.accent : "transparent" }} aria-hidden />
                          <span className="min-w-0">
                            <span className="block truncate font-label text-sm font-semibold text-[#1d2321]">{s.title}</span>
                            <span className="block truncate text-xs text-[#5b625e]">{s.kind === "contact" ? s.line : s.kicker}</span>
                          </span>
                        </button>
                        {s.href && (
                          <Link href={s.href} className="shrink-0 rounded-[4px] px-2 py-2 font-label text-xs font-semibold text-[#5b625e] hover:bg-[#1d2321]/[0.05] hover:text-[#1d2321]" aria-label={`Open the ${s.title} case study`}>
                            Read →
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
