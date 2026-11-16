"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CAMERA_YAW, driveStore } from "./driveStore";
import { SCREEN_BASE, SCREEN_H, SCREEN_W, type Screen } from "./extrasLayout";
import { PALETTE } from "./palette";

const tmp = new THREE.Object3D();
const TILT = -0.2;
const OFF = new THREE.Color("#262c2f");

/**
 * One project preview. The image (a 640x400 webp, ~25 KB) loads after the world is up,
 * staggered so the first frames never wait on it. Dim at a distance, lights up (with a quick
 * flash) when the car rolls onto the pad.
 */
function Panel({ screen, delay }: { screen: Screen; delay: number }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef({ level: 0.5, wasNear: false });

  useEffect(() => {
    let alive = true;
    let loaded: THREE.Texture | null = null;
    const t = setTimeout(() => {
      new THREE.TextureLoader().load(screen.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        loaded = tex;
        if (alive) setTexture(tex);
        else tex.dispose();
      });
    }, delay);
    return () => {
      alive = false;
      clearTimeout(t);
      loaded?.dispose();
    };
  }, [screen.image, delay]);

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    const g = glow.current;
    const near = driveStore.getNearby() === screen.stop.id;
    if (near && !g.wasNear) g.level = 1.9; // power-on flash
    g.wasNear = near;
    const target = near ? 1 : 0.62;
    g.level += (target - g.level) * (1 - Math.exp(-6 * Math.min(delta, 1 / 30)));
    if (texture) m.color.setScalar(g.level);
    else m.color.copy(OFF);
  });

  return (
    <group position={[screen.x, 0, screen.z]} rotation={[0, CAMERA_YAW, 0]}>
      <group position-y={SCREEN_BASE + SCREEN_H / 2} rotation-x={TILT}>
        <mesh position-z={0.06}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshBasicMaterial key={texture ? "on" : "off"} ref={mat} map={texture} toneMapped={false} color={OFF} />
        </mesh>
      </group>
    </group>
  );
}

/** frames and stands for every screen: two instanced meshes, plus one textured quad each */
export default function Showcases({ screens }: { screens: Screen[] }) {
  const frames = useRef<THREE.InstancedMesh>(null);
  const legs = useRef<THREE.InstancedMesh>(null);
  const strips = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const f = frames.current;
    const l = legs.current;
    const st = strips.current;
    if (!f || !l || !st) return;
    const col = new THREE.Color();
    screens.forEach((s, i) => {
      const base = new THREE.Object3D();
      base.position.set(s.x, 0, s.z);
      base.rotation.set(0, CAMERA_YAW, 0);
      base.updateMatrixWorld();
      const panel = new THREE.Object3D();
      panel.position.y = SCREEN_BASE + SCREEN_H / 2;
      panel.rotation.x = TILT;
      base.add(panel);
      panel.updateMatrixWorld(true);
      // frame: a slab just behind the picture
      tmp.position.set(0, 0, -0.02);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(SCREEN_W + 0.3, SCREEN_H + 0.3, 0.14);
      tmp.updateMatrix();
      f.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(panel.matrixWorld, tmp.matrix));
      // accent strip along the bottom edge of the frame
      tmp.position.set(0, -SCREEN_H / 2 - 0.1, 0.06);
      tmp.scale.set(SCREEN_W * 0.4, 0.07, 0.02);
      tmp.updateMatrix();
      st.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(panel.matrixWorld, tmp.matrix));
      st.setColorAt(i, col.set(s.stop.accent));
      // two legs
      [-SCREEN_W / 2 + 0.5, SCREEN_W / 2 - 0.5].forEach((x, k) => {
        tmp.position.set(x, (SCREEN_BASE + 0.6) / 2, -0.15);
        tmp.scale.set(0.16, SCREEN_BASE + 0.6, 0.16);
        tmp.updateMatrix();
        l.setMatrixAt(i * 2 + k, new THREE.Matrix4().multiplyMatrices(base.matrixWorld, tmp.matrix));
      });
    });
    for (const m of [f, l, st]) {
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
    if (st.instanceColor) st.instanceColor.needsUpdate = true;
  }, [screens]);

  if (screens.length === 0) return null;
  return (
    <group>
      <instancedMesh ref={frames} args={[undefined, undefined, screens.length]} castShadow>
        <boxGeometry />
        <meshLambertMaterial color={PALETTE.carDark} />
      </instancedMesh>
      <instancedMesh ref={strips} args={[undefined, undefined, screens.length]}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={legs} args={[undefined, undefined, screens.length * 2]} castShadow>
        <boxGeometry />
        <meshLambertMaterial color={PALETTE.carDark} />
      </instancedMesh>
      {screens.map((s, i) => (
        <Panel key={s.stop.id} screen={s} delay={700 + i * 140} />
      ))}
    </group>
  );
}
