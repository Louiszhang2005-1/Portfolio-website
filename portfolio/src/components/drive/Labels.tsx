"use client";

import { useThree } from "@react-three/fiber";
import { use, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { District, Stop } from "./driveData";
import { CAMERA_OFFSET, CAMERA_YAW } from "./driveStore";
import { signAnchor } from "./extrasLayout";
import { createAtlas, type LabelSpec } from "./labelAtlas";
import { PALETTE } from "./palette";
import { NAME_Z } from "./worldLayout";

let fontsPromise: Promise<void> | null = null;
/** resolves when the page fonts are usable in canvas, or after a short wait (never blocks the world) */
function fontsReady() {
  if (!fontsPromise) {
    const load = Promise.all([
      document.fonts.load('700 64px "Space Grotesk"'),
      document.fonts.load('600 32px "Plus Jakarta Sans"'),
      document.fonts.load('700 64px "Plus Jakarta Sans"'),
    ]).then(() => undefined);
    fontsPromise = Promise.race([load, new Promise<void>((r) => setTimeout(r, 1500))]).catch(() => undefined);
  }
  return fontsPromise;
}

const SIGN_HEIGHT: Record<Stop["kind"], number> = { internship: 7.9, project: 5.3, win: 5.3, contact: 4.6 };

type Quad = { cell: number; height: number; flat: boolean; x: number; y: number; z: number };

export default function Labels({ stops, districts }: { stops: Stop[]; districts: District[] }) {
  use(fontsReady());
  const invalidate = useThree((s) => s.invalidate);

  const { geometry, material } = useMemo(() => {
    const specs: LabelSpec[] = [];
    const quads: Quad[] = [];
    for (const s of stops) {
      const at = signAnchor(s);
      quads.push({ cell: specs.length, height: s.kind === "internship" ? 1.9 : 1.5, flat: false, x: at.x, y: SIGN_HEIGHT[s.kind], z: at.z });
      specs.push({ style: "sign", kicker: s.kicker, title: s.title, accent: s.accent });
    }
    for (const d of districts) {
      quads.push({ cell: specs.length, height: 2.2, flat: true, x: d.x + 1.5, y: 0.05, z: d.z + 2.2 });
      specs.push({ style: "ground", text: d.label, size: "md", color: "rgba(29,35,33,0.55)" });
    }
    quads.push({ cell: specs.length, height: 1.5, flat: true, x: 0, y: 0.05, z: NAME_Z + 3.2 });
    specs.push({ style: "ground", text: "Mechanical Engineering · Polytechnique Montréal", size: "sm", color: PALETTE.ink });
    quads.push({ cell: specs.length, height: 1.3, flat: true, x: 0, y: 0.05, z: NAME_Z + 4.7 });
    specs.push({ style: "ground", text: "Open to 2027 internship opportunities", size: "sm", color: PALETTE.car });

    const atlas = createAtlas(specs);
    // signs face the (never rotating) camera; ground text lies flat, reading "up" the screen
    const eye = new THREE.Vector3(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z);
    const billboard = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(eye, new THREE.Vector3(), new THREE.Vector3(0, 1, 0)));
    const flat = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), CAMERA_YAW)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));

    const pos = new Float32Array(quads.length * 12);
    const uv = new Float32Array(quads.length * 8);
    const idx: number[] = [];
    const v = new THREE.Vector3();
    quads.forEach((q, i) => {
      const c = atlas.cells[q.cell];
      const h = q.height;
      const w = h * c.aspect;
      const corners = [
        [-w / 2, -h / 2, c.u0, c.v0],
        [w / 2, -h / 2, c.u1, c.v0],
        [w / 2, h / 2, c.u1, c.v1],
        [-w / 2, h / 2, c.u0, c.v1],
      ];
      corners.forEach(([cx, cy, u, vv], k) => {
        v.set(cx, cy, 0).applyQuaternion(q.flat ? flat : billboard);
        pos.set([v.x + q.x, v.y + q.y, v.z + q.z], (i * 4 + k) * 3);
        uv.set([u, vv], (i * 4 + k) * 2);
      });
      const b = i * 4;
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const m = new THREE.MeshBasicMaterial({ map: atlas.texture, transparent: true, depthWrite: false, toneMapped: false });
    return { geometry: g, material: m };
  }, [stops, districts]);

  useEffect(() => {
    invalidate();
    return () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    };
  }, [geometry, material, invalidate]);

  return <mesh geometry={geometry} material={material} renderOrder={2} />;
}
