"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { car, input } from "./driveStore";
import { PALETTE } from "./palette";

/** written by the simulation each frame, read here for the cosmetic motion */
export const carFx = { accel: 0, lateral: 0, steer: 0, impact: 0 };

const WHEELS: [number, number, boolean][] = [
  [-0.7, -0.78, true],
  [0.7, -0.78, true],
  [-0.7, 0.8, false],
  [0.7, 0.8, false],
];
const PUFFS = 28;
const tmp = new THREE.Object3D();

/** low-poly car; body pitch/roll are springs driven by the physics, plus wheel spin and dust */
export default function Car() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const spins = useRef<(THREE.Mesh | null)[]>([]);
  const dust = useRef<THREE.InstancedMesh>(null);
  const motion = useRef({ pitch: 0, roll: 0, pv: 0, rv: 0, bounce: 0, bv: 0, spin: 0, puff: 0, next: 0 });
  const puffs = useRef(Array.from({ length: PUFFS }, () => ({ x: 0, y: -10, z: 0, life: 0, max: 1, s: 0 })));

  useLayoutEffect(() => {
    const d = dust.current;
    if (!d) return;
    tmp.scale.setScalar(0);
    tmp.updateMatrix();
    for (let i = 0; i < PUFFS; i++) d.setMatrixAt(i, tmp.matrix);
    d.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    g.position.set(car.x, 0, car.z);
    g.rotation.y = car.heading;

    // springs: target from acceleration, critically-ish damped
    const m = motion.current;
    const tp = THREE.MathUtils.clamp(carFx.accel * 0.0045, -0.07, 0.07);
    const tr = THREE.MathUtils.clamp(-carFx.lateral * 0.0028, -0.09, 0.09);
    m.pv += ((tp - m.pitch) * 120 - m.pv * 14) * dt;
    m.rv += ((tr - m.roll) * 120 - m.rv * 14) * dt;
    m.pitch += m.pv * dt;
    m.roll += m.rv * dt;
    if (carFx.impact > 0.05) m.bv += carFx.impact * 3.5;
    m.bv += (-m.bounce * 160 - m.bv * 12) * dt;
    m.bounce += m.bv * dt;
    b.rotation.set(m.pitch, 0, m.roll);
    b.position.y = m.bounce * 0.12;

    m.spin += (car.speed / 0.36) * dt;
    for (let i = 0; i < 4; i++) {
      const w = wheels.current[i];
      if (w && WHEELS[i][2]) w.rotation.y = carFx.steer * 0.42;
      const s = spins.current[i];
      if (s) s.rotation.x = -m.spin;
    }

    // dust: from the rear wheels when drifting or launching hard
    const d = dust.current;
    if (!d) return;
    const fx = -Math.sin(car.heading);
    const fz = -Math.cos(car.heading);
    const latSpeed = Math.abs(car.vx * -fz + car.vz * fx);
    const emit = (input.handbrake && Math.abs(car.speed) > 4) || latSpeed > 3.5 || (carFx.accel > 18 && car.speed < 10) || carFx.impact > 0.25;
    m.next -= dt;
    if (emit && m.next <= 0) {
      m.next = 0.035;
      const p = puffs.current[m.puff];
      m.puff = (m.puff + 1) % PUFFS;
      const side = Math.random() < 0.5 ? -0.7 : 0.7;
      p.x = car.x - fx * 1.0 + -fz * side;
      p.z = car.z - fz * 1.0 + fx * side;
      p.y = 0.25;
      p.life = 0;
      p.max = 0.55 + Math.random() * 0.35;
      p.s = 0.35 + Math.random() * 0.25;
    }
    for (let i = 0; i < PUFFS; i++) {
      const p = puffs.current[i];
      if (p.life >= p.max) continue;
      p.life += dt;
      const t = p.life / p.max;
      p.y += dt * 0.9;
      tmp.position.set(p.x, p.y, p.z);
      tmp.scale.setScalar(t >= 1 ? 0 : p.s * (0.6 + t * 1.6) * (1 - t * t));
      tmp.updateMatrix();
      d.setMatrixAt(i, tmp.matrix);
    }
    d.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <group ref={root}>
        {/* soft contact shadow so the car sits on the ground even outside the shadow map */}
        <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
          <planeGeometry args={[1.9, 2.9]} />
          <meshBasicMaterial color="#000" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <group ref={body}>
          <mesh position-y={0.62} castShadow>
            <boxGeometry args={[1.3, 0.46, 2.3]} />
            <meshLambertMaterial color={PALETTE.car} />
          </mesh>
          <mesh position={[0, 1.06, 0.18]} castShadow>
            <boxGeometry args={[1.08, 0.44, 1.12]} />
            <meshLambertMaterial color={PALETTE.glass} />
          </mesh>
          <mesh position={[0, 1.3, 0.18]} castShadow>
            <boxGeometry args={[1.12, 0.06, 1.0]} />
            <meshLambertMaterial color={PALETTE.car} />
          </mesh>
          <mesh position={[0, 0.48, -1.17]}>
            <boxGeometry args={[1.34, 0.2, 0.08]} />
            <meshLambertMaterial color={PALETTE.carDark} />
          </mesh>
          <mesh position={[0, 0.48, 1.17]}>
            <boxGeometry args={[1.34, 0.2, 0.08]} />
            <meshLambertMaterial color={PALETTE.carDark} />
          </mesh>
          {[-0.42, 0.42].map((x) => (
            <mesh key={x} position={[x, 0.7, -1.16]}>
              <boxGeometry args={[0.26, 0.12, 0.04]} />
              <meshBasicMaterial color="#fff7d6" />
            </mesh>
          ))}
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.72, 1.16]}>
              <boxGeometry args={[0.28, 0.1, 0.04]} />
              <meshBasicMaterial color="#b3261e" />
            </mesh>
          ))}
        </group>
        {WHEELS.map(([x, z], i) => (
          <group
            key={i}
            position={[x, 0.36, z]}
            ref={(w) => {
              wheels.current[i] = w;
            }}
          >
            <mesh
              rotation-z={Math.PI / 2}
              castShadow
              ref={(s) => {
                spins.current[i] = s;
              }}
            >
              <cylinderGeometry args={[0.36, 0.36, 0.3, 10]} />
              <meshLambertMaterial color={PALETTE.carDark} flatShading />
            </mesh>
          </group>
        ))}
      </group>
      <instancedMesh ref={dust} args={[undefined, undefined, PUFFS]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshLambertMaterial color="#efeadf" flatShading />
      </instancedMesh>
    </>
  );
}
