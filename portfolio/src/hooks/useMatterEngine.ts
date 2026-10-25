"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import {
  missions, Mission, SPAWN_POSITION, COLLISION_RADIUS,
  collectibles, fogZones, FOG_REVEAL_RADIUS,
} from "@/data/missions";
import { calculateGravityForce, predictTrajectory, Vec2 } from "@/systems/GravitySystem";
import {
  StressState, createStressState, applyImpact, tickStress, isHullCritical,
} from "@/systems/StressSystem";
import {
  HazardState, createHazardState, tickHazards, getPressureForce,
  isBoilerCritical, getBoilerSpeedMultiplier,
} from "@/systems/HazardZones";
import {
  SHIP_FRICTION_AIR, AutoNavTarget, applyManualHelm, steerAutoNav, applyHullDrag, clampShipSpeed,
} from "@/systems/shipControls";
import { createPhysicsWorld } from "@/systems/physicsWorld";
import { drawPhysicsOverlay } from "@/systems/drawPhysicsOverlay";
import {
  loadVisited, saveVisited, loadCollected, saveCollected, prefersReducedMotion,
} from "@/systems/gameStorage";
import type { GameState, VirtualJoystickInput, MatterEngine } from "./matterEngineTypes";
import { useGameKeyboard } from "./useGameKeyboard";

/* ─── Constants ─── */
const CAMERA_LERP = 0.09;
const COLLECT_RADIUS = 70;
/* Auto-nav parks just outside the island bumper but inside interaction range */
const ISLAND_ARRIVE_RADIUS = COLLISION_RADIUS - 6;
const HOME_ARRIVE_RADIUS = 60;

export type { GameState, VirtualJoystickInput, MatterEngine };

