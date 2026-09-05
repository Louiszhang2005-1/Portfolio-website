/**
 * StressSystem — FEA-style hull stress tracking.
 * Divides the ship hull into zones and tracks collision impact stress per zone.
 */

/** Number of triangular FEA zones around the hull */
export const FEA_ZONE_COUNT = 12;

/** Critical impulse threshold — impacts above this cause red glow */
export const CRITICAL_IMPULSE = 0.4;

/** Max cumulative hull stress before "Hull Breach" */
export const MAX_HULL_STRESS = 100;

/** Stress decay rate per frame (auto-repair) */
export const STRESS_DECAY = 0.08;

/** Fast repair rate when docked at Home Port */
export const DOCK_REPAIR_RATE = 0.5;

export interface StressState {
  zones: number[];          // Stress per FEA zone (0-100 each)
  totalStress: number;      // Sum / FEA_ZONE_COUNT → overall hull integrity
  impactFlash: number;      // >0 means recent impact, counts down
  impactZone: number;       // Which zone was hit last
}

/**
 * Create initial stress state.
 */
export function createStressState(): StressState {
  return {
    zones: new Array(FEA_ZONE_COUNT).fill(0),
    totalStress: 0,
    impactFlash: 0,
    impactZone: -1,
  };
}

/**
 * Map a collision normal angle to the nearest FEA zone index.
 * Zones are evenly distributed around the hull (0=north, clockwise).
 */
export function angleToZone(normalAngle: number): number {
  // Normalize to 0-360
  let deg = (normalAngle * 180 / Math.PI) % 360;
  if (deg < 0) deg += 360;
  return Math.floor((deg / 360) * FEA_ZONE_COUNT) % FEA_ZONE_COUNT;
}

/**
 * Apply a collision impact to the stress state.
 * Returns updated state.
 */
export function applyImpact(
  state: StressState,
  relativeVelocity: { x: number; y: number },
  collisionNormal: { x: number; y: number },
  shipMass: number
): StressState {
  const speed = Math.sqrt(relativeVelocity.x ** 2 + relativeVelocity.y ** 2);
  const impulse = speed * shipMass * 0.1;

  if (impulse < 0.05) return state; // Ignore tiny touches

  const normalAngle = Math.atan2(collisionNormal.x, -collisionNormal.y);
  const zone = angleToZone(normalAngle);

  const newZones = [...state.zones];
  const stressAdd = Math.min(30, impulse * 15);
  newZones[zone] = Math.min(100, newZones[zone] + stressAdd);

  // Spread stress to adjacent zones (FEA-style diffusion)
  const leftZone = (zone - 1 + FEA_ZONE_COUNT) % FEA_ZONE_COUNT;
  const rightZone = (zone + 1) % FEA_ZONE_COUNT;
  newZones[leftZone] = Math.min(100, newZones[leftZone] + stressAdd * 0.3);
  newZones[rightZone] = Math.min(100, newZones[rightZone] + stressAdd * 0.3);

  const totalStress = newZones.reduce((a, b) => a + b, 0) / FEA_ZONE_COUNT;

  return {
    zones: newZones,
    totalStress,
    impactFlash: impulse > CRITICAL_IMPULSE ? 30 : 15,
    impactZone: zone,
  };
}

/**
 * Tick the stress state (called every frame).
 * Applies decay and counts down impact flash.
 */
export function tickStress(state: StressState, isDocked: boolean): StressState {
  const decayRate = isDocked ? DOCK_REPAIR_RATE : STRESS_DECAY;
  const newZones = state.zones.map(z => Math.max(0, z - decayRate));
  const totalStress = newZones.reduce((a, b) => a + b, 0) / FEA_ZONE_COUNT;

  return {
    zones: newZones,
    totalStress,
    impactFlash: Math.max(0, state.impactFlash - 1),
    impactZone: state.impactFlash > 1 ? state.impactZone : -1,
  };
}

/**
 * Get the color for a stress value (FEA color ramp).
 * 0 = green, 50 = yellow, 80 = orange, 100 = red
 */
export function stressToColor(stress: number): string {
  if (stress < 20) return `rgba(0, 255, 100, ${0.1 + stress * 0.015})`;
  if (stress < 50) return `rgba(${Math.floor(255 * (stress - 20) / 30)}, 255, 0, ${0.3 + stress * 0.01})`;
  if (stress < 80) return `rgba(255, ${Math.floor(255 * (1 - (stress - 50) / 30))}, 0, ${0.5 + stress * 0.005})`;
  return `rgba(255, ${Math.floor(60 * (1 - (stress - 80) / 20))}, 0, ${0.7 + stress * 0.003})`;
}

/**
 * Check if hull is in critical state.
 */
export function isHullCritical(state: StressState): boolean {
  return state.totalStress > 60 || state.zones.some(z => z > 80);
}
