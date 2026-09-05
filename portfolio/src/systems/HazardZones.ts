/**
 * HazardZones — Manages thermal vent and high-pressure zones.
 * Applies environmental forces and friction modifications to the ship.
 */
import { hazardZones, HazardZone } from "@/data/missions";

export interface HazardState {
  boilerPressure: number;        // 0-100, rises in thermal zones
  inThermalZone: boolean;
  inPressureZone: boolean;
  activeZoneId: string | null;
  thermalFrictionExtra: number;  // Additional friction when in thermal zone
}

export function createHazardState(): HazardState {
  return {
    boilerPressure: 0,
    inThermalZone: false,
    inPressureZone: false,
    activeZoneId: null,
    thermalFrictionExtra: 0,
  };
}

/**
 * Check which hazard zone (if any) the ship is inside, and return forces/state updates.
 */
export function tickHazards(
  shipX: number,
  shipY: number,
  state: HazardState,
): HazardState {
  let inThermal = false;
  let inPressure = false;
  let activeId: string | null = null;
  let thermalFriction = 0;

  for (const zone of hazardZones) {
    const dx = shipX - zone.position.x;
    const dy = shipY - zone.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < zone.radius) {
      if (zone.type === "thermal") {
        inThermal = true;
        activeId = zone.id;
        // Deeper into zone = more friction
        const depthRatio = 1 - (dist / zone.radius);
        thermalFriction = Math.max(thermalFriction, depthRatio * zone.intensity * 0.04);
      } else {
        inPressure = true;
        activeId = zone.id;
      }
    }
  }

  // Boiler pressure dynamics
  let newPressure = state.boilerPressure;
  if (inThermal) {
    newPressure = Math.min(100, newPressure + 0.35);
  } else {
    newPressure = Math.max(0, newPressure - 0.15);
  }

  return {
    boilerPressure: newPressure,
    inThermalZone: inThermal,
    inPressureZone: inPressure,
    activeZoneId: activeId,
    thermalFrictionExtra: thermalFriction,
  };
}

/**
 * Calculate pressure zone force (pulls ship gently toward zone center).
 */
export function getPressureForce(
  shipX: number,
  shipY: number,
): { x: number; y: number } {
  let fx = 0, fy = 0;

  for (const zone of hazardZones) {
    if (zone.type !== "pressure") continue;
    const dx = zone.position.x - shipX;
    const dy = zone.position.y - shipY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < zone.radius && dist > 1) {
      const depthRatio = 1 - (dist / zone.radius);
      const forceMag = depthRatio * zone.intensity * 0.0004;
      fx += (dx / dist) * forceMag;
      fy += (dy / dist) * forceMag;
    }
  }

  return { x: fx, y: fy };
}

/**
 * Check if boiler is in danger zone.
 */
export function isBoilerCritical(state: HazardState): boolean {
  return state.boilerPressure > 80;
}

/**
 * Get speed multiplier based on boiler pressure.
 * At 100% pressure, speed drops to 50%.
 */
export function getBoilerSpeedMultiplier(state: HazardState): number {
  if (state.boilerPressure < 80) return 1.0;
  return 1.0 - (state.boilerPressure - 80) / 40; // 100% → 0.5
}
