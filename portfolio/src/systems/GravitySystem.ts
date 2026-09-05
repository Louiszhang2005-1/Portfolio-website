/**
 * GravitySystem — Applies gravitational pull from mission nodes to the ship.
 * Uses the Law of Universal Gravitation: F = G * (m1 * m2) / r²
 */
import Matter from "matter-js";
import { missions } from "@/data/missions";

const G_CONSTANT = 0.00105;
const MIN_DISTANCE = 60;       // Prevent infinite force at zero distance
export const MAX_DISTANCE = 1150;      // Extended range for larger world
const TRAJECTORY_STEPS = 90;   // ~1.5s lookahead at 60fps

export interface Vec2 { x: number; y: number; }

/**
 * Calculate the combined gravitational force on the ship from all nodes.
 */
export function calculateGravityForce(
  shipBody: Matter.Body,
  nodePositions: { x: number; y: number; gravityMass: number }[]
): Vec2 {
  let fx = 0;
  let fy = 0;

  for (const node of nodePositions) {
    const dx = node.x - shipBody.position.x;
    const dy = node.y - shipBody.position.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist > MAX_DISTANCE || dist < 1) continue;

    const clampedDist = Math.max(dist, MIN_DISTANCE);
    const forceMag = (G_CONSTANT * shipBody.mass * node.gravityMass) / (clampedDist * clampedDist);

    // Normalize direction and apply force magnitude
    fx += (dx / dist) * forceMag;
    fy += (dy / dist) * forceMag;
  }

  return { x: fx, y: fy };
}

/**
 * Predict the trajectory path for the next TRAJECTORY_STEPS frames.
 * Returns an array of {x, y} world positions.
 * Uses simple Euler integration with gravity — lightweight, no engine clone needed.
 */
export function predictTrajectory(
  shipPos: Vec2,
  shipVel: Vec2,
  shipMass: number,
  frictionAir: number,
): Vec2[] {
  const points: Vec2[] = [];
  let px = shipPos.x;
  let py = shipPos.y;
  let vx = shipVel.x;
  let vy = shipVel.y;

  const nodeData = missions.map(m => ({
    x: m.position.x,
    y: m.position.y,
    gravityMass: m.gravityMass,
  }));

  for (let i = 0; i < TRAJECTORY_STEPS; i++) {
    // Calculate gravity at current predicted position
    let fx = 0, fy = 0;
    for (const node of nodeData) {
      const dx = node.x - px;
      const dy = node.y - py;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      if (dist > MAX_DISTANCE || dist < 1) continue;
      const clampedDist = Math.max(dist, MIN_DISTANCE);
      const forceMag = (G_CONSTANT * shipMass * node.gravityMass) / (clampedDist * clampedDist);
      fx += (dx / dist) * forceMag;
      fy += (dy / dist) * forceMag;
    }

    // Apply force / mass = acceleration
    vx += fx / shipMass;
    vy += fy / shipMass;

    // Apply air friction
    vx *= (1 - frictionAir);
    vy *= (1 - frictionAir);

    // Integrate position
    px += vx;
    py += vy;

    // Sample every 3rd point to keep array small
    if (i % 3 === 0) {
      points.push({ x: px, y: py });
    }
  }

  return points;
}

/**
 * Get the nearest node and its gravity strength for HUD display.
 */
export function getNearestGravityInfo(
  shipPos: Vec2,
): { angle: number; strength: number; distance: number } | null {
  let strongest: { angle: number; strength: number; distance: number } | null = null;
  let maxForce = 0;

  for (const m of missions) {
    const dx = m.position.x - shipPos.x;
    const dy = m.position.y - shipPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_DISTANCE || dist < 1) continue;

    const clamped = Math.max(dist, MIN_DISTANCE);
    const force = (G_CONSTANT * 8 * m.gravityMass) / (clamped * clamped);
    if (force > maxForce) {
      maxForce = force;
      strongest = {
        angle: Math.atan2(dx, -dy) * (180 / Math.PI),
        strength: Math.min(1, force * 800),
        distance: dist,
      };
    }
  }

  return strongest;
}
