"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import {
  missions, Mission, SPAWN_POSITION, WORLD_BOUNDS, COLLISION_RADIUS,
  collectibles, fogZones, FOG_REVEAL_RADIUS, hazardZones, barrels,
} from "@/data/missions";
import { calculateGravityForce, predictTrajectory, Vec2 } from "@/systems/GravitySystem";
import {
  StressState, createStressState, applyImpact, tickStress, isHullCritical,
} from "@/systems/StressSystem";
import {
  HazardState, createHazardState, tickHazards, getPressureForce,
  isBoilerCritical, getBoilerSpeedMultiplier,
} from "@/systems/HazardZones";

/* ─── Constants ─── */
const SHIP_MASS = 8;
const SHIP_FRICTION_AIR = 0.019;
const THRUST_FORCE = 0.0052;
const REVERSE_FORCE = 0.003;
const MAX_SHIP_SPEED = 5.1;
const TURN_TORQUE = 0.06;
const RUDDER_DRAG = 0.0026;
const CAMERA_LERP = 0.09;
const STORAGE_KEY = "isle-commander-visited";
const STORAGE_KEY_COLLECTED = "isle-commander-collected";
const COLLECT_RADIUS = 70;
const ISLAND_BUMPER_RADIUS = 76;
const BARREL_BUMPER_RADIUS = 28;

/* ─── Pre-computed mission color cache (computed once at module load) ─── */
const missionColorCache: Record<string, { r: number; g: number; b: number }> = {};
for (const _m of missions) {
  const hex = _m.color.length === 7 ? _m.color : "#00ccff";
  missionColorCache[_m.id] = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/* ─── Types ─── */
export type GameState = "sailing" | "near_island" | "inspecting" | "docked";

export interface MatterEngine {
  worldRef: React.RefObject<HTMLDivElement | null>;
  boatHeadingRef: React.RefObject<HTMLDivElement | null>;
  paralaxBgRef: React.RefObject<HTMLDivElement | null>;
  paralaxMidRef: React.RefObject<HTMLDivElement | null>;
  paralaxFgRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  nearbyIsland: Mission | null;
  inspectedIsland: Mission | null;
  visitedIds: Set<string>;
  hudSpeed: number;
  hudHeading: number;
  hudPosition: Vec2;
  hudBoilerPressure: number;
  stressState: StressState;
  hazardState: HazardState;
  trajectoryPoints: Vec2[];
  timeOfDay: number;
  nearestGravityAngle: number;
  fogRevealedZones: Set<number>;
  openBlueprint: () => void;
  closeBlueprint: () => void;
  navigateToIsland: (mission: Mission) => void;
  returnHome: () => void;
  mapOpen: boolean;
  toggleMap: () => void;
  closeMap: () => void;
  score: number;
  collectedItems: Set<string>;
  boatSquash: boolean;
  isHullCritical: boolean;
  isBoilerCritical: boolean;
  portShopOpen: boolean;
  openPortShop: () => void;
  closePortShop: () => void;
  repairHull: () => void;
  upgradeThrust: () => void;
  setVirtualJoystickInput: (input: VirtualJoystickInput) => void;
  thrustLevel: number;
  isDocked: boolean;
}

export interface VirtualJoystickInput {
  x: number;
  y: number;
  active: boolean;
}

/* ─── Helpers ─── */
function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch { /* */ }
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
  try { localStorage.setItem(STORAGE_KEY_COLLECTED, JSON.stringify([...ids])); } catch { /* */ }
}

