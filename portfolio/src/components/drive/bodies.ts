/**
 * Physics toys: crates, cones and bowling pins. Circles on the ground plane with a little
 * vertical hop, tipping for tall pieces, body-body contacts (so pins knock pins) and pushes
 * from the car. Plain typed state, stepped from the render loop, no allocations per frame.
 */
import * as THREE from "three";
import { CAR_RADIUS } from "./carPhysics";
import { car, driveStore, WORLD_RADIUS } from "./driveStore";
import { BOWLING, type BodyKind, type BodySpec } from "./extrasLayout";
import type { Circle } from "./worldLayout";

const SPEC: Record<BodyKind, { r: number; hh: number; mass: number; friction: number; tips: boolean }> = {
  crate: { r: 0.55, hh: 0.475, mass: 1.4, friction: 3.2, tips: false },
  cone: { r: 0.3, hh: 0.42, mass: 0.35, friction: 2.4, tips: true },
  pin: { r: 0.21, hh: 0.42, mass: 0.3, friction: 1.6, tips: true },
};
const CAR_MASS = 7;
const HALF_PI = Math.PI / 2;

export type Body = {
  kind: BodyKind;
  home: BodySpec;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  wy: number;
  tilt: number;
  tiltV: number;
  tiltDir: number;
  /** index of the crate this one rests on, or -1 */
  on: number;
};

export function createBodies(specs: BodySpec[]): Body[] {
  const list: Body[] = specs.map((s) => ({
    kind: s.kind,
    home: s,
    x: s.x,
    y: s.y,
    z: s.z,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: s.yaw,
    wy: 0,
    tilt: 0,
    tiltV: 0,
    tiltDir: 0,
    on: -1,
  }));
  list.forEach((b, i) => {
    if (b.y <= 0) return;
    b.on = list.findIndex((o, j) => j !== i && o.kind === "crate" && o.y < b.y && Math.hypot(o.x - b.x, o.z - b.z) < 0.6);
    if (b.on < 0) b.on = list.findIndex((o, j) => j !== i && o.y < b.y && Math.hypot(o.x - b.x, o.z - b.z) < 1.0);
  });
  return list;
}

function knock(b: Body, dirX: number, dirZ: number, strength: number) {
  if (!SPEC[b.kind].tips || b.tilt > 0.02 || strength < 1.2) return;
  b.tiltDir = Math.atan2(dirZ, dirX);
  b.tiltV = Math.min(6, 1.5 + strength * 0.6);
  b.tilt = 0.03;
}

type Bowling = { fallenShown: number; rest: number; struck: boolean };
const bowl: Bowling = { fallenShown: 0, rest: 0, struck: false };

