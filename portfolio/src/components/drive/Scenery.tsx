"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ROAD_WIDTH, type Circle, type Prop, type Segment } from "./worldLayout";
import { PALETTE } from "./palette";

/** ground disc + every road and plaza merged into one mesh */
export function Ground({ segments, plazas }: { segments: Segment[]; plazas: Circle[] }) {
  const roads = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const s of segments) {
      const len = Math.hypot(s.bx - s.ax, s.bz - s.az);
      const g = new THREE.PlaneGeometry(ROAD_WIDTH, len);
      g.rotateX(-Math.PI / 2);
      g.rotateY(Math.atan2(s.bx - s.ax, s.bz - s.az));
      g.translate((s.ax + s.bx) / 2, 0, (s.az + s.bz) / 2);
      parts.push(g);
    }
    for (const p of plazas) {
      const g = new THREE.CircleGeometry(p.r, 40);
      g.rotateX(-Math.PI / 2);
      g.translate(p.x, 0, p.z);
      parts.push(g);
    }
    const merged = mergeGeometries(parts.map((g) => g.toNonIndexed()));
    parts.forEach((g) => g.dispose());
    return merged;
  }, [segments, plazas]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[150, 64]} />
        <meshLambertMaterial color={PALETTE.ground} />
      </mesh>
      <mesh geometry={roads} position-y={0.012} receiveShadow>
        <meshLambertMaterial color={PALETTE.road} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    </group>
  );
}

const tmp = new THREE.Object3D();
const color = new THREE.Color();

function useInstances(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  props: Prop[],
  place: (p: Prop, o: THREE.Object3D) => void,
  tint?: (p: Prop, c: THREE.Color) => void,
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    props.forEach((p, i) => {
      tmp.position.set(0, 0, 0);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(1, 1, 1);
      place(p, tmp);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      if (tint) {
        tint(p, color);
        mesh.setColorAt(i, color);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, props, place, tint]);
}

const placeTrunk = (p: Prop, o: THREE.Object3D) => {
  o.position.set(p.x, 0.55 * p.s, p.z);
  o.scale.setScalar(p.s);
};
const placeCrown = (p: Prop, o: THREE.Object3D) => {
  o.position.set(p.x, 1.95 * p.s, p.z);
  o.rotation.set(0, p.rot, 0);
  o.scale.set(p.s, p.s * 1.35, p.s);
};
const tintCrown = (p: Prop, c: THREE.Color) => {
  c.set(PALETTE.foliage[Math.floor(p.tint * PALETTE.foliage.length) % PALETTE.foliage.length]);
};
const placeRock = (p: Prop, o: THREE.Object3D) => {
  o.position.set(p.x, 0.25 * p.s, p.z);
  o.rotation.set(p.tint * 2, p.rot, p.tint);
  o.scale.set(p.s * 1.2, p.s * 0.7, p.s);
};
const tintRock = (p: Prop, c: THREE.Color) => {
  c.set(PALETTE.rock).offsetHSL(0, 0, (p.tint - 0.5) * 0.08);
};

/** trees and rocks: three instanced meshes for a few hundred props */
export function Props({ trees, rocks }: { trees: Prop[]; rocks: Prop[] }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const stones = useRef<THREE.InstancedMesh>(null);
  useInstances(trunks, trees, placeTrunk);
  useInstances(crowns, trees, placeCrown, tintCrown);
  useInstances(stones, rocks, placeRock, tintRock);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.1, 5]} />
        <meshLambertMaterial color={PALETTE.trunk} flatShading />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, trees.length]} castShadow>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={stones} args={[undefined, undefined, rocks.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
    </group>
  );
}
