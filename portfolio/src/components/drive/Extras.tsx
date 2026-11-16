"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bodyTransform, createBodies, stepBodies, type Body } from "./bodies";
import { BOWLING, type BodyKind, type BodySpec } from "./extrasLayout";
import type { Circle, Prop } from "./worldLayout";

const tmp = new THREE.Object3D();
const KINDS: BodyKind[] = ["crate", "cone", "pin"];

/** crates, cones and bowling pins: one instanced mesh per kind, stepped every frame while anything moves */
export function Toys({ specs, colliders }: { specs: BodySpec[]; colliders: Circle[] }) {
  const meshes = useRef<Record<BodyKind, THREE.InstancedMesh | null>>({ crate: null, cone: null, pin: null });
  const state = useRef<{ list: Body[]; quiet: number } | null>(null);
  const counts = useMemo(() => Object.fromEntries(KINDS.map((k) => [k, specs.filter((s) => s.kind === k).length])) as Record<BodyKind, number>, [specs]);

  const pin = useMemo(() => {
    const pts = [[0, 0], [0.13, 0], [0.19, 0.18], [0.21, 0.3], [0.14, 0.5], [0.09, 0.6], [0.12, 0.72], [0.1, 0.8], [0, 0.84]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 10);
    g.translate(0, -0.42, 0);
    return g;
  }, []);
  const cone = useMemo(() => new THREE.ConeGeometry(0.3, 0.84, 10), []);

  const write = () => {
    const s = state.current;
    if (!s) return;
    const seen: Record<BodyKind, number> = { crate: 0, cone: 0, pin: 0 };
    s.list.forEach((b) => {
      const m = meshes.current[b.kind];
      if (!m) return;
      bodyTransform(b, tmp);
      tmp.updateMatrix();
      m.setMatrixAt(seen[b.kind]++, tmp.matrix);
    });
    for (const k of KINDS) {
      const m = meshes.current[k];
      if (m) m.instanceMatrix.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    state.current = { list: createBodies(specs), quiet: 0 };
    write();
    for (const k of KINDS) meshes.current[k]?.computeBoundingSphere();
  }, [specs]);

  useFrame((_, delta) => {
    const s = state.current;
    if (!s) return;
    const dt = Math.min(delta, 1 / 30);
    // two half-steps keep fast hits from tunnelling through pins
    const a = stepBodies(s.list, dt / 2, colliders);
    const b = stepBodies(s.list, dt / 2, colliders);
    if (a || b) {
      s.quiet = 0;
      write();
    } else if (s.quiet++ === 0) write();
  });

  return (
    <group>
      {counts.crate > 0 && (
        <instancedMesh ref={(m) => void (meshes.current.crate = m)} args={[undefined, undefined, counts.crate]} castShadow receiveShadow frustumCulled={false}>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshLambertMaterial color="#c99a5b" />
        </instancedMesh>
      )}
      {counts.cone > 0 && (
        <instancedMesh ref={(m) => void (meshes.current.cone = m)} args={[cone, undefined, counts.cone]} castShadow frustumCulled={false}>
          <meshLambertMaterial color="#f07a2a" flatShading />
        </instancedMesh>
      )}
      {counts.pin > 0 && (
        <instancedMesh ref={(m) => void (meshes.current.pin = m)} args={[pin, undefined, counts.pin]} castShadow frustumCulled={false}>
          <meshLambertMaterial color="#f7f4ec" flatShading />
        </instancedMesh>
      )}
    </group>
  );
}

function useInstanced(ref: React.RefObject<THREE.InstancedMesh | null>, list: Prop[], place: (p: Prop, o: THREE.Object3D, c: THREE.Color) => void) {
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    list.forEach((p, i) => {
      tmp.position.set(0, 0, 0);
      tmp.quaternion.identity();
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(1, 1, 1);
      place(p, tmp, c);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [ref, list, place]);
}

const TUFT = ["#8fb06a", "#7ea35f", "#a2bd73"];
const FLOWER = ["#f2c14e", "#f4f1ea", "#e98a9b", "#b59ad8"];
const placeTuft = (p: Prop, o: THREE.Object3D, c: THREE.Color) => {
  o.position.set(p.x, 0.18 * p.s, p.z);
  o.rotation.set(0, p.rot, 0);
  o.scale.set(p.s, p.s, p.s);
  c.set(TUFT[Math.floor(p.tint * TUFT.length)]);
};
const placeFlower = (p: Prop, o: THREE.Object3D, c: THREE.Color) => {
  o.position.set(p.x, 0.22, p.z);
  o.scale.setScalar(p.s);
  c.set(FLOWER[Math.floor(p.tint * FLOWER.length)]);
};
const placePost = (p: Prop, o: THREE.Object3D, c: THREE.Color) => {
  o.position.set(p.x, 1.4, p.z);
  c.set("#2b302e");
};
const placeLamp = (p: Prop, o: THREE.Object3D, c: THREE.Color) => {
  o.position.set(p.x, 2.9, p.z);
  c.set("#fff1c9");
};

/** grass, flowers, street lamps and the bowling lane: decoration only, five draw calls */
export function Details({ tufts, flowers, lamps }: { tufts: Prop[]; flowers: Prop[]; lamps: Prop[] }) {
  const t = useRef<THREE.InstancedMesh>(null);
  const f = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  useInstanced(t, tufts, placeTuft);
  useInstanced(f, flowers, placeFlower);
  useInstanced(posts, lamps, placePost);
  useInstanced(heads, lamps, placeLamp);
  const laneLen = BOWLING.laneFromX - BOWLING.laneToX;

  return (
    <group>
      <instancedMesh ref={t} args={[undefined, undefined, tufts.length]}>
        <coneGeometry args={[0.28, 0.42, 4]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={f} args={[undefined, undefined, flowers.length]}>
        <icosahedronGeometry args={[0.13, 0]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={posts} args={[undefined, undefined, Math.max(1, lamps.length)]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 2.8, 6]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, Math.max(1, lamps.length)]}>
        <boxGeometry args={[0.36, 0.3, 0.36]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* bowling lane: a pale strip with gutters */}
      <mesh position={[(BOWLING.laneFromX + BOWLING.laneToX) / 2, 0.02, BOWLING.z]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[laneLen, BOWLING.width]} />
        <meshLambertMaterial color="#e9d9b8" polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(BOWLING.laneFromX + BOWLING.laneToX) / 2, 0.06, BOWLING.z + side * (BOWLING.width / 2 + 0.15)]}>
          <boxGeometry args={[laneLen, 0.12, 0.3]} />
          <meshLambertMaterial color="#8a6a4a" />
        </mesh>
      ))}
    </group>
  );
}
