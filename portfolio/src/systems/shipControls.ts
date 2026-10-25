import Matter from "matter-js";
import type { Vec2 } from "@/systems/GravitySystem";

/* Ship handling for the /game physics loop: manual helm, auto-navigation and
   hull drag. Mutates the Matter body only — no React state. */

export const SHIP_MASS = 8;
export const SHIP_FRICTION_AIR = 0.019;
export const MAX_SHIP_SPEED = 5.1;
const THRUST_FORCE = 0.0052;
const REVERSE_FORCE = 0.003;
const TURN_TORQUE = 0.06;
const RUDDER_DRAG = 0.0026;
/* Max heading change per frame while auto-navigating (radians) */
const AUTO_TURN_RATE = 0.09;
/* Start easing off the throttle this far from the destination */
const AUTO_BRAKE_DIST = 320;

export interface JoystickInput {
  x: number;
  y: number;
  active: boolean;
}

export interface AutoNavTarget {
  point: Vec2;
  /** Distance at which the target counts as reached */
  arriveRadius: number;
  /** Frames spent with almost no progress (stuck against an obstacle) */
  stuckFrames: number;
}

const thrustMultiplier = (thrustLevel: number) => 1 + thrustLevel * 0.15;

function wrapAngle(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/** Keyboard + virtual joystick → manual helm input. */
export function applyManualHelm(
  ship: Matter.Body,
  keys: Set<string>,
  joystick: JoystickInput,
  thrustLevel: number,
  boilerMult: number,
) {
  const keyboardTurn =
    (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
    (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
  const keyboardThrottle =
    (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
    (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
  const turnInput = joystick.active ? joystick.x : keyboardTurn;
  const throttleInput = joystick.active ? -joystick.y : keyboardThrottle;
  const speedRatio = Math.min(1, Math.hypot(ship.velocity.x, ship.velocity.y) / MAX_SHIP_SPEED);
  const rudderAuthority = 0.42 + speedRatio * 0.78;

  if (Math.abs(turnInput) > 0.04) {
    Matter.Body.setAngle(ship, ship.angle + turnInput * TURN_TORQUE * rudderAuthority);
  }
  if (throttleInput > 0.05) {
    const force = THRUST_FORCE * thrustMultiplier(thrustLevel) * boilerMult * throttleInput;
    Matter.Body.applyForce(ship, ship.position, {
      x: Math.sin(ship.angle) * force,
      y: -Math.cos(ship.angle) * force,
    });
  }
  if (throttleInput < -0.05) {
    const force = REVERSE_FORCE * Math.abs(throttleInput);
    Matter.Body.applyForce(ship, ship.position, {
      x: -Math.sin(ship.angle) * force,
      y: Math.cos(ship.angle) * force,
    });
  }
}

/**
 * Steers toward the auto-nav target with a limited turn rate and eases off near
 * the destination so the ship parks beside an island instead of ramming it.
 * Returns true once the target is reached (or the ship is stuck), meaning the
 * caller should clear the target.
 */
export function steerAutoNav(ship: Matter.Body, target: AutoNavTarget, thrustLevel: number): boolean {
  const dx = target.point.x - ship.position.x;
  const dy = target.point.y - ship.position.y;
  const dist = Math.hypot(dx, dy);
  const speed = Math.hypot(ship.velocity.x, ship.velocity.y);

  if (dist < target.arriveRadius) {
    Matter.Body.setVelocity(ship, { x: ship.velocity.x * 0.35, y: ship.velocity.y * 0.35 });
    return true;
  }

  target.stuckFrames = speed < 0.25 ? target.stuckFrames + 1 : 0;
  if (target.stuckFrames > 150) return true;

  const desired = Math.atan2(dx, -dy);
  const delta = wrapAngle(desired - ship.angle);
  const turn = Math.max(-AUTO_TURN_RATE, Math.min(AUTO_TURN_RATE, delta));
  Matter.Body.setAngle(ship, ship.angle + turn);

  // Only push once roughly facing the target; brake on final approach.
  const facing = Math.max(0, Math.cos(delta));
  const approach = Math.min(1, Math.max(0.25, (dist - target.arriveRadius) / AUTO_BRAKE_DIST));
  const force = THRUST_FORCE * thrustMultiplier(thrustLevel) * facing * approach;
  Matter.Body.applyForce(ship, ship.position, {
    x: Math.sin(ship.angle) * force,
    y: -Math.cos(ship.angle) * force,
  });
  if (dist < AUTO_BRAKE_DIST && speed > 2.2) {
    Matter.Body.setVelocity(ship, { x: ship.velocity.x * 0.96, y: ship.velocity.y * 0.96 });
  }
  return false;
}

/** Lateral water resistance makes the hull carve instead of skate. */
export function applyHullDrag(ship: Matter.Body) {
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
}

export function clampShipSpeed(ship: Matter.Body) {
  const currentSpeed = Math.hypot(ship.velocity.x, ship.velocity.y);
  if (currentSpeed > MAX_SHIP_SPEED) {
    const s = MAX_SHIP_SPEED / currentSpeed;
    Matter.Body.setVelocity(ship, { x: ship.velocity.x * s, y: ship.velocity.y * s });
  }
}
