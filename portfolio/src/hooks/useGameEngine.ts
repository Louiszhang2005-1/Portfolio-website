"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { missions, Mission, SPAWN_POSITION, WORLD_BOUNDS, collectibles, fogZones, FOG_REVEAL_RADIUS, barrels } from "@/data/missions";

/* ─── Constants ─── */
const THRUST_POWER = 0.32;
const REVERSE_POWER = 0.18;
const TURN_RATE = 3.2;
const MAX_SPEED = 5.5;
const FRICTION = 0.93;
const CAMERA_LERP = 0.09;
const COLLISION_RADIUS = 160;
const STORAGE_KEY = "isle-commander-visited";
const STORAGE_KEY_COLLECTED = "isle-commander-collected";
const BOUNCE_DAMPING = 0.4;
const COLLECT_RADIUS = 70;
// Parallax world sizes (half-extents)
const BG_HALF = 4000;
const MID_HALF = 3000;
// Enemy AI constants
const AGGRO_RADIUS = 380;
const ENEMY_DISENGAGE = 580;
const ENEMY_SPEED_CHASE = 2.2;
const ENEMY_SPEED_PATROL = 0.9;
const ENEMY_HIT_RADIUS = 50;
const ENEMY_HIT_COOLDOWN = 120; // 2 sec at 60fps
const BARREL_HIT_RADIUS = 60;

/* ─── Types ─── */
export type GameState = "sailing" | "near_island" | "inspecting";

export interface EnemyHUD { id: string; x: number; y: number; heading: number; state: "patrol" | "chase"; }

interface EnemyShip {
  id: string;
  x: number; y: number;
  vx: number; vy: number;
  heading: number;
  patrolX: number; patrolY: number;
  state: "patrol" | "chase";
  hitCooldown: number;
}

const INITIAL_ENEMIES: EnemyShip[] = [
  { id: "e1", x: -620, y: -280, vx: 0, vy: 0, heading: 0,   patrolX: -620, patrolY: -280, state: "patrol", hitCooldown: 0 },
  { id: "e2", x:  720, y: -480, vx: 0, vy: 0, heading: 90,  patrolX:  720, patrolY: -480, state: "patrol", hitCooldown: 0 },
  { id: "e3", x:  580, y:  680, vx: 0, vy: 0, heading: 180, patrolX:  580, patrolY:  680, state: "patrol", hitCooldown: 0 },
  { id: "e4", x: -480, y:  580, vx: 0, vy: 0, heading: 270, patrolX: -480, patrolY:  580, state: "patrol", hitCooldown: 0 },
];

interface Vec2 { x: number; y: number; }

interface BoatState {
  position: Vec2;
  velocity: Vec2;
  heading: number;
}

export interface GameEngine {
  /* Refs for high-frequency values (read directly, no re-render) */
  worldRef: React.RefObject<HTMLDivElement | null>;
  boatRef: React.RefObject<HTMLDivElement | null>;
  boatHeadingRef: React.RefObject<HTMLDivElement | null>;
  /* Parallax layer refs */
  paralaxBgRef: React.RefObject<HTMLDivElement | null>;
  paralaxMidRef: React.RefObject<HTMLDivElement | null>;
  /* Low-frequency React state (only changes on events) */
  gameState: GameState;
  nearbyIsland: Mission | null;
  inspectedIsland: Mission | null;
  visitedIds: Set<string>;
  /* Snapshot values for HUD (updated at low frequency) */
  hudSpeed: number;
  hudHeading: number;
  hudPosition: Vec2;
  hudCoreTemp: number;
  /* World/environment */
  timeOfDay: number;             // 0 = full day, 1 = full night
  nearestUnvisitedAngle: number; // degrees, compass bearing to nearest unvisited island
  fogRevealedZones: Set<number>; // indices of revealed fog zones
  /* Actions */
  openBlueprint: () => void;
  closeBlueprint: () => void;
  navigateToIsland: (mission: Mission) => void;
  /* Treasure map */
  mapOpen: boolean;
  toggleMap: () => void;
  closeMap: () => void;
  /* Score / collectibles */
  score: number;
  collectedItems: Set<string>;
  /* Enemies + barrels */
  hudEnemies: EnemyHUD[];
  hudBoilerHit: boolean;
  explodedBarrels: Set<string>;
  /* Boundary boing */
  boatSquash: boolean;
  deckBoundaryWarning: boolean;
}

/* ─── Helpers ─── */
function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeAngle(deg: number): number {
  while (deg > 360) deg -= 360;
  while (deg < 0) deg += 360;
  return deg;
}

