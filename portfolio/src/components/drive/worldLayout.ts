/**
 * Deterministic layout of everything static: roads, scenery, colliders and the voxel name.
 * Seeded, so the server-free client build always produces the same world.
 */
import type { District, Stop } from "./driveData";
import { WORLD_RADIUS } from "./driveStore";

export type Circle = { x: number; z: number; r: number };
export type Segment = { ax: number; az: number; bx: number; bz: number };
export type Prop = { x: number; z: number; s: number; rot: number; tint: number };

export const ROAD_WIDTH = 4.2;
export const NAME_Z = -11;
export const CUBE = 0.56;

export const STOP_TRIGGER: Record<Stop["kind"], number> = {
  internship: 7.2,
  project: 5.2,
  win: 4.4,
  community: 4.6,
  contact: 5.4,
};

export const STOP_SOLID: Record<Stop["kind"], number> = {
  internship: 3.3,
  project: 1.35,
  win: 1.2,
  community: 0,
  contact: 1.4,
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distToSegment(px: number, pz: number, s: Segment) {
  const dx = s.bx - s.ax;
  const dz = s.bz - s.az;
  const len2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - s.ax) * dx + (pz - s.az) * dz) / len2));
  return Math.hypot(px - (s.ax + dx * t), pz - (s.az + dz * t));
}

/** roads run from the spawn plaza to each district, with a plaza at each end */
export function buildRoads(districts: District[], stops: Stop[]) {
  const segments: Segment[] = [];
  const plazas: Circle[] = [{ x: 0, z: 2, r: 9 }];
  for (const d of districts) {
    segments.push({ ax: 0, az: 2, bx: d.x, bz: d.z });
    plazas.push({ x: d.x, z: d.z, r: 4.6 });
  }
  // internships sit in a row: a cross street joins them
  const jobs = stops.filter((s) => s.kind === "internship");
  const north = districts.find((d) => d.label === "Internships");
  if (north && jobs.length > 1) {
    const xs = jobs.map((j) => j.x);
    segments.push({ ax: Math.min(...xs), az: north.z, bx: Math.max(...xs), bz: north.z });
  }
  const contact = stops.find((s) => s.kind === "contact");
  if (contact) {
    segments.push({ ax: 0, az: 2, bx: contact.x + 4, bz: contact.z - 4 });
    plazas.push({ x: contact.x + 4, z: contact.z - 4, r: 4 });
  }
  return { segments, plazas };
}

export function buildScenery(stops: Stop[], segments: Segment[], plazas: Circle[]) {
  const rand = rng(20051);
  const trees: Prop[] = [];
  const rocks: Prop[] = [];
  const clear = (x: number, z: number, pad: number) => {
    if (Math.abs(z - NAME_Z) < 4 && Math.abs(x) < 21) return false;
    // bowling lane west of the spawn plaza (see extrasLayout BOWLING)
    if (z > 2 && z < 11.5 && x < -8 && x > -23) return false;
    for (const s of segments) if (distToSegment(x, z, s) < ROAD_WIDTH / 2 + pad) return false;
    for (const p of plazas) if (Math.hypot(x - p.x, z - p.z) < p.r + pad) return false;
    for (const s of stops) if (Math.hypot(x - s.x, z - s.z) < STOP_TRIGGER[s.kind] + pad) return false;
    return true;
  };
  const near = (list: Prop[], x: number, z: number, d: number) => list.some((p) => Math.hypot(p.x - x, p.z - z) < d);

  // groves rather than uniform noise: pick centres, scatter around them
  let guard = 0;
  while (trees.length < 120 && guard++ < 6000) {
    const a = rand() * Math.PI * 2;
    const r = 12 + Math.sqrt(rand()) * (WORLD_RADIUS - 15);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!clear(x, z, 2.2) || near(trees, x, z, 2.6)) continue;
    trees.push({ x, z, s: 0.8 + rand() * 0.7, rot: rand() * Math.PI * 2, tint: rand() });
  }
  // a dense wooded rim marks the edge of the world
  guard = 0;
  while (guard++ < 400) {
    const a = rand() * Math.PI * 2;
    const r = WORLD_RADIUS + 3 + rand() * 16;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (near(trees, x, z, 2.4)) continue;
    trees.push({ x, z, s: 0.9 + rand() * 0.9, rot: rand() * Math.PI * 2, tint: rand() });
  }
  guard = 0;
  while (rocks.length < 36 && guard++ < 3000) {
    const a = rand() * Math.PI * 2;
    const r = 10 + rand() * (WORLD_RADIUS - 12);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!clear(x, z, 1.2) || near(trees, x, z, 1.8) || near(rocks, x, z, 3)) continue;
    rocks.push({ x, z, s: 0.4 + rand() * 0.8, rot: rand() * Math.PI * 2, tint: rand() });
  }
  return { trees, rocks };
}

/** static circles the car bounces off: landmarks, trunks, rocks */
export function buildColliders(stops: Stop[], trees: Prop[], rocks: Prop[]): Circle[] {
  const out: Circle[] = stops.map((s) => ({ x: s.x, z: s.z, r: STOP_SOLID[s.kind] }));
  for (const t of trees) if (Math.hypot(t.x, t.z) < WORLD_RADIUS + 2) out.push({ x: t.x, z: t.z, r: 0.45 * t.s });
  for (const r of rocks) out.push({ x: r.x, z: r.z, r: 0.75 * r.s });
  return out;
}

/* 5x7 pixel glyphs, top row first */
const GLYPHS: Record<string, string[]> = {
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
};

export type NameCube = {
  /** rest position (centre) */
  hx: number;
  hy: number;
  hz: number;
  /** index of the cube resting on top of this one, or -1 */
  above: number;
  /** second word gets the accent colour */
  word: number;
};

export function buildNameCubes(text = "LOUIS ZHANG"): NameCube[] {
  const letterW = 5 * CUBE;
  const gap = CUBE * 1.4;
  const total = text.length * letterW + (text.length - 1) * gap;
  const cubes: NameCube[] = [];
  const grid = new Map<string, number>();
  let word = 0;
  [...text].forEach((ch, li) => {
    if (ch === " ") {
      word++;
      return;
    }
    const glyph = GLYPHS[ch];
    if (!glyph) return;
    const x0 = -total / 2 + li * (letterW + gap);
    glyph.forEach((row, r) => {
      [...row].forEach((bit, c) => {
        if (bit !== "1") return;
        const level = 6 - r;
        grid.set(`${li}:${c}:${level}`, cubes.length);
        cubes.push({ hx: x0 + (c + 0.5) * CUBE, hy: (level + 0.5) * CUBE, hz: NAME_Z, above: -1, word });
      });
    });
  });
  for (const [key, i] of grid) {
    const [li, c, level] = key.split(":").map(Number);
    cubes[i].above = grid.get(`${li}:${c}:${level + 1}`) ?? -1;
  }
  return cubes;
}
