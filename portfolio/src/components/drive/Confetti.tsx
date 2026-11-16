"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { Stop } from "./driveData";
import { driveStore } from "./driveStore";
import { PALETTE } from "./palette";

const COUNT = 96;
const PER_BURST = 32;
const tmp = new THREE.Object3D();
const col = new THREE.Color();

type Bit = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rx: number; ry: number; wx: number; wy: number; life: number; s: number };

function createBits(): Bit[] {
  return Array.from({ length: COUNT }, () => ({ x: 0, y: -5, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, wx: 0, wy: 0, life: 1, s: 0 }));
}

/**
 * The reward for finding a stop: a pop of confetti in its colour (plus gold) the first time the car
 * rolls onto its pad. One instanced mesh, idle (no matrix writes) between bursts.
 */
export default function Confetti({ stops }: { stops: Stop[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const bits = useRef<Bit[] | null>(null);
  const cursor = useRef(0);
  const alive = useRef(0);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    tmp.scale.setScalar(0);
    tmp.updateMatrix();
    for (let i = 0; i < COUNT; i++) {
      m.setMatrixAt(i, tmp.matrix);
      m.setColorAt(i, col.set(PALETTE.gold));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  useEffect(() => {
    let seen = driveStore.getVisited().size;
    return driveStore.subscribe(() => {
      const visited = driveStore.getVisited();
      if (visited.size <= seen) return;
      seen = visited.size;
      const stop = stops.find((s) => s.id === driveStore.getNearby());
      const m = mesh.current;
      if (!stop || !m) return;
      bits.current ??= createBits();
      for (let k = 0; k < PER_BURST; k++) {
        const i = cursor.current;
        cursor.current = (cursor.current + 1) % COUNT;
        const b = bits.current[i];
        const a = Math.random() * Math.PI * 2;
        const out = 2 + Math.random() * 4;
        b.x = stop.x;
        b.z = stop.z;
        b.y = 2.5;
        b.vx = Math.cos(a) * out;
        b.vz = Math.sin(a) * out;
        b.vy = 7 + Math.random() * 6;
        b.rx = Math.random() * 6;
        b.ry = Math.random() * 6;
        b.wx = (Math.random() - 0.5) * 14;
        b.wy = (Math.random() - 0.5) * 14;
        b.life = 0;
        b.s = 0.16 + Math.random() * 0.14;
        m.setColorAt(i, col.set(k % 3 === 0 ? PALETTE.gold : k % 3 === 1 ? stop.accent : PALETTE.paper));
      }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      alive.current = 1.8;
    });
  }, [stops]);

  useFrame((_, delta) => {
    const m = mesh.current;
    const list = bits.current;
    if (!m || !list || alive.current <= 0) return;
    const dt = Math.min(delta, 1 / 30);
    alive.current -= dt;
    for (let i = 0; i < COUNT; i++) {
      const b = list[i];
      if (b.life >= 1.6) continue;
      b.life += dt;
      b.vy -= 18 * dt;
      // a little air drag so pieces flutter instead of falling like rocks
      const drag = Math.exp(-1.6 * dt);
      b.vx *= drag;
      b.vz *= drag;
      if (b.vy < -4) b.vy = -4;
      b.x += b.vx * dt;
      b.y = Math.max(0.05, b.y + b.vy * dt);
      b.z += b.vz * dt;
      b.rx += b.wx * dt;
      b.ry += b.wy * dt;
      tmp.position.set(b.x, b.y, b.z);
      tmp.rotation.set(b.rx, b.ry, 0);
      tmp.scale.set(b.s, b.s * 0.25, b.s * 1.6).multiplyScalar(b.life >= 1.6 ? 0 : 1 - Math.max(0, b.life - 1.1) / 0.5);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry />
      <meshLambertMaterial />
    </instancedMesh>
  );
}