function loadVisited(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function saveVisited(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

function loadCollected(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COLLECTED);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function saveCollected(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY_COLLECTED, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

/* ─── Hook ─── */
export function useGameEngine(): GameEngine {
  // ── React state (only for discrete events) ──
  const [gameState, setGameState] = useState<GameState>("sailing");
  const [nearbyIsland, setNearbyIsland] = useState<Mission | null>(null);
  const [inspectedIsland, setInspectedIsland] = useState<Mission | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  const [score, setScore] = useState(0);
  const [collectedItems, setCollectedItems] = useState<Set<string>>(new Set());

  // Load persisted state after mount (prevents hydration mismatch)
  useEffect(() => {
    const storedVisited = loadVisited();
    if (storedVisited.size > 0) {
      setVisitedIds(storedVisited);
      visitedRef.current = storedVisited;
    }
    const storedCollected = loadCollected();
    if (storedCollected.size > 0) {
      collectedRef.current = storedCollected;
      setCollectedItems(storedCollected);
      const pts = [...storedCollected].reduce((sum, id) => {
        const c = collectibles.find((c) => c.id === id);
        return sum + (c?.points ?? 0);
      }, 0);
      scoreRef.current = pts;
      setScore(pts);
    }
  }, []);

  // ── Low-frequency HUD snapshot ──
  const [hudSpeed, setHudSpeed] = useState(0);
  const [hudHeading, setHudHeading] = useState(0);
  const [hudPosition, setHudPosition] = useState<Vec2>({ x: 0, y: 0 });
  const [hudCoreTemp, setHudCoreTemp] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState(0);
  const [nearestUnvisitedAngle, setNearestUnvisitedAngle] = useState(0);
  const [fogRevealedZones, setFogRevealedZones] = useState<Set<number>>(new Set());

  // ── DOM refs for direct manipulation (no React re-render) ──
  const worldRef = useRef<HTMLDivElement>(null);
  const boatElRef = useRef<HTMLDivElement>(null);
  const boatHeadingRef = useRef<HTMLDivElement>(null);

  // ── Parallax layer refs ──
  const paralaxBgRef = useRef<HTMLDivElement>(null);
  const paralaxMidRef = useRef<HTMLDivElement>(null);

  // ── Internal refs ──
  const boatStateRef = useRef<BoatState>({
    position: { ...SPAWN_POSITION },
    velocity: { x: 0, y: 0 },
    heading: 0,
  });
  const cameraRef = useRef<Vec2>({ ...SPAWN_POSITION });
  const keysRef = useRef<Set<string>>(new Set());
  const autoNavTarget = useRef<Vec2 | null>(null);
  const nearbyRef = useRef<Mission | null>(null);
  const gameStateRef = useRef<GameState>("sailing");
  const frameCount = useRef(0);
  const collectedRef = useRef<Set<string>>(new Set());
  const scoreRef = useRef(0);

  // ── New juice refs ──
  const visitedRef = useRef<Set<string>>(new Set());
  const shakeRef = useRef({ intensity: 0 });
  const coreTempRef = useRef(0);
  const fogZoneRevealedRef = useRef<Set<number>>(new Set());

  // ── Enemy AI + barrel refs ──
  const enemyShipsRef = useRef<EnemyShip[]>(INITIAL_ENEMIES.map(e => ({ ...e })));
  const explodedBarrelsRef = useRef<Set<string>>(new Set());
  const boilerHitRef = useRef(0);

  // ── Enemy / barrel React state (for rendering) ──
  const [hudEnemies, setHudEnemies] = useState<EnemyHUD[]>([]);
  const [hudBoilerHit, setHudBoilerHit] = useState(false);
  const [explodedBarrels, setExplodedBarrels] = useState<Set<string>>(new Set());

  // ── Boundary boing state ──
  const [boatSquash, setBoatSquash] = useState(false);
  const [deckBoundaryWarning, setDeckBoundaryWarning] = useState(false);
  const boundaryHitCooldownRef = useRef(0);

  // ── Key listeners ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
        autoNavTarget.current = null;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // ── Game Loop ──
  useEffect(() => {
    let animId: number;
    const WORLD_SIZE = 3000;
    const HALF = WORLD_SIZE / 2;

    const tick = () => {
      const boat = boatStateRef.current;
      const camera = cameraRef.current;
      const keys = keysRef.current;

      // ── Input ──
      if (autoNavTarget.current) {
        const target = autoNavTarget.current;
        const dx = target.x - boat.position.x;
        const dy = target.y - boat.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
          autoNavTarget.current = null;
        } else {
          const targetHeading = normalizeAngle(Math.atan2(dx, -dy) * (180 / Math.PI));
          let headingDiff = targetHeading - boat.heading;
          if (headingDiff > 180) headingDiff -= 360;
          if (headingDiff < -180) headingDiff += 360;
          boat.heading = normalizeAngle(boat.heading + clamp(headingDiff, -TURN_RATE * 1.5, TURN_RATE * 1.5));
          const headingRad = degToRad(boat.heading);
          boat.velocity.x += Math.sin(headingRad) * THRUST_POWER;
          boat.velocity.y += -Math.cos(headingRad) * THRUST_POWER;
        }
      } else {
        if (keys.has("a") || keys.has("arrowleft")) boat.heading = normalizeAngle(boat.heading - TURN_RATE);
        if (keys.has("d") || keys.has("arrowright")) boat.heading = normalizeAngle(boat.heading + TURN_RATE);
        if (keys.has("w") || keys.has("arrowup")) {
          const r = degToRad(boat.heading);
          boat.velocity.x += Math.sin(r) * THRUST_POWER;
          boat.velocity.y += -Math.cos(r) * THRUST_POWER;
        }
        if (keys.has("s") || keys.has("arrowdown")) {
          const r = degToRad(boat.heading);
          boat.velocity.x += -Math.sin(r) * REVERSE_POWER;
          boat.velocity.y += Math.cos(r) * REVERSE_POWER;
        }
      }

      // ── Physics ──
      boat.velocity.x *= FRICTION;
      boat.velocity.y *= FRICTION;
      const speed = Math.sqrt(boat.velocity.x ** 2 + boat.velocity.y ** 2);
      if (speed > MAX_SPEED) {
        const s = MAX_SPEED / speed;
        boat.velocity.x *= s;
        boat.velocity.y *= s;
      }
      boat.position.x += boat.velocity.x;
      boat.position.y += boat.velocity.y;

      // ── Core temp smoothing (every frame) ──
      const throttleNorm = speed / MAX_SPEED;
      coreTempRef.current += (throttleNorm - coreTempRef.current) * 0.018;

      // ── Boundaries (with shake trigger) ──
      let bounced = false;
      if (boat.position.x > WORLD_BOUNDS) { boat.position.x = WORLD_BOUNDS; boat.velocity.x *= -BOUNCE_DAMPING; bounced = true; }
      else if (boat.position.x < -WORLD_BOUNDS) { boat.position.x = -WORLD_BOUNDS; boat.velocity.x *= -BOUNCE_DAMPING; bounced = true; }
      if (boat.position.y > WORLD_BOUNDS) { boat.position.y = WORLD_BOUNDS; boat.velocity.y *= -BOUNCE_DAMPING; bounced = true; }
      else if (boat.position.y < -WORLD_BOUNDS) { boat.position.y = -WORLD_BOUNDS; boat.velocity.y *= -BOUNCE_DAMPING; bounced = true; }
      if (bounced) {
        shakeRef.current.intensity = 1.0;
        if (boundaryHitCooldownRef.current === 0) {
          boundaryHitCooldownRef.current = 180;
          setBoatSquash(true);
          setTimeout(() => setBoatSquash(false), 600);
          setDeckBoundaryWarning(true);
          setTimeout(() => setDeckBoundaryWarning(false), 3500);
        }
      }
      if (boundaryHitCooldownRef.current > 0) boundaryHitCooldownRef.current--;

      // ── Enemy AI (every frame) ──
      for (const e of enemyShipsRef.current) {
        const edx = boat.position.x - e.x;
        const edy = boat.position.y - e.y;
        const eDist = Math.sqrt(edx * edx + edy * edy);
        if (eDist < AGGRO_RADIUS) e.state = "chase";
        else if (eDist > ENEMY_DISENGAGE) e.state = "patrol";

        if (e.state === "chase") {
          const th = normalizeAngle(Math.atan2(edx, -edy) * (180 / Math.PI));
          let hd = th - e.heading; if (hd > 180) hd -= 360; if (hd < -180) hd += 360;
          e.heading = normalizeAngle(e.heading + clamp(hd, -2.5, 2.5));
          const r = degToRad(e.heading);
          e.vx += Math.sin(r) * 0.18; e.vy += -Math.cos(r) * 0.18;
        } else {
          const pdx = e.patrolX - e.x, pdy = e.patrolY - e.y;
          const pd = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pd > 60) {
            const th = normalizeAngle(Math.atan2(pdx, -pdy) * (180 / Math.PI));
            let hd = th - e.heading; if (hd > 180) hd -= 360; if (hd < -180) hd += 360;
            e.heading = normalizeAngle(e.heading + clamp(hd, -1.5, 1.5));
            const r = degToRad(e.heading);
            e.vx += Math.sin(r) * 0.07; e.vy += -Math.cos(r) * 0.07;
          }
        }
        e.vx *= 0.90; e.vy *= 0.90;
        const es = Math.sqrt(e.vx ** 2 + e.vy ** 2);
        const maxEs = e.state === "chase" ? ENEMY_SPEED_CHASE : ENEMY_SPEED_PATROL;
        if (es > maxEs) { e.vx *= maxEs / es; e.vy *= maxEs / es; }
        e.x = clamp(e.x + e.vx, -WORLD_BOUNDS, WORLD_BOUNDS);
        e.y = clamp(e.y + e.vy, -WORLD_BOUNDS, WORLD_BOUNDS);
        if (e.hitCooldown > 0) { e.hitCooldown--; }
        else if (eDist < ENEMY_HIT_RADIUS) {
          e.hitCooldown = ENEMY_HIT_COOLDOWN;
          shakeRef.current.intensity = 0.7;
          boilerHitRef.current = 180;
        }
      }

      // ── Barrel collision (every frame) ──
      for (const barrel of barrels) {
        if (explodedBarrelsRef.current.has(barrel.id)) continue;
        const bx = barrel.position.x - boat.position.x;
        const by = barrel.position.y - boat.position.y;
        if (Math.sqrt(bx * bx + by * by) < BARREL_HIT_RADIUS) {
          const next = new Set(explodedBarrelsRef.current);
          next.add(barrel.id);
          explodedBarrelsRef.current = next;
          shakeRef.current.intensity = 0.6;
          setExplodedBarrels(new Set(next));
        }
      }

      // ── Boiler hit countdown (every frame) ──
      if (boilerHitRef.current > 0) boilerHitRef.current--;

      // ── Camera ──
      camera.x += (boat.position.x - camera.x) * CAMERA_LERP;
      camera.y += (boat.position.y - camera.y) * CAMERA_LERP;

      // ── Shake offset ──
      const shake = shakeRef.current;
      let sx = 0, sy = 0;
      if (shake.intensity > 0.02) {
        sx = Math.sin(frameCount.current * 1.3) * shake.intensity * 8;
        sy = Math.cos(frameCount.current * 0.9) * shake.intensity * 6;
        shake.intensity *= 0.76;
      } else {
        shake.intensity = 0;
      }

      // ══════════════════════════════════════════════
      // DIRECT DOM UPDATES (no React re-render!)
      // ══════════════════════════════════════════════

      // Move world container (+ shake)
      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${-camera.x - HALF + sx}px, ${-camera.y - HALF + sy}px, 0)`;
      }

      // Parallax background layer (0.3× camera speed)
      if (paralaxBgRef.current) {
        paralaxBgRef.current.style.transform = `translate3d(${-camera.x * 0.3 - BG_HALF}px, ${-camera.y * 0.3 - BG_HALF}px, 0)`;
      }

      // Parallax mid debris layer (0.65× camera speed)
      if (paralaxMidRef.current) {
        paralaxMidRef.current.style.transform = `translate3d(${-camera.x * 0.65 - MID_HALF}px, ${-camera.y * 0.65 - MID_HALF}px, 0)`;
      }

      // Rotate boat heading element
      if (boatHeadingRef.current) {
        boatHeadingRef.current.style.transform = `rotate(${boat.heading}deg) translateZ(0)`;
      }

      // ── Collision detection ──
      let closest: Mission | null = null;
      let closestDist = Infinity;
      for (const mission of missions) {
        const d = distance(boat.position, mission.position);
        if (d < COLLISION_RADIUS && d < closestDist) {
          closest = mission;
          closestDist = d;
        }
      }

      const prevId = nearbyRef.current?.id ?? null;
      const newId = closest?.id ?? null;
      if (prevId !== newId) {
        nearbyRef.current = closest;
        setNearbyIsland(closest);
      }
      if (gameStateRef.current !== "inspecting") {
        const newState = closest ? "near_island" : "sailing";
        if (gameStateRef.current !== newState) {
          gameStateRef.current = newState;
          setGameState(newState);
        }
      }

      // ── Collectible pickup ──
      for (const item of collectibles) {
        if (collectedRef.current.has(item.id)) continue;
        if (distance(boat.position, item.position) < COLLECT_RADIUS) {
          const next = new Set(collectedRef.current);
          next.add(item.id);
          collectedRef.current = next;
          scoreRef.current += item.points;
          saveCollected(next);
          setCollectedItems(new Set(next));
          setScore(scoreRef.current);
        }
      }

      // ── HUD updates (throttled to every 12 frames ≈ 5 fps) ──
      frameCount.current++;
      if (frameCount.current % 12 === 0) {
        setHudSpeed(speed);
        setHudHeading(boat.heading);
        setHudPosition({ x: boat.position.x, y: boat.position.y });
        setHudCoreTemp(coreTempRef.current);

        // Time of day — 90-second cosine cycle
        const todRaw = (Date.now() % 90_000) / 90_000;
        setTimeOfDay((1 - Math.cos(todRaw * Math.PI * 2)) / 2);

        // Nearest unvisited island bearing
        const unvisited = missions.filter(
          (m) => m.status === "active" && !visitedRef.current.has(m.id)
        );
        if (unvisited.length > 0) {
          let nearest = unvisited[0];
          let nearestDist = distance(boat.position, unvisited[0].position);
          for (const m of unvisited) {
            const d = distance(boat.position, m.position);
            if (d < nearestDist) { nearestDist = d; nearest = m; }
          }
          const dx = nearest.position.x - boat.position.x;
          const dy = nearest.position.y - boat.position.y;
          setNearestUnvisitedAngle(normalizeAngle(Math.atan2(dx, -dy) * (180 / Math.PI)));
        }

        // Enemy HUD snapshot
        setHudEnemies(enemyShipsRef.current.map(e => ({ id: e.id, x: e.x, y: e.y, heading: e.heading, state: e.state })));
        setHudBoilerHit(boilerHitRef.current > 0);

        // Fog of war zone revelation
        let fogChanged = false;
        for (let i = 0; i < fogZones.length; i++) {
          if (!fogZoneRevealedRef.current.has(i)) {
            if (distance(boat.position, fogZones[i]) < FOG_REVEAL_RADIUS) {
              const next = new Set(fogZoneRevealedRef.current);
              next.add(i);
              fogZoneRevealedRef.current = next;
              fogChanged = true;
            }
          }
        }
        if (fogChanged) setFogRevealedZones(new Set(fogZoneRevealedRef.current));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Actions ──
  const openBlueprint = useCallback(() => {
    const island = nearbyRef.current;
    if (island && island.status !== "locked") {
      setInspectedIsland(island);
      setGameState("inspecting");
      gameStateRef.current = "inspecting";
      setVisitedIds((prev) => {
        const next = new Set(prev);
        next.add(island.id);
        visitedRef.current = next;
        saveVisited(next);
        return next;
      });
    }
  }, []);

  const closeBlueprint = useCallback(() => {
    setInspectedIsland(null);
    setGameState("sailing");
    gameStateRef.current = "sailing";
  }, []);

  const navigateToIsland = useCallback((mission: Mission) => {
    autoNavTarget.current = { ...mission.position };
  }, []);

  // ── Treasure Map ──
  const [mapOpen, setMapOpen] = useState(false);
  const toggleMap = useCallback(() => setMapOpen((v) => !v), []);
  const closeMap = useCallback(() => setMapOpen(false), []);

  // ── ENTER / ESC / M ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && nearbyRef.current && gameStateRef.current === "near_island") {
        e.preventDefault();
        openBlueprint();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (gameStateRef.current === "inspecting") closeBlueprint();
        setMapOpen(false);
      }
      if (e.key.toLowerCase() === "m" && gameStateRef.current !== "inspecting") {
        e.preventDefault();
        setMapOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openBlueprint, closeBlueprint]);

  return {
    worldRef,
    boatRef: boatElRef,
    boatHeadingRef,
    paralaxBgRef,
    paralaxMidRef,
    gameState,
    nearbyIsland,
    inspectedIsland,
    visitedIds,
    hudSpeed,
    hudHeading,
    hudPosition,
    hudCoreTemp,
    timeOfDay,
    nearestUnvisitedAngle,
    fogRevealedZones,
    openBlueprint,
    closeBlueprint,
    navigateToIsland,
    mapOpen,
    toggleMap,
    closeMap,
    score,
    collectedItems,
    hudEnemies,
    hudBoilerHit,
    explodedBarrels,
    boatSquash,
    deckBoundaryWarning,
  };
}
