/**
 * Arcade car model: speed along the heading, lateral grip that bleeds sideways velocity
 * (lower grip = drift), yaw rate scaled by speed. Collisions are circle vs circle.
 * Everything is frame-rate independent (exponential damping), so 30, 60 and 120 Hz feel the same.
 */
import { car, input, SCREEN_RIGHT, SCREEN_UP, SPAWN, WORLD_RADIUS } from "./driveStore";
import type { Circle } from "./worldLayout";

export const CAR_RADIUS = 1.05;

const ACCEL = 24;
const BRAKE = 46;
const REVERSE_MAX = 9;
const TOP_SPEED = 19;
const BOOST_SPEED = 28;
const TURN_RATE = 2.7;

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** controls resolved for this frame (keyboard or stick) */
function resolveControls() {
  if (input.stickActive) {
    const mag = Math.min(1, Math.hypot(input.stickX, input.stickY));
    if (mag < 0.12) return { throttle: 0, steer: 0 };
    // the stick points where the car should go, in screen space
    const wx = SCREEN_RIGHT.x * input.stickX + SCREEN_UP.x * input.stickY;
    const wz = SCREEN_RIGHT.z * input.stickX + SCREEN_UP.z * input.stickY;
    const target = Math.atan2(-wx, -wz);
    const diff = wrap(target - car.heading);
    const steer = Math.max(-1, Math.min(1, diff * 2.2));
    // turning around on the spot reads better with a little less throttle
    const throttle = mag * (Math.abs(diff) > 1.8 ? 0.45 : 1);
    return { throttle, steer };
  }
  return { throttle: input.throttle, steer: input.steer };
}

export type StepResult = {
  /** strongest collision this frame, 0..1, for camera shake and body bounce */
  impact: number;
  /** longitudinal and lateral acceleration, for body pitch and roll */
  accel: number;
  lateral: number;
  steer: number;
};

export function resetCar() {
  car.x = SPAWN.x;
  car.z = SPAWN.z;
  car.heading = SPAWN.heading;
  car.vx = 0;
  car.vz = 0;
  car.speed = 0;
}

export function stepCar(dt: number, colliders: Circle[]): StepResult {
  if (input.reset) {
    input.reset = false;
    resetCar();
  }
  const { throttle, steer } = resolveControls();
  const fx = -Math.sin(car.heading);
  const fz = -Math.cos(car.heading);
  // right-hand side of the car
  const rx = -fz;
  const rz = fx;

  let fwd = car.vx * fx + car.vz * fz;
  let lat = car.vx * rx + car.vz * rz;
  const before = fwd;

  const top = input.boost ? BOOST_SPEED : TOP_SPEED;
  if (throttle > 0) {
    if (fwd < -0.5) fwd = Math.min(0, fwd + BRAKE * dt);
    else if (fwd < top) fwd = Math.min(top, fwd + ACCEL * throttle * dt * (input.boost ? 1.35 : 1));
  } else if (throttle < 0) {
    if (fwd > 0.5) fwd = Math.max(0, fwd - BRAKE * dt);
    else fwd = Math.max(-REVERSE_MAX, fwd + ACCEL * 0.7 * throttle * dt);
  }
  // rolling resistance, stronger when coasting; boost runs off gently when released
  fwd *= Math.exp(-(throttle === 0 ? 1.6 : 0.35) * dt);
  if (fwd > top) fwd += (top - fwd) * (1 - Math.exp(-2 * dt));

  // yaw: needs speed, eases off a bit at the top end
  const speedFactor = Math.max(-1, Math.min(1, fwd / 5));
  const highSpeedEase = 1 - 0.3 * Math.min(1, Math.abs(fwd) / BOOST_SPEED);
  const yaw = steer * TURN_RATE * speedFactor * highSpeedEase * (input.handbrake ? 1.35 : 1);
  car.heading = wrap(car.heading + yaw * dt);

  // grip: sideways velocity dies quickly unless the handbrake is on
  const grip = input.handbrake ? 1.4 : 9;
  lat *= Math.exp(-grip * dt);
  if (input.handbrake) fwd *= Math.exp(-0.9 * dt);

  // rebuild velocity in the new heading frame (this is what makes the car carve, not slide)
  const nfx = -Math.sin(car.heading);
  const nfz = -Math.cos(car.heading);
  car.vx = nfx * fwd + -nfz * lat;
  car.vz = nfz * fwd + nfx * lat;

  car.x += car.vx * dt;
  car.z += car.vz * dt;

  let impact = 0;
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const dx = car.x - c.x;
    const dz = car.z - c.z;
    const min = c.r + CAR_RADIUS;
    const d2 = dx * dx + dz * dz;
    if (d2 >= min * min) continue;
    const d = Math.sqrt(d2) || 0.0001;
    const nx = dx / d;
    const nz = dz / d;
    car.x = c.x + nx * min;
    car.z = c.z + nz * min;
    const vn = car.vx * nx + car.vz * nz;
    if (vn < 0) {
      // bounce a little, keep most of the tangential speed so the car slides along
      car.vx -= vn * nx * 1.35;
      car.vz -= vn * nz * 1.35;
      impact = Math.max(impact, Math.min(1, -vn / 16));
    }
  }

  // soft edge of the world
  const r = Math.hypot(car.x, car.z);
  if (r > WORLD_RADIUS) {
    const nx = car.x / r;
    const nz = car.z / r;
    car.x = nx * WORLD_RADIUS;
    car.z = nz * WORLD_RADIUS;
    const vn = car.vx * nx + car.vz * nz;
    if (vn > 0) {
      car.vx -= vn * nx * 1.4;
      car.vz -= vn * nz * 1.4;
      impact = Math.max(impact, Math.min(1, vn / 16));
    }
  }

  const afterFwd = car.vx * nfx + car.vz * nfz;
  car.speed = afterFwd;
  if (Math.abs(afterFwd) > 0.5) car.moved = true;
  return {
    impact,
    accel: dt > 0 ? (afterFwd - before) / dt : 0,
    lateral: yaw * afterFwd,
    steer,
  };
}