/* ─── Helpers ─── */
function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/* ─── Hook ─── */
export function useMatterEngine(): MatterEngine {
  // ── React state (drives HUD re-renders) ──
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

  // ── Mutable refs (read inside the frame loop) ──
  const cameraRef = useRef<Vec2>({ ...SPAWN_POSITION });
  const keysRef = useRef<Set<string>>(new Set());
  const virtualJoystickRef = useRef<VirtualJoystickInput>({ x: 0, y: 0, active: false });
  const autoNavTarget = useRef<AutoNavTarget | null>(null);
  const nearbyRef = useRef<Mission | null>(null);
  const gameStateRef = useRef<GameState>("sailing");
  const mapOpenRef = useRef(false);
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

  useEffect(() => { mapOpenRef.current = mapOpen; }, [mapOpen]);

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

  // ── Matter.js Engine Setup + Game Loop ──
  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    const { engine, ship } = createPhysicsWorld(({ kind, normal }) => {
      shakeRef.current.intensity = reducedMotion ? 0 : kind === "wall" ? 0.8 : kind === "barrel" ? 0.48 : 0.34;
      stressRef.current = applyImpact(
        stressRef.current,
        { x: ship.velocity.x, y: ship.velocity.y },
        normal,
        ship.mass,
      );
      if (boundaryHitCooldownRef.current === 0) {
        boundaryHitCooldownRef.current = 120;
        setBoatSquash(true);
        setTimeout(() => setBoatSquash(false), 600);
      }
    });

    let animId: number;

    const tick = () => {
      const camera = cameraRef.current;

      // ── Helm: auto-nav (quick travel) or manual input ──
      if (autoNavTarget.current) {
        if (steerAutoNav(ship, autoNavTarget.current, thrustLevelRef.current)) {
          autoNavTarget.current = null;
        }
      } else if (gameStateRef.current !== "inspecting") {
        applyManualHelm(
          ship,
          keysRef.current,
          virtualJoystickRef.current,
          thrustLevelRef.current,
          getBoilerSpeedMultiplier(hazardRef.current),
        );
      }
      applyHullDrag(ship);

      // ── Gravity + hazard forces ──
      Matter.Body.applyForce(ship, ship.position, calculateGravityForce(ship, nodeDataRef.current));
      const pressureForce = getPressureForce(ship.position.x, ship.position.y);
      if (pressureForce.x !== 0 || pressureForce.y !== 0) {
        Matter.Body.applyForce(ship, ship.position, pressureForce);
      }
      ship.frictionAir = SHIP_FRICTION_AIR + Math.max(0, hazardRef.current.thermalFrictionExtra);

      // ── Step Matter.js engine ──
      Matter.Engine.update(engine, 1000 / 60);
      clampShipSpeed(ship);

      // ── Stress / hazards ──
      const dockedAtPort = distance(ship.position, SPAWN_POSITION) < 120;
      if (dockedAtPort && Math.hypot(ship.velocity.x, ship.velocity.y) < 2.4) {
        Matter.Body.setVelocity(ship, { x: ship.velocity.x * 0.94, y: ship.velocity.y * 0.94 });
      }
      stressRef.current = tickStress(stressRef.current, dockedAtPort);
      hazardRef.current = tickHazards(ship.position.x, ship.position.y, hazardRef.current);

      // ── Camera + shake ──
      camera.x += (ship.position.x - camera.x) * CAMERA_LERP;
      camera.y += (ship.position.y - camera.y) * CAMERA_LERP;
      const shake = shakeRef.current;
      let sx = 0, sy = 0;
      if (shake.intensity > 0.02) {
        sx = Math.sin(frameCount.current * 1.3) * shake.intensity * 8;
        sy = Math.cos(frameCount.current * 0.9) * shake.intensity * 6;
        shake.intensity *= 0.76;
      } else {
        shake.intensity = 0;
      }
      if (boundaryHitCooldownRef.current > 0) boundaryHitCooldownRef.current--;

      // ── Direct DOM updates (no React re-render) ──
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
        boatHeadingRef.current.style.transform = `rotate(${(ship.angle * 180) / Math.PI}deg) translateZ(0)`;
      }

      // ── Canvas overlay (fields, hazards, trajectory) ──
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        drawPhysicsOverlay(ctx, canvas.width, canvas.height, {
          camera,
          shipPos: ship.position,
          frame: frameCount.current,
          trajectory: trajectoryRef.current,
          impactFlash: stressRef.current.impactFlash,
        });
      }

      // ── Nearby island ──
      let closest: Mission | null = null;
      let closestDist = Infinity;
      for (const mission of missions) {
        const d = distance(ship.position, mission.position);
        if (d < COLLISION_RADIUS && d < closestDist) {
          closest = mission;
          closestDist = d;
        }
      }
      if ((nearbyRef.current?.id ?? null) !== (closest?.id ?? null)) {
        nearbyRef.current = closest;
        setNearbyIsland(closest);
      }

      if (isDockedRef.current !== dockedAtPort) {
        isDockedRef.current = dockedAtPort;
        setIsDocked(dockedAtPort);
      }

      if (gameStateRef.current !== "inspecting") {
        const newState: GameState = dockedAtPort ? "docked" : closest ? "near_island" : "sailing";
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

      // ── HUD updates (throttled) ──
      frameCount.current++;
      if (frameCount.current % 16 === 0) {
        setHudSpeed(Math.hypot(ship.velocity.x, ship.velocity.y));
        setHudHeading(normalizeAngle((ship.angle * 180) / Math.PI));
        setHudPosition({ x: ship.position.x, y: ship.position.y });
        setHudBoilerPressure(hazardRef.current.boilerPressure);
        setStressState({ ...stressRef.current });
        setHazardState({ ...hazardRef.current });

        const traj = predictTrajectory(ship.position, ship.velocity, ship.mass, ship.frictionAir);
        trajectoryRef.current = traj;
        setTrajectoryPoints(traj);

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
          if (!fogZoneRevealedRef.current.has(i) && distance(ship.position, fogZones[i]) < FOG_REVEAL_RADIUS) {
            const next = new Set(fogZoneRevealedRef.current);
            next.add(i);
            fogZoneRevealedRef.current = next;
            fogChanged = true;
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
  const showInspection = useCallback((island: Mission) => {
    if (island.status === "locked") return;
    keysRef.current.clear();
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
  }, []);

  const openBlueprint = useCallback(() => {
    if (nearbyRef.current) showInspection(nearbyRef.current);
  }, [showInspection]);

  const navigateToIsland = useCallback((mission: Mission) => {
    autoNavTarget.current = { point: { ...mission.position }, arriveRadius: ISLAND_ARRIVE_RADIUS, stuckFrames: 0 };
  }, []);

  const inspectMission = useCallback((mission: Mission) => {
    setMapOpen(false);
    setPortShopOpen(false);
    navigateToIsland(mission);
    showInspection(mission);
  }, [navigateToIsland, showInspection]);

  const closeBlueprint = useCallback(() => {
    setInspectedIsland(null);
    setGameState("sailing");
    gameStateRef.current = "sailing";
  }, []);

  const returnHome = useCallback(() => {
    autoNavTarget.current = { point: { ...SPAWN_POSITION }, arriveRadius: HOME_ARRIVE_RADIUS, stuckFrames: 0 };
    setMapOpen(false);
    setPortShopOpen(false);
    if (gameStateRef.current === "inspecting") closeBlueprint();
  }, [closeBlueprint]);

  const toggleMap = useCallback(() => setMapOpen(v => !v), []);
  const openMap = useCallback(() => {
    setPortShopOpen(false);
    if (gameStateRef.current === "inspecting") closeBlueprint();
    setMapOpen(true);
  }, [closeBlueprint]);
  const closeMap = useCallback(() => setMapOpen(false), []);

  const openPortShop = useCallback(() => setPortShopOpen(true), []);
  const closePortShop = useCallback(() => setPortShopOpen(false), []);

  const repairHull = useCallback(() => {
    if (scoreRef.current < 50) return;
    scoreRef.current -= 50;
    setScore(scoreRef.current);
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
    if (input.active) autoNavTarget.current = null;
  }, []);

  // ── Keyboard: helm (WASD/arrows), ENTER, ESC, M ──
  useGameKeyboard({
    keysRef,
    isPanelOpen: () => gameStateRef.current === "inspecting" || mapOpenRef.current,
    onHelmInput: () => { autoNavTarget.current = null; },
    onEnter: () => {
      if (gameStateRef.current === "near_island" && nearbyRef.current) openBlueprint();
      else if (gameStateRef.current === "docked") setPortShopOpen(true);
    },
    onEscape: () => {
      if (gameStateRef.current === "inspecting") closeBlueprint();
      setMapOpen(false);
      setPortShopOpen(false);
    },
    onToggleMap: () => {
      if (gameStateRef.current !== "inspecting") setMapOpen(v => !v);
    },
  });

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
    inspectMission,
    closeBlueprint,
    navigateToIsland,
    returnHome,
    mapOpen,
    toggleMap,
    openMap,
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