/* ─── Hook ─── */
export function useMatterEngine(): MatterEngine {
  // ── React state ──
  const [gameState, setGameState] = useState<GameState>("sailing");
  const [nearbyIsland, setNearbyIsland] = useState<Mission | null>(null);
  const [inspectedIsland, setInspectedIsland] = useState<Mission | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [collectedItems, setCollectedItems] = useState<Set<string>>(new Set());
  const [hudSpeed, setHudSpeed] = useState(0);
  const [hudHeading, setHudHeading] = useState(0);
  const [hudPosition, setHudPosition] = useState<Vec2>({ x: 0, y: 0 });
  const [hudBoilerPressure, setHudBoilerPressure] = useState(0);
  const [stressState, setStressState] = useState<StressState>(createStressState());
  const [hazardState, setHazardState] = useState<HazardState>(createHazardState());
  const [trajectoryPoints, setTrajectoryPoints] = useState<Vec2[]>([]);
  const [timeOfDay, setTimeOfDay] = useState(0);
  const [nearestGravityAngle, setNearestGravityAngle] = useState(0);
  const [fogRevealedZones, setFogRevealedZones] = useState<Set<number>>(new Set());
  const [boatSquash, setBoatSquash] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [portShopOpen, setPortShopOpen] = useState(false);
  const [thrustLevel, setThrustLevel] = useState(0); // 0-3 upgrades
  const [isDocked, setIsDocked] = useState(false);

  // ── DOM refs ──
  const worldRef = useRef<HTMLDivElement>(null);
  const boatHeadingRef = useRef<HTMLDivElement>(null);
  const paralaxBgRef = useRef<HTMLDivElement>(null);
  const paralaxMidRef = useRef<HTMLDivElement>(null);
  const paralaxFgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Internal refs ──
  const engineRef = useRef<Matter.Engine | null>(null);
  const shipBodyRef = useRef<Matter.Body | null>(null);
  const cameraRef = useRef<Vec2>({ ...SPAWN_POSITION });
  const keysRef = useRef<Set<string>>(new Set());
  const virtualJoystickRef = useRef<VirtualJoystickInput>({ x: 0, y: 0, active: false });
  const autoNavTarget = useRef<Vec2 | null>(null);
  const nearbyRef = useRef<Mission | null>(null);
  const gameStateRef = useRef<GameState>("sailing");
  const frameCount = useRef(0);
  const collectedRef = useRef<Set<string>>(new Set());
  const scoreRef = useRef(0);
  const visitedRef = useRef<Set<string>>(new Set());
  const shakeRef = useRef({ intensity: 0 });
  const stressRef = useRef<StressState>(createStressState());
  const hazardRef = useRef<HazardState>(createHazardState());
  const fogZoneRevealedRef = useRef<Set<number>>(new Set());
  const thrustLevelRef = useRef(0);
  const isDockedRef = useRef(false);
  const boundaryHitCooldownRef = useRef(0);
  const trajectoryRef = useRef<Vec2[]>([]);
  const nodeDataRef = useRef(missions.map(m => ({
    x: m.position.x, y: m.position.y, gravityMass: m.gravityMass,
  })));

  // Parallax constants — scaled for WORLD_BOUNDS=2000
  const WORLD_SIZE = 5000;
  const HALF = WORLD_SIZE / 2;
  const BG_HALF = 6000;
  const MID_HALF = 5000;
  const FG_HALF = 3500;

  // Load persisted state
  useEffect(() => {
    const storedVisited = loadVisited();
    if (storedVisited.size > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // ── Matter.js Engine Setup + Game Loop ──
  useEffect(() => {
    // Create physics engine (no built-in gravity — we use custom gravity)
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
    });
    engineRef.current = engine;

    // Create ship body
    const ship = Matter.Bodies.polygon(
      SPAWN_POSITION.x,
      SPAWN_POSITION.y,
      6, // hexagon
      22,
      {
        mass: SHIP_MASS,
        frictionAir: SHIP_FRICTION_AIR,
        restitution: 0.3,
        label: "ship",
        inertia: Infinity, // prevent angular velocity from collisions, we control rotation
        inverseInertia: 0,
      }
    );
    Matter.Body.setMass(ship, SHIP_MASS);
    shipBodyRef.current = ship;

    // Create world boundary walls (static)
    const wallThickness = 100;
    const walls = [
      Matter.Bodies.rectangle(0, -WORLD_BOUNDS - wallThickness / 2, WORLD_BOUNDS * 3, wallThickness, { isStatic: true, label: "wall", restitution: 0.5 }),
      Matter.Bodies.rectangle(0, WORLD_BOUNDS + wallThickness / 2, WORLD_BOUNDS * 3, wallThickness, { isStatic: true, label: "wall", restitution: 0.5 }),
      Matter.Bodies.rectangle(-WORLD_BOUNDS - wallThickness / 2, 0, wallThickness, WORLD_BOUNDS * 3, { isStatic: true, label: "wall", restitution: 0.5 }),
      Matter.Bodies.rectangle(WORLD_BOUNDS + wallThickness / 2, 0, wallThickness, WORLD_BOUNDS * 3, { isStatic: true, label: "wall", restitution: 0.5 }),
    ];

    const islandBumpers = missions
      .filter((mission) => mission.status !== "locked")
      .map((mission) => Matter.Bodies.circle(
        mission.position.x,
        mission.position.y,
        ISLAND_BUMPER_RADIUS,
        {
          isStatic: true,
          label: `island:${mission.id}`,
          restitution: 0.62,
          friction: 0.05,
          frictionStatic: 0.05,
        },
      ));

    const barrelBumpers = barrels.map((barrel) => Matter.Bodies.circle(
      barrel.position.x,
      barrel.position.y,
      BARREL_BUMPER_RADIUS,
      {
        isStatic: true,
        label: `barrel:${barrel.id}`,
        restitution: 0.82,
        friction: 0.02,
        frictionStatic: 0.02,
      },
    ));

    // Add all bodies to world
    Matter.Composite.add(engine.world, [ship, ...walls, ...islandBumpers, ...barrelBumpers]);

    // ── Collision Handler ──
    Matter.Events.on(engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        const isShip = pair.bodyA === ship || pair.bodyB === ship;
        if (!isShip) continue;

        const other = pair.bodyA === ship ? pair.bodyB : pair.bodyA;
        const collision = pair.collision;

        if (other.label === "wall" || other.label.startsWith("island:") || other.label.startsWith("barrel:")) {
          // Boundary collision — shake + stress
          const speed = Math.sqrt(ship.velocity.x ** 2 + ship.velocity.y ** 2);
          const isBarrel = other.label.startsWith("barrel:");
          const isIsland = other.label.startsWith("island:");
          shakeRef.current.intensity = other.label === "wall" ? 0.8 : isBarrel ? 0.48 : 0.34;
          stressRef.current = applyImpact(
            stressRef.current,
            { x: ship.velocity.x, y: ship.velocity.y },
            collision.normal,
            ship.mass,
          );
          if (isBarrel || (isIsland && speed > 1.15)) {
            Matter.Body.applyForce(ship, ship.position, {
              x: collision.normal.x * (isBarrel ? 0.032 : 0.018),
              y: collision.normal.y * (isBarrel ? 0.032 : 0.018),
            });
          }
          if (boundaryHitCooldownRef.current === 0) {
            boundaryHitCooldownRef.current = 120;
            setBoatSquash(true);
            setTimeout(() => setBoatSquash(false), 600);
          }
        }
      }
    });

    // ── Game Loop (runs every frame via beforeUpdate) ──
    let animId: number;

    const tick = () => {
      const keys = keysRef.current;
      const camera = cameraRef.current;

      if (!ship || !engine) { animId = requestAnimationFrame(tick); return; }

      // ── Auto-nav ──
      if (autoNavTarget.current) {
        const target = autoNavTarget.current;
        const dx = target.x - ship.position.x;
        const dy = target.y - ship.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
          autoNavTarget.current = null;
        } else {
          const targetAngle = Math.atan2(dx, -dy);
          Matter.Body.setAngle(ship, targetAngle);
          const thrustMult = 1 + thrustLevelRef.current * 0.15;
          const force = THRUST_FORCE * thrustMult;
          Matter.Body.applyForce(ship, ship.position, {
            x: Math.sin(ship.angle) * force,
            y: -Math.cos(ship.angle) * force,
          });
        }
      } else {
        // ── Manual input ──
        const joystick = virtualJoystickRef.current;
        const keyboardTurn =
          (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
          (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
        const keyboardThrottle =
          (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
          (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
        const turnInput = joystick.active ? joystick.x : keyboardTurn;
        const throttleInput = joystick.active ? -joystick.y : keyboardThrottle;
        const speedRatio = Math.min(1, Math.sqrt(ship.velocity.x ** 2 + ship.velocity.y ** 2) / MAX_SHIP_SPEED);
        const rudderAuthority = 0.42 + speedRatio * 0.78;

        if (Math.abs(turnInput) > 0.04) {
          Matter.Body.setAngle(ship, ship.angle + turnInput * TURN_TORQUE * rudderAuthority);
        }
        if (throttleInput > 0.05) {
          const thrustMult = 1 + thrustLevelRef.current * 0.15;
          const force = THRUST_FORCE * thrustMult;
          const boilerMult = getBoilerSpeedMultiplier(hazardRef.current);
          Matter.Body.applyForce(ship, ship.position, {
            x: Math.sin(ship.angle) * force * boilerMult * throttleInput,
            y: -Math.cos(ship.angle) * force * boilerMult * throttleInput,
          });
        }
        if (throttleInput < -0.05) {
          const force = REVERSE_FORCE;
          Matter.Body.applyForce(ship, ship.position, {
            x: -Math.sin(ship.angle) * force * Math.abs(throttleInput),
            y: Math.cos(ship.angle) * force * Math.abs(throttleInput),
          });
        }
      }

      // A little lateral water resistance makes the hull carve instead of skate.
      const forwardX = Math.sin(ship.angle);
      const forwardY = -Math.cos(ship.angle);
      const sideX = Math.cos(ship.angle);
      const sideY = Math.sin(ship.angle);
      const sideSpeed = ship.velocity.x * sideX + ship.velocity.y * sideY;
      const reverseSpeed = -(ship.velocity.x * forwardX + ship.velocity.y * forwardY);
      Matter.Body.applyForce(ship, ship.position, {
        x: -sideX * sideSpeed * RUDDER_DRAG,
        y: -sideY * sideSpeed * RUDDER_DRAG,
      });
      if (reverseSpeed > 0.2) {
        Matter.Body.applyForce(ship, ship.position, {
          x: forwardX * reverseSpeed * RUDDER_DRAG * 0.25,
          y: forwardY * reverseSpeed * RUDDER_DRAG * 0.25,
        });
      }

      // ── Apply gravity ──
      const gravForce = calculateGravityForce(ship, nodeDataRef.current);
      Matter.Body.applyForce(ship, ship.position, gravForce);

      // ── Apply hazard forces ──
      const pressureForce = getPressureForce(ship.position.x, ship.position.y);
      if (pressureForce.x !== 0 || pressureForce.y !== 0) {
        Matter.Body.applyForce(ship, ship.position, pressureForce);
      }

      // ── Apply thermal friction ──
      const currentHazard = hazardRef.current;
      if (currentHazard.thermalFrictionExtra > 0) {
        ship.frictionAir = SHIP_FRICTION_AIR + currentHazard.thermalFrictionExtra;
      } else {
        ship.frictionAir = SHIP_FRICTION_AIR;
      }

      // ── Step Matter.js engine ──
      Matter.Engine.update(engine, 1000 / 60);

      const currentSpeed = Math.sqrt(ship.velocity.x ** 2 + ship.velocity.y ** 2);
      if (currentSpeed > MAX_SHIP_SPEED) {
        const speedScale = MAX_SHIP_SPEED / currentSpeed;
        Matter.Body.setVelocity(ship, {
          x: ship.velocity.x * speedScale,
          y: ship.velocity.y * speedScale,
        });
      }

      // ── Tick stress ──
      const dockedAtPort = distance(ship.position, SPAWN_POSITION) < 120;
      if (dockedAtPort && Math.sqrt(ship.velocity.x ** 2 + ship.velocity.y ** 2) < 2.4) {
        Matter.Body.setVelocity(ship, {
          x: ship.velocity.x * 0.94,
          y: ship.velocity.y * 0.94,
        });
      }
      stressRef.current = tickStress(stressRef.current, dockedAtPort);

      // ── Tick hazards ──
      hazardRef.current = tickHazards(ship.position.x, ship.position.y, hazardRef.current);

      // ── Camera ──
      camera.x += (ship.position.x - camera.x) * CAMERA_LERP;
      camera.y += (ship.position.y - camera.y) * CAMERA_LERP;

      // ── Shake ──
      const shake = shakeRef.current;
      let sx = 0, sy = 0;
      if (shake.intensity > 0.02) {
        sx = Math.sin(frameCount.current * 1.3) * shake.intensity * 8;
        sy = Math.cos(frameCount.current * 0.9) * shake.intensity * 6;
        shake.intensity *= 0.76;
      } else {
        shake.intensity = 0;
      }

      // ── Boundary cooldown ──
      if (boundaryHitCooldownRef.current > 0) boundaryHitCooldownRef.current--;

      // ══════════════════════════════════════════════
      // DIRECT DOM UPDATES (no React re-render)
      // ══════════════════════════════════════════════

      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${-camera.x - HALF + sx}px, ${-camera.y - HALF + sy}px, 0)`;
      }
      if (paralaxBgRef.current) {
        paralaxBgRef.current.style.transform = `translate3d(${-camera.x * 0.5 - BG_HALF}px, ${-camera.y * 0.5 - BG_HALF}px, 0)`;
      }
      if (paralaxMidRef.current) {
        paralaxMidRef.current.style.transform = `translate3d(${-camera.x * 0.65 - MID_HALF}px, ${-camera.y * 0.65 - MID_HALF}px, 0)`;
      }
      if (paralaxFgRef.current) {
        paralaxFgRef.current.style.transform = `translate3d(${-camera.x * 1.2 - FG_HALF}px, ${-camera.y * 1.2 - FG_HALF}px, 0)`;
      }
      if (boatHeadingRef.current) {
        const headingDeg = (ship.angle * 180) / Math.PI;
        boatHeadingRef.current.style.transform = `rotate(${headingDeg}deg) translateZ(0)`;
      }

      // ── Canvas drawing (trajectory + gravity fields + hazards) ──
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          const w = canvasRef.current.width;
          const h = canvasRef.current.height;
          ctx.clearRect(0, 0, w, h);

          const cx = w / 2 - camera.x;
          const cy = h / 2 - camera.y;

          const colorCache = missionColorCache;

          // Draw force fields: proximity-sensor activated
          const time = frameCount.current * 0.03;
          const FIELD_ACTIVATE_DIST = 900;
          const FIELD_FULL_DIST = 460;

          for (const m of missions) {
            if (m.status === "locked") continue;

            const screenX = m.position.x + cx;
            const screenY = m.position.y + cy;
            const fieldR = (m.fieldRadius ?? 250) * 1.65;

            if (screenX < -fieldR - 50 || screenX > w + fieldR + 50 || screenY < -fieldR - 50 || screenY > h + fieldR + 50) continue;

            const dx = m.position.x - ship.position.x;
            const dy = m.position.y - ship.position.y;
            const distToShip = Math.sqrt(dx * dx + dy * dy);
            const col = colorCache[m.id] ?? { r: 0, g: 200, b: 255 };

            // Far away: single cheap ring
            if (distToShip > FIELD_ACTIVATE_DIST) {
              ctx.beginPath();
              ctx.arc(screenX, screenY, fieldR * 0.7, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, 0.08)`;
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 8]);
              ctx.stroke();
              ctx.setLineDash([]);
              continue;
            }

            // Proximity: 0 at 700px, 1 at 350px
            const proxFactor = Math.max(0, Math.min(1, (FIELD_ACTIVATE_DIST - distToShip) / (FIELD_ACTIVATE_DIST - FIELD_FULL_DIST)));

            if (m.fieldType === "typhoon") {
              const particleCount = Math.floor(12 + proxFactor * 20);
              const baseAlpha = proxFactor * (0.3 + proxFactor * 0.25);
              ctx.lineWidth = 2 + proxFactor * 1.5;
              for (let i = 0; i < particleCount; i++) {
                const seed = i * 137.508 + m.gravityMass;
                const spiralAngle = (seed % (Math.PI * 2)) + time * (0.8 + (i % 3) * 0.3);
                const radiusFraction = ((i * 0.618 + time * 0.08) % 1);
                const r = radiusFraction * fieldR;
                const px = screenX + Math.cos(spiralAngle + radiusFraction * 5) * r;
                const py = screenY + Math.sin(spiralAngle + radiusFraction * 5) * r;
                const trailAngle = spiralAngle - 0.2;
                const trailR = r + 10;
                const tx = screenX + Math.cos(trailAngle + radiusFraction * 5) * trailR;
                const ty = screenY + Math.sin(trailAngle + radiusFraction * 5) * trailR;
                const alpha = baseAlpha * (1 - radiusFraction * 0.6);
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(px, py);
                ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
                ctx.stroke();
              }
              if (proxFactor > 0.2) {
                for (let ring = 0; ring < 2; ring++) {
                  const ringR = fieldR * (0.6 + ring * 0.25);
                  const ringAlpha = proxFactor * 0.15 * (1 - ring * 0.3);
                  ctx.beginPath();
                  for (let s = 0; s <= 20; s++) {
                    const a = (s / 20) * Math.PI * 2;
                    const wobble = Math.sin(a * 5 + time * 2 + ring) * (6 + proxFactor * 10);
                    const rx = screenX + Math.cos(a) * (ringR + wobble);
                    const ry = screenY + Math.sin(a) * (ringR + wobble);
                    if (s === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                  }
                  ctx.closePath();
                  ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${ringAlpha})`;
                  ctx.lineWidth = 1.5;
                  ctx.setLineDash([4, 4]);
                  ctx.stroke();
                  ctx.setLineDash([]);
                }
              }
              if (proxFactor > 0.15) {
                const coreAlpha = proxFactor * 0.2;
                const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, fieldR * 0.45);
                grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${coreAlpha})`);
                grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(screenX, screenY, fieldR * 0.45, 0, Math.PI * 2);
                ctx.fill();
              }
            } else {
              const streamCount = Math.floor(8 + proxFactor * 10);
              const baseAlpha = proxFactor * (0.25 + proxFactor * 0.2);
              ctx.lineWidth = 1.5 + proxFactor * 1;
              for (let i = 0; i < streamCount; i++) {
                const angle = (i / streamCount) * Math.PI * 2 + time * 0.35;
                const startR = fieldR * (0.88 + Math.sin(i * 2.3 + time) * 0.08);
                const endR = 12 + Math.sin(i * 1.7 + time * 1.5) * 6;
                ctx.beginPath();
                for (let s = 0; s <= 6; s++) {
                  const t = s / 6;
                  const r = startR + (endR - startR) * t * t;
                  const a = angle + t * 2;
                  ctx.lineTo(screenX + Math.cos(a) * r, screenY + Math.sin(a) * r);
                }
                ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${baseAlpha * (0.5 + Math.sin(i * 3.1 + time * 2) * 0.3)})`;
                ctx.stroke();
              }
              const dotCount = Math.floor(6 + proxFactor * 10);
              for (let i = 0; i < dotCount; i++) {
                const seed = i * 0.618 * Math.PI * 2;
                const orbitSpeed = 0.4 + (i % 4) * 0.25;
                const radiusFraction = ((i * 0.382 + time * 0.06 * orbitSpeed) % 1);
                const r = radiusFraction * fieldR;
                const a = seed + time * orbitSpeed + (1 - radiusFraction) * 3;
                const dotSize = (2 + proxFactor * 2) * (1 - radiusFraction * 0.5);
                ctx.beginPath();
                ctx.arc(screenX + Math.cos(a) * r, screenY + Math.sin(a) * r, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${baseAlpha * (1 - radiusFraction) * 1.3})`;
                ctx.fill();
              }
              if (proxFactor > 0.2) {
                const hAlpha = proxFactor * 0.2;
                const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, fieldR * 0.35);
                grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${hAlpha})`);
                grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(screenX, screenY, fieldR * 0.35, 0, Math.PI * 2);
                ctx.fill();
              }
              if (proxFactor > 0.1) {
                ctx.beginPath();
                ctx.arc(screenX, screenY, fieldR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${proxFactor * 0.15})`;
                ctx.lineWidth = 1.5 + proxFactor;
                ctx.setLineDash([3, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
              }
            }
          }

          // Draw hazard zones
          for (const zone of hazardZones) {
            const zx = zone.position.x + cx;
            const zy = zone.position.y + cy;
            if (zx < -zone.radius || zx > w + zone.radius || zy < -zone.radius || zy > h + zone.radius) continue;

            const grad = ctx.createRadialGradient(zx, zy, 0, zx, zy, zone.radius);
            if (zone.type === "thermal") {
              grad.addColorStop(0, `rgba(255, 100, 20, ${zone.intensity * 0.2})`);
              grad.addColorStop(0.6, `rgba(255, 60, 0, ${zone.intensity * 0.1})`);
              grad.addColorStop(1, "rgba(255, 60, 0, 0)");
            } else {
              grad.addColorStop(0, `rgba(80, 50, 200, ${zone.intensity * 0.15})`);
              grad.addColorStop(0.6, `rgba(100, 60, 220, ${zone.intensity * 0.08})`);
              grad.addColorStop(1, "rgba(100, 60, 220, 0)");
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(zx, zy, zone.radius, 0, Math.PI * 2);
            ctx.fill();

            // Zone boundary ring
            ctx.beginPath();
            ctx.arc(zx, zy, zone.radius, 0, Math.PI * 2);
            ctx.strokeStyle = zone.type === "thermal"
              ? `rgba(255, 120, 40, ${zone.intensity * 0.3})`
              : `rgba(120, 80, 255, ${zone.intensity * 0.25})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Draw trajectory path
          const traj = trajectoryRef.current;
          if (traj.length > 2) {
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2); // starts at ship
            for (const pt of traj) {
              ctx.lineTo(pt.x + cx, pt.y + cy);
            }
            ctx.strokeStyle = "rgba(0, 220, 255, 0.35)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Draw stress flash on ship
          if (stressRef.current.impactFlash > 0) {
            const flashAlpha = stressRef.current.impactFlash / 30;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 50, 20, ${flashAlpha * 0.4})`;
            ctx.fill();
          }
        }
      }

      // ── Collision detection (nearby island) ──
      let closest: Mission | null = null;
      let closestDist = Infinity;
      for (const mission of missions) {
        const d = distance(ship.position, mission.position);
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

      // Check docked at port
      const nowDocked = dockedAtPort;
      if (isDockedRef.current !== nowDocked) {
        isDockedRef.current = nowDocked;
        setIsDocked(nowDocked);
      }

      if (gameStateRef.current !== "inspecting") {
        const newState: GameState = nowDocked ? "docked" : closest ? "near_island" : "sailing";
        if (gameStateRef.current !== newState) {
          gameStateRef.current = newState;
          setGameState(newState);
        }
      }

      // ── Collectible pickup ──
      for (const item of collectibles) {
        if (collectedRef.current.has(item.id)) continue;
        if (distance(ship.position, item.position) < COLLECT_RADIUS) {
          const next = new Set(collectedRef.current);
          next.add(item.id);
          collectedRef.current = next;
          scoreRef.current += item.points;
          saveCollected(next);
          setCollectedItems(new Set(next));
          setScore(scoreRef.current);
        }
      }

      // ── HUD updates (throttled to every 10 frames) ──
      frameCount.current++;
      if (frameCount.current % 16 === 0) {
        const speed = Math.sqrt(ship.velocity.x ** 2 + ship.velocity.y ** 2);
        setHudSpeed(speed);
        setHudHeading(normalizeAngle((ship.angle * 180) / Math.PI));
        setHudPosition({ x: ship.position.x, y: ship.position.y });
        setHudBoilerPressure(hazardRef.current.boilerPressure);
        setStressState({ ...stressRef.current });
        setHazardState({ ...hazardRef.current });

        // Trajectory prediction (every 10 frames)
        const traj = predictTrajectory(
          ship.position,
          ship.velocity,
          ship.mass,
          ship.frictionAir,
        );
        trajectoryRef.current = traj;
        setTrajectoryPoints(traj);

        // Time of day
        const todRaw = (Date.now() % 90_000) / 90_000;
        setTimeOfDay((1 - Math.cos(todRaw * Math.PI * 2)) / 2);

        // Nearest gravity source for compass
        let maxGrav = 0;
        let gravAngle = 0;
        for (const m of missions) {
          if (m.status !== "active") continue;
          const dx = m.position.x - ship.position.x;
          const dy = m.position.y - ship.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1000 || dist < 1) continue;
          const force = m.gravityMass / (dist * dist);
          if (force > maxGrav) {
            maxGrav = force;
            gravAngle = normalizeAngle(Math.atan2(dx, -dy) * (180 / Math.PI));
          }
        }
        setNearestGravityAngle(gravAngle);

        // Fog of war
        let fogChanged = false;
        for (let i = 0; i < fogZones.length; i++) {
          if (!fogZoneRevealedRef.current.has(i)) {
            if (distance(ship.position, fogZones[i]) < FOG_REVEAL_RADIUS) {
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
    return () => {
      cancelAnimationFrame(animId);
      Matter.Engine.clear(engine);
    };
  }, [HALF]);

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

  const returnHome = useCallback(() => {
    autoNavTarget.current = { ...SPAWN_POSITION };
    setMapOpen(false);
    setPortShopOpen(false);
    if (gameStateRef.current === "inspecting") {
      setInspectedIsland(null);
      setGameState("sailing");
      gameStateRef.current = "sailing";
    }
  }, []);

  const toggleMap = useCallback(() => setMapOpen(v => !v), []);
  const closeMap = useCallback(() => setMapOpen(false), []);

  const openPortShop = useCallback(() => setPortShopOpen(true), []);
  const closePortShop = useCallback(() => setPortShopOpen(false), []);

  const repairHull = useCallback(() => {
    if (scoreRef.current < 50) return;
    scoreRef.current -= 50;
    setScore(scoreRef.current);
    // Halve all stress zones
    stressRef.current = {
      ...stressRef.current,
      zones: stressRef.current.zones.map(z => z * 0.5),
      totalStress: stressRef.current.totalStress * 0.5,
    };
    setStressState({ ...stressRef.current });
  }, []);

  const upgradeThrust = useCallback(() => {
    if (scoreRef.current < 100 || thrustLevelRef.current >= 3) return;
    scoreRef.current -= 100;
    setScore(scoreRef.current);
    thrustLevelRef.current++;
    setThrustLevel(thrustLevelRef.current);
  }, []);

  const setVirtualJoystickInput = useCallback((input: VirtualJoystickInput) => {
    const x = Math.max(-1, Math.min(1, input.x));
    const y = Math.max(-1, Math.min(1, input.y));
    virtualJoystickRef.current = {
      x: Math.abs(x) < 0.04 ? 0 : x,
      y: Math.abs(y) < 0.04 ? 0 : y,
      active: input.active,
    };
    if (input.active) {
      autoNavTarget.current = null;
    }
  }, []);

  // ── ENTER / ESC / M ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (gameStateRef.current === "near_island" && nearbyRef.current) {
          openBlueprint();
        } else if (gameStateRef.current === "docked") {
          setPortShopOpen(true);
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (gameStateRef.current === "inspecting") closeBlueprint();
        setMapOpen(false);
        setPortShopOpen(false);
      }
      if (e.key.toLowerCase() === "m" && gameStateRef.current !== "inspecting") {
        e.preventDefault();
        setMapOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openBlueprint, closeBlueprint]);

  return {
    worldRef,
    boatHeadingRef,
    paralaxBgRef,
    paralaxMidRef,
    paralaxFgRef,
    canvasRef,
    gameState,
    nearbyIsland,
    inspectedIsland,
    visitedIds,
    hudSpeed,
    hudHeading,
    hudPosition,
    hudBoilerPressure,
    stressState,
    hazardState,
    trajectoryPoints,
    timeOfDay,
    nearestGravityAngle,
    fogRevealedZones,
    openBlueprint,
    closeBlueprint,
    navigateToIsland,
    returnHome,
    mapOpen,
    toggleMap,
    closeMap,
    score,
    collectedItems,
    boatSquash,
    isHullCritical: isHullCritical(stressState),
    isBoilerCritical: isBoilerCritical(hazardState),
    portShopOpen,
    openPortShop,
    closePortShop,
    repairHull,
    upgradeThrust,
    setVirtualJoystickInput,
    thrustLevel,
    isDocked,
  };
}
