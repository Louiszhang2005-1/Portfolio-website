import { missions, sectorInfo, WORLD_BOUNDS } from "@/data/missions";

export type SectorRoute = {
  name: string;
  color: string;
  points: { x: number; y: number }[];
};

const dist2 = (ax: number, ay: number, bx: number, by: number) =>
  (ax - bx) ** 2 + (ay - by) ** 2;

export function getSectorRoutes(): SectorRoute[] {
  return sectorInfo
    .map((sector) => {
      const active = missions.filter(
        (m) => m.sector === sector.name && m.status === "active"
      );
      if (active.length === 0) return null;

      const remaining = [...active];
      remaining.sort((a, b) =>
        dist2(a.position.x, a.position.y, 0, 0) -
        dist2(b.position.x, b.position.y, 0, 0)
      );
      const ordered = [remaining.shift()!];
      while (remaining.length > 0) {
        const { x: lx, y: ly } = ordered[ordered.length - 1].position;
        let bestIdx = 0;
        let bestD = dist2(lx, ly, remaining[0].position.x, remaining[0].position.y);
        for (let i = 1; i < remaining.length; i++) {
          const d = dist2(lx, ly, remaining[i].position.x, remaining[i].position.y);
          if (d < bestD) { bestD = d; bestIdx = i; }
        }
        ordered.push(remaining.splice(bestIdx, 1)[0]);
      }

      const norm = (w: number) => (w + WORLD_BOUNDS) / (WORLD_BOUNDS * 2);
      const points = [
        { x: 0.5, y: 0.5 },
        ...ordered.map((m) => ({ x: norm(m.position.x), y: norm(m.position.y) })),
      ];

      return { name: sector.name, color: sector.color, points };
    })
    .filter(Boolean) as SectorRoute[];
}