export function stepBodies(list: Body[], dt: number, colliders: Circle[]) {
  const carSpeed = Math.hypot(car.vx, car.vz);
  let moving = false;

  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    const sp = SPEC[b.kind];

    // resting on another crate: stay put until the support moves away
    if (b.on >= 0) {
      const s = list[b.on];
      if (Math.hypot(s.x - b.x, s.z - b.z) < 0.6 && s.on < 0 && s.y < 0.05) {
        b.y = s.y + SPEC[s.kind].hh * 2;
        b.vx = s.vx;
        b.vz = s.vz;
      } else b.on = -1;
    }

    // car contact
    const dx = b.x - car.x;
    const dz = b.z - car.z;
    const min = sp.r + CAR_RADIUS;
    const d2 = dx * dx + dz * dz;
    if (b.y < 1.3 && d2 < min * min) {
      const d = Math.sqrt(d2) || 0.001;
      const nx = dx / d;
      const nz = dz / d;
      b.x = car.x + nx * min;
      b.z = car.z + nz * min;
      const rel = (car.vx - b.vx) * nx + (car.vz - b.vz) * nz;
      if (rel > 0) {
        const j = (rel * 1.5 * CAR_MASS) / (CAR_MASS + sp.mass);
        b.vx += nx * j;
        b.vz += nz * j;
        b.vy = Math.max(b.vy, Math.min(5, rel * (b.kind === "crate" ? 0.35 : 0.5)));
        b.wy += (Math.random() - 0.5) * rel * 1.5;
        b.on = -1;
        knock(b, nx, nz, rel);
        // light pieces scatter, they don't fly across the map
        const cap = b.kind === "crate" ? 14 : 9;
        const hs = Math.hypot(b.vx, b.vz);
        if (hs > cap) {
          b.vx *= cap / hs;
          b.vz *= cap / hs;
        }
        // the car feels it, a little
        const back = (j * sp.mass) / CAR_MASS;
        car.vx -= nx * back * 0.6;
        car.vz -= nz * back * 0.6;
      }
    }

    if (b.on < 0) {
      b.vy -= 22 * dt;
      b.y += b.vy * dt;
      if (b.y <= 0) {
        b.y = 0;
        b.vy = b.vy < -2.5 ? -b.vy * 0.25 : 0;
      }
    }
    b.x += b.vx * dt;
    b.z += b.vz * dt;
    b.yaw += b.wy * dt;
    if (b.y === 0) {
      const f = Math.exp(-(b.tilt >= HALF_PI ? sp.friction * 0.8 : sp.friction) * dt);
      b.vx *= f;
      b.vz *= f;
      b.wy *= Math.exp(-3 * dt);
    }
    if (b.tilt > 0 && b.tilt < HALF_PI) {
      b.tiltV += 16 * dt;
      b.tilt = Math.min(HALF_PI, b.tilt + b.tiltV * dt);
    }

    for (let k = 0; k < colliders.length; k++) {
      const c = colliders[k];
      const cx = b.x - c.x;
      const cz = b.z - c.z;
      const m = c.r + sp.r;
      const q = cx * cx + cz * cz;
      if (q >= m * m) continue;
      const d = Math.sqrt(q) || 0.001;
      b.x = c.x + (cx / d) * m;
      b.z = c.z + (cz / d) * m;
      const vn = (b.vx * cx + b.vz * cz) / d;
      if (vn < 0) {
        b.vx -= (cx / d) * vn * 1.5;
        b.vz -= (cz / d) * vn * 1.5;
      }
    }
    const r = Math.hypot(b.x, b.z);
    if (r > WORLD_RADIUS + 1) {
      b.x *= (WORLD_RADIUS + 1) / r;
      b.z *= (WORLD_RADIUS + 1) / r;
      b.vx *= -0.3;
      b.vz *= -0.3;
    }
    if (Math.abs(b.vx) + Math.abs(b.vz) + Math.abs(b.vy) > 0.05 || (b.tilt > 0 && b.tilt < HALF_PI)) moving = true;
  }

  // body vs body: separate and exchange momentum along the contact normal
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    const sa = SPEC[a.kind];
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j];
      if (Math.abs(a.y - b.y) > 0.6) continue;
      const sb = SPEC[b.kind];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const m = sa.r + sb.r;
      const q = dx * dx + dz * dz;
      if (q >= m * m) continue;
      const d = Math.sqrt(q) || 0.001;
      const nx = dx / d;
      const nz = dz / d;
      const push = (m - d) / 2;
      a.x -= nx * push;
      a.z -= nz * push;
      b.x += nx * push;
      b.z += nz * push;
      const rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
      if (rel <= 0) continue;
      const jImp = (rel * 1.6) / (1 / sa.mass + 1 / sb.mass);
      a.vx -= (nx * jImp) / sa.mass;
      a.vz -= (nz * jImp) / sa.mass;
      b.vx += (nx * jImp) / sb.mass;
      b.vz += (nz * jImp) / sb.mass;
      knock(b, nx, nz, rel * 1.4);
      knock(a, -nx, -nz, rel * 0.8);
    }
  }

  // bowling: count pins down, cheer a strike, reset once the car has rolled away
  let down = 0;
  let pins = 0;
  for (const b of list) {
    if (b.kind !== "pin") continue;
    pins++;
    if (b.tilt >= 1 || Math.hypot(b.x - b.home.x, b.z - b.home.z) > 1.2) down++;
  }
  if (pins) {
    if (down === pins && !bowl.struck) {
      bowl.struck = true;
      driveStore.toast("Strike!");
    }
    const carAway = car.x > BOWLING.laneFromX + 3 || Math.abs(car.z - BOWLING.z) > 7;
    bowl.rest = down > 0 && carAway && carSpeed >= 0 ? bowl.rest + dt : 0;
    if (bowl.rest > 3.5) {
      if (!bowl.struck && down > 0) driveStore.toast(`${down} pin${down === 1 ? "" : "s"}`);
      for (const b of list) {
        if (b.kind !== "pin") continue;
        b.x = b.home.x;
        b.z = b.home.z;
        b.y = 0.6;
        b.vx = b.vy = b.vz = b.wy = 0;
        b.tilt = b.tiltV = 0;
        b.yaw = 0;
      }
      bowl.rest = 0;
      bowl.struck = false;
      moving = true;
    }
  }
  return moving;
}

const AXIS = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const yawQ = new THREE.Quaternion();

/** writes a body's transform: yaw, then a tip towards tiltDir around its base */
export function bodyTransform(b: Body, o: THREE.Object3D) {
  const hh = SPEC[b.kind].hh;
  const fx = Math.cos(b.tiltDir);
  const fz = Math.sin(b.tiltDir);
  const s = Math.sin(b.tilt);
  const c = Math.cos(b.tilt);
  // centre = base + tipped half-height
  o.position.set(b.x + fx * s * hh, b.y + c * hh, b.z + fz * s * hh);
  // tilt axis = up x fall direction = (fz, 0, -fx)
  o.quaternion.setFromAxisAngle(AXIS.set(fz, 0, -fx), b.tilt);
  o.quaternion.multiply(yawQ.setFromAxisAngle(UP, b.yaw));
  o.scale.setScalar(1);
}
