/**
 * Layout for the world's extras: showcase screens behind each project, physics toys
 * (crates, cones, a bowling alley) and small decorative details. Deterministic, like worldLayout.
 */
import type { Stop } from "./driveData";
import { SCREEN_UP, WORLD_RADIUS } from "./driveStore";
import { NAME_Z, ROAD_WIDTH, STOP_TRIGGER, type Circle, type Prop, type Segment } from "./worldLayout";

/** the screen stands on the far side of the pad (away from the camera) so it never hides the car */
export const SCREEN_W = 4.6;
export const SCREEN_H = 2.875;
export const SCREEN_BACK = 3.1;
export const SCREEN_BASE = 1.15;

export type Screen = { stop: Stop; x: number; z: number; image: string };

export function buildScreens(stops: Stop[]): Screen[] {
  const out: Screen[] = [];
  for (const s of stops) {
    if (s.kind !== "project" && s.kind !== "win") continue;
    const slug = s.href?.split("/").pop();
    if (!slug) continue;
    out.push({ stop: s, x: s.x + SCREEN_UP.x * SCREEN_BACK, z: s.z + SCREEN_UP.z * SCREEN_BACK, image: `/media/drive/${slug}.webp` });
  }
  return out;
}

/** three circles along the panel keep the car from driving through a screen */
export function screenColliders(screens: Screen[]): Circle[] {
  const rx = -SCREEN_UP.z;
  const rz = SCREEN_UP.x;
  return screens.flatMap((s) => [-1.7, 0, 1.7].map((o) => ({ x: s.x + rx * o, z: s.z + rz * o, r: 0.75 })));
}

/** where label signs go: above the screen for exhibits, above the landmark otherwise */
export function signAnchor(s: Stop): { x: number; z: number } {
  if (s.kind === "project" || s.kind === "win") return { x: s.x + SCREEN_UP.x * SCREEN_BACK, z: s.z + SCREEN_UP.z * SCREEN_BACK };
  return { x: s.x, z: s.z };
}

export type BodyKind = "crate" | "cone" | "pin";
export type BodySpec = { kind: BodyKind; x: number; y: number; z: number; yaw: number };

/** bowling lane: east-to-west, the car comes off the spawn plaza and rolls into the pins */
export const BOWLING = { headX: -17, z: 6, laneFromX: -9.5, laneToX: -20.5, width: 3.4 } as const;

export function buildBodies(stops: Stop[]): BodySpec[] {
  const out: BodySpec[] = [];
  // ten pins in a triangle, head pin facing the car
  const sp = 0.62;
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k <= row; k++) {
      out.push({ kind: "pin", x: BOWLING.headX - row * sp * 0.9, y: 0, z: BOWLING.z + (k - row / 2) * sp, yaw: 0 });
    }
  }
  // a little crate pyramid at every district plaza edge and cones along the main spokes
  const piles: [number, number][] = [
    [7, -6],
    [-8, -4],
    [6, 13],
    [20, 6],
    [-20, 18],
  ];
  for (const [x, z] of piles) {
    const c = 0.95;
    out.push({ kind: "crate", x: x - c / 2, y: 0, z, yaw: 0 });
    out.push({ kind: "crate", x: x + c / 2, y: 0, z, yaw: 0 });
    out.push({ kind: "crate", x, y: c, z, yaw: 0 });
  }
  // cone slalom on the south road
  for (let i = 0; i < 6; i++) out.push({ kind: "cone", x: (i % 2 ? 1 : -1) * 0.9, y: 0, z: 12 + i * 2.4, yaw: 0 });
  // a couple of loose crates by each exhibit pad so every stop has something to bump
  for (const s of stops) {
    if (s.kind !== "project") continue;
    const r = STOP_TRIGGER[s.kind] + 1.2;
    out.push({ kind: "crate", x: s.x - SCREEN_UP.x * r * 0.7 + 1.2, y: 0, z: s.z - SCREEN_UP.z * r * 0.7, yaw: 0.4 });
  }
  return out;
}

/** grass tufts, flowers and street lamps, kept off roads, pads and the name */
export function buildDetails(stops: Stop[], segments: Segment[], plazas: Circle[]) {
  let seed = 913;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const distSeg = (px: number, pz: number, s: Segment) => {
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const t = Math.max(0, Math.min(1, ((px - s.ax) * dx + (pz - s.az) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(px - (s.ax + dx * t), pz - (s.az + dz * t));
  };
  const free = (x: number, z: number) =>
    !(Math.abs(z - NAME_Z) < 4 && Math.abs(x) < 21) &&
    !(Math.abs(z - BOWLING.z) < 3 && x < BOWLING.laneFromX + 1 && x > BOWLING.laneToX - 2) &&
    segments.every((s) => distSeg(x, z, s) > ROAD_WIDTH / 2 + 0.4) &&
    plazas.every((p) => Math.hypot(x - p.x, z - p.z) > p.r + 0.4) &&
    stops.every((s) => Math.hypot(x - s.x, z - s.z) > STOP_TRIGGER[s.kind] + 0.6);

  const tufts: Prop[] = [];
  const flowers: Prop[] = [];
  let guard = 0;
  while (tufts.length < 260 && guard++ < 5000) {
    const a = rand() * Math.PI * 2;
    const r = 6 + Math.sqrt(rand()) * (WORLD_RADIUS + 6);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (free(x, z)) tufts.push({ x, z, s: 0.6 + rand() * 0.7, rot: rand() * Math.PI, tint: rand() });
  }
  guard = 0;
  // flowers in small clumps
  while (flowers.length < 150 && guard++ < 4000) {
    const a = rand() * Math.PI * 2;
    const r = 8 + rand() * (WORLD_RADIUS - 8);
    const cx = Math.cos(a) * r;
    const cz = Math.sin(a) * r;
    const tint = rand();
    for (let k = 0; k < 6; k++) {
      const x = cx + (rand() - 0.5) * 2.4;
      const z = cz + (rand() - 0.5) * 2.4;
      if (free(x, z)) flowers.push({ x, z, s: 0.8 + rand() * 0.5, rot: 0, tint });
    }
  }
  // street lamps every ~9 units along each spoke, alternating sides
  const lamps: Prop[] = [];
  for (const s of segments) {
    const len = Math.hypot(s.bx - s.ax, s.bz - s.az);
    const nx = -(s.bz - s.az) / len;
    const nz = (s.bx - s.ax) / len;
    for (let d = 12, i = 0; d < len - 4; d += 9, i++) {
      const side = i % 2 ? 1 : -1;
      const x = s.ax + ((s.bx - s.ax) * d) / len + nx * side * (ROAD_WIDTH / 2 + 0.7);
      const z = s.az + ((s.bz - s.az) * d) / len + nz * side * (ROAD_WIDTH / 2 + 0.7);
      if (stops.every((st) => Math.hypot(x - st.x, z - st.z) > STOP_TRIGGER[st.kind] + 0.5) && !(Math.abs(z - NAME_Z) < 3 && Math.abs(x) < 21))
        lamps.push({ x, z, s: 1, rot: Math.atan2(nx * side, nz * side), tint: 0 });
    }
  }
  return { tufts, flowers, lamps };
}
