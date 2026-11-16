"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CAR_RADIUS } from "./carPhysics";
import { car } from "./driveStore";
import { PALETTE } from "./palette";
import { buildNameCubes, CUBE, NAME_Z } from "./worldLayout";

const HOME = 0;
const LOOSE = 1;
const RETURNING = 2;

const tmp = new THREE.Object3D();
const half = CUBE / 2;

type NameCubes = ReturnType<typeof buildNameCubes>;

/** plain function outside React: the per-frame cube simulation mutates its own typed arrays */
function createNameSim(cubes: NameCubes) {
  const n = cubes.length;
  const sim = {
    state: new Uint8Array(n),
    p: Float32Array.from(cubes.flatMap((c) => [c.hx, c.hy, c.hz])),
    v: new Float32Array(n * 3),
    r: new Float32Array(n * 3),
    w: new Float32Array(n * 3),
    from: new Float32Array(n * 3),
    fromR: new Float32Array(n * 3),
    rest: new Float32Array(n),
    t: new Float32Array(n),
    active: 0,
  };
  return function step(m: THREE.InstancedMesh, delta: number) {
    const dt = Math.min(delta, 1 / 30);
    const carNear = Math.abs(car.z - NAME_Z) < 4 && Math.abs(car.x) < 22;
    if (!carNear && sim.active === 0) return;
    const { state, p, v, r, w } = sim;
    const speed = Math.hypot(car.vx, car.vz);
    let dirty = false;

    const loosen = (i: number, kick: number) => {
      if (state[i] !== HOME) return;
      state[i] = LOOSE;
      sim.active++;
      sim.rest[i] = 0;
      const k = kick;
      v[i * 3] = car.vx * 0.75 * k + (Math.random() - 0.5) * 3 * k;
      v[i * 3 + 1] = 2 + Math.random() * 4 * k;
      v[i * 3 + 2] = car.vz * 0.75 * k + (Math.random() - 0.5) * 3 * k;
      w[i * 3] = (Math.random() - 0.5) * 9 * k;
      w[i * 3 + 1] = (Math.random() - 0.5) * 9 * k;
      w[i * 3 + 2] = (Math.random() - 0.5) * 9 * k;
      // whatever stood on this cube now falls
      const up = cubes[i].above;
      if (up >= 0) loosen(up, k * 0.55);
    };

    for (let i = 0; i < cubes.length; i++) {
      const s = state[i];
      const ix = i * 3;
      if (s === HOME) {
        if (!carNear || speed < 1.5 || p[ix + 1] > 1.6) continue;
        const dx = p[ix] - car.x;
        const dz = p[ix + 2] - car.z;
        if (dx * dx + dz * dz < (CAR_RADIUS + half) ** 2) loosen(i, Math.min(1.4, 0.5 + speed / 14));
        continue;
      }
      dirty = true;
      if (s === LOOSE) {
        v[ix + 1] -= 26 * dt;
        p[ix] += v[ix] * dt;
        p[ix + 1] += v[ix + 1] * dt;
        p[ix + 2] += v[ix + 2] * dt;
        r[ix] += w[ix] * dt;
        r[ix + 1] += w[ix + 1] * dt;
        r[ix + 2] += w[ix + 2] * dt;
        if (p[ix + 1] < half) {
          p[ix + 1] = half;
          v[ix + 1] = Math.abs(v[ix + 1]) > 1.2 ? -v[ix + 1] * 0.3 : 0;
          const f = Math.exp(-6 * dt);
          v[ix] *= f;
          v[ix + 2] *= f;
          w[ix] *= f;
          w[ix + 1] *= f;
          w[ix + 2] *= f;
          // settle flat on a face
          r[ix] += (Math.round(r[ix] / (Math.PI / 2)) * (Math.PI / 2) - r[ix]) * (1 - Math.exp(-5 * dt));
          r[ix + 2] += (Math.round(r[ix + 2] / (Math.PI / 2)) * (Math.PI / 2) - r[ix + 2]) * (1 - Math.exp(-5 * dt));
        }
        // the car shoves cubes lying around
        const dx = p[ix] - car.x;
        const dz = p[ix + 2] - car.z;
        const min = CAR_RADIUS + half;
        const d2 = dx * dx + dz * dz;
        if (p[ix + 1] < 1.4 && d2 < min * min) {
          const d = Math.sqrt(d2) || 0.001;
          p[ix] = car.x + (dx / d) * min;
          p[ix + 2] = car.z + (dz / d) * min;
          v[ix] = car.vx * 1.1 + (dx / d) * 2;
          v[ix + 2] = car.vz * 1.1 + (dz / d) * 2;
          v[ix + 1] = Math.max(v[ix + 1], speed * 0.18);
          w[ix + 1] = (Math.random() - 0.5) * 8;
          sim.rest[i] = 0;
        }
        const moving = Math.abs(v[ix]) + Math.abs(v[ix + 1]) + Math.abs(v[ix + 2]) > 0.25;
        sim.rest[i] = moving ? 0 : sim.rest[i] + dt;
        const farAway = Math.hypot(car.x - cubes[i].hx, car.z - NAME_Z) > 16;
        if (sim.rest[i] > 4 && farAway) {
          state[i] = RETURNING;
          sim.t[i] = -cubes[i].hy * 0.12;
          sim.from.set([p[ix], p[ix + 1], p[ix + 2]], ix);
          sim.fromR.set([r[ix], r[ix + 1], r[ix + 2]], ix);
        }
      } else if (s === RETURNING) {
        sim.t[i] += dt / 1.1;
        const t = Math.max(0, Math.min(1, sim.t[i]));
        const e = t * t * (3 - 2 * t);
        const c = cubes[i];
        const lift = Math.sin(Math.PI * e) * 2.2;
        p[ix] = sim.from[ix] + (c.hx - sim.from[ix]) * e;
        p[ix + 1] = sim.from[ix + 1] + (c.hy - sim.from[ix + 1]) * e + lift;
        p[ix + 2] = sim.from[ix + 2] + (c.hz - sim.from[ix + 2]) * e;
        r[ix] = sim.fromR[ix] * (1 - e);
        r[ix + 1] = sim.fromR[ix + 1] * (1 - e);
        r[ix + 2] = sim.fromR[ix + 2] * (1 - e);
        if (t >= 1) {
          state[i] = HOME;
          sim.active--;
          v.fill(0, ix, ix + 3);
          w.fill(0, ix, ix + 3);
          r.fill(0, ix, ix + 3);
        }
      }
      tmp.position.set(p[ix], p[ix + 1], p[ix + 2]);
      tmp.rotation.set(r[ix], r[ix + 1], r[ix + 2]);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    if (dirty) m.instanceMatrix.needsUpdate = true;
  };
}

/**
 * "LOUIS ZHANG" in voxel cubes, one instanced mesh. The car knocks cubes loose, the cubes
 * above follow, and once the car has driven away the letters quietly rebuild themselves.
 * Idle letters cost nothing: the loop exits early unless a cube is moving or the car is close.
 */
export default function NameBlocks() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cubes = useMemo(() => buildNameCubes(), []);
  const sim = useRef<ReturnType<typeof createNameSim> | null>(null);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new THREE.Color();
    cubes.forEach((cube, i) => {
      tmp.position.set(cube.hx, cube.hy, cube.hz);
      tmp.rotation.set(0, 0, 0);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      m.setColorAt(i, c.set(cube.word === 0 ? PALETTE.nameA : PALETTE.nameB));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [cubes]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    sim.current ??= createNameSim(cubes);
    sim.current(m, delta);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, cubes.length]} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[CUBE * 0.96, CUBE * 0.96, CUBE * 0.96]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}
