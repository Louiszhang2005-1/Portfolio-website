"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Stop } from "./driveData";
import { CAMERA_YAW, driveStore } from "./driveStore";
import { PALETTE } from "./palette";
import { STOP_TRIGGER } from "./worldLayout";

const tmp = new THREE.Object3D();
const col = new THREE.Color();
const padFill = new THREE.Color(PALETTE.padFill);

function setInstance(mesh: THREE.InstancedMesh, i: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, ry = 0, rx = 0) {
  tmp.position.set(x, y, z);
  tmp.rotation.set(rx, ry, 0);
  tmp.scale.set(sx, sy, sz);
  tmp.updateMatrix();
  mesh.setMatrixAt(i, tmp.matrix);
}

/** trigger pads: a filled disc and a rim, both instanced; the nearby one lights up in its accent */
function Pads({ stops }: { stops: Stop[] }) {
  const fill = useRef<THREE.InstancedMesh>(null);
  const rim = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const f = fill.current;
    const r = rim.current;
    if (!f || !r) return;
    stops.forEach((s, i) => {
      const rad = STOP_TRIGGER[s.kind] - 0.4;
      setInstance(f, i, s.x, 0, s.z, rad, rad, 1, 0, -Math.PI / 2);
      setInstance(r, i, s.x, 0, s.z, rad, rad, 1, 0, -Math.PI / 2);
    });
    f.instanceMatrix.needsUpdate = true;
    r.instanceMatrix.needsUpdate = true;
    f.computeBoundingSphere();
    r.computeBoundingSphere();
  }, [stops]);

  useEffect(() => {
    const paint = () => {
      const f = fill.current;
      const r = rim.current;
      if (!f || !r) return;
      const near = driveStore.getNearby();
      const visited = driveStore.getVisited();
      stops.forEach((s, i) => {
        const on = s.id === near;
        col.set(on ? s.accent : PALETTE.padFill);
        if (on) col.lerp(padFill, 0.72);
        f.setColorAt(i, col);
        col.set(on || visited.has(s.id) ? s.accent : PALETTE.padRing);
        r.setColorAt(i, col);
      });
      if (f.instanceColor) f.instanceColor.needsUpdate = true;
      if (r.instanceColor) r.instanceColor.needsUpdate = true;
    };
    paint();
    return driveStore.subscribe(paint);
  }, [stops]);

  return (
    <group>
      <instancedMesh ref={fill} args={[undefined, undefined, stops.length]} position-y={0.02} receiveShadow>
        <circleGeometry args={[1, 48]} />
        <meshLambertMaterial polygonOffset polygonOffsetFactor={-2} />
      </instancedMesh>
      <instancedMesh ref={rim} args={[undefined, undefined, stops.length]} position-y={0.03}>
        <ringGeometry args={[0.93, 1, 64]} />
        <meshBasicMaterial polygonOffset polygonOffsetFactor={-3} />
      </instancedMesh>
    </group>
  );
}

/** internship buildings: body, roof and windows, three instanced meshes for every office */
function Offices({ stops }: { stops: Stop[] }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const roof = useRef<THREE.InstancedMesh>(null);
  const windows = useRef<THREE.InstancedMesh>(null);
  const perRow = 4;

  useLayoutEffect(() => {
    const b = body.current;
    const r = roof.current;
    const w = windows.current;
    if (!b || !r || !w) return;
    stops.forEach((s, i) => {
      setInstance(b, i, s.x, 1.7, s.z, 5.6, 3.4, 4.2);
      setInstance(r, i, s.x, 3.55, s.z, 6.0, 0.35, 4.6);
      r.setColorAt(i, col.set(s.accent));
      for (let k = 0; k < perRow * 2; k++) {
        const side = k < perRow ? 1 : -1;
        const n = k % perRow;
        // windows on the two faces the camera sees (south and east)
        if (side > 0) setInstance(w, i * perRow * 2 + k, s.x - 2.0 + n * 1.33, 2.2, s.z + 2.11, 0.8, 1.0, 0.06);
        else setInstance(w, i * perRow * 2 + k, s.x + 2.81, 2.2, s.z - 1.4 + n * 0.93, 0.06, 1.0, 0.6);
      }
    });
    for (const m of [b, r, w]) {
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
    if (r.instanceColor) r.instanceColor.needsUpdate = true;
  }, [stops]);

  if (stops.length === 0) return null;
  return (
    <group>
      <instancedMesh ref={body} args={[undefined, undefined, stops.length]} castShadow receiveShadow>
        <boxGeometry />
        <meshLambertMaterial color={PALETTE.building} />
      </instancedMesh>
      <instancedMesh ref={roof} args={[undefined, undefined, stops.length]} castShadow>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, stops.length * perRow * 2]}>
        <boxGeometry />
        <meshLambertMaterial color={PALETTE.glass} />
      </instancedMesh>
    </group>
  );
}

function prepLogo(t: THREE.Texture | THREE.Texture[]) {
  for (const tex of Array.isArray(t) ? t : [t]) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
  }
}

/** rooftop billboard with the company's logo, turned to face the camera */
function LogoBoard({ stop }: { stop: Stop & { logo: string } }) {
  const texture = useTexture(stop.logo, prepLogo);
  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 1.6;
  const h = 2.1;
  const w = Math.min(4.8, h * aspect);
  return (
    <group position={[stop.x, 3.72, stop.z - 0.4]} rotation-y={CAMERA_YAW}>
      {[-w / 2 + 0.35, w / 2 - 0.35].map((x) => (
        <mesh key={x} position={[x, 0.3, -0.05]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.12]} />
          <meshLambertMaterial color={PALETTE.carDark} />
        </mesh>
      ))}
      <mesh position={[0, 0.6 + h / 2, -0.07]} castShadow>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.1]} />
        <meshLambertMaterial color={PALETTE.carDark} />
      </mesh>
      <mesh position={[0, 0.6 + h / 2, -0.015]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

const ICON_SHAPES = ["torus", "box", "octa"] as const;

/** project plinths with a spinning, bobbing icon per sector (one instanced mesh per shape) */
function Exhibits({ stops, wins }: { stops: Stop[]; wins: Stop[] }) {
  const plinths = useRef<THREE.InstancedMesh>(null);
  const icons = useRef<(THREE.InstancedMesh | null)[]>([]);
  const trophies = useRef<THREE.InstancedMesh>(null);

  const groups = useMemo(() => {
    const names: string[] = [];
    for (const s of stops) if (!names.includes(s.group)) names.push(s.group);
    return ICON_SHAPES.map((_, gi) => stops.filter((s) => names.indexOf(s.group) % ICON_SHAPES.length === gi));
  }, [stops]);
  const all = useMemo(() => [...stops, ...wins], [stops, wins]);

  const cup = useMemo(() => {
    const pts = [
      [0, 0], [0.42, 0], [0.42, 0.08], [0.14, 0.16], [0.1, 0.5], [0.2, 0.62], [0.52, 0.86], [0.56, 1.3], [0.5, 1.3], [0.44, 0.92], [0, 0.8],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 12);
  }, []);

  useLayoutEffect(() => {
    const p = plinths.current;
    if (!p) return;
    all.forEach((s, i) => {
      const win = s.kind === "win";
      setInstance(p, i, s.x, win ? 0.7 : 0.45, s.z, win ? 1.0 : 1.25, win ? 1.4 : 0.9, win ? 1.0 : 1.25);
    });
    p.instanceMatrix.needsUpdate = true;
    p.computeBoundingSphere();
    groups.forEach((list, gi) => {
      const m = icons.current[gi];
      if (!m) return;
      list.forEach((s, i) => m.setColorAt(i, col.set(s.accent)));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, [all, groups]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groups.forEach((list, gi) => {
      const m = icons.current[gi];
      if (!m) return;
      list.forEach((s, i) => {
        const phase = s.x * 0.37 + s.z * 0.21;
        setInstance(m, i, s.x, 1.85 + Math.sin(t * 1.6 + phase) * 0.12, s.z, 1, 1, 1, t * 0.8 + phase);
      });
      m.instanceMatrix.needsUpdate = true;
    });
    const tr = trophies.current;
    if (tr) {
      wins.forEach((s, i) => setInstance(tr, i, s.x, 1.4, s.z, 1, 1, 1, t * 0.6 + i));
      tr.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={plinths} args={[undefined, undefined, Math.max(1, all.length)]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshLambertMaterial color={PALETTE.building} flatShading />
      </instancedMesh>
      {groups.map((list, gi) =>
        list.length === 0 ? null : (
          <instancedMesh
            key={gi}
            ref={(m) => {
              icons.current[gi] = m;
            }}
            args={[undefined, undefined, list.length]}
            castShadow
            frustumCulled={false}
          >
            {ICON_SHAPES[gi] === "torus" && <torusGeometry args={[0.5, 0.2, 6, 6]} />}
            {ICON_SHAPES[gi] === "box" && <boxGeometry args={[0.72, 0.72, 0.72]} />}
            {ICON_SHAPES[gi] === "octa" && <octahedronGeometry args={[0.6, 0]} />}
            <meshLambertMaterial flatShading />
          </instancedMesh>
        ),
      )}
      {wins.length > 0 && (
        <instancedMesh ref={trophies} args={[undefined, undefined, wins.length]} geometry={cup} castShadow frustumCulled={false}>
          <meshLambertMaterial color={PALETTE.gold} emissive={PALETTE.gold} emissiveIntensity={0.18} flatShading />
        </instancedMesh>
      )}
    </group>
  );
}

/** the contact stop: a big mailbox */
function Mailbox({ stop }: { stop: Stop }) {
  return (
    <group position={[stop.x, 0, stop.z]} rotation-y={-0.5} scale={1.6}>
      <mesh position-y={0.6} castShadow>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshLambertMaterial color={PALETTE.carDark} />
      </mesh>
      <mesh position-y={1.55} castShadow>
        <boxGeometry args={[1.0, 0.75, 1.5]} />
        <meshLambertMaterial color={stop.accent} />
      </mesh>
      <mesh position-y={1.92} rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.5, 12, 1, false, -Math.PI / 2, Math.PI]} />
        <meshLambertMaterial color={stop.accent} />
      </mesh>
      <mesh position={[0.56, 2.05, 0.25]} castShadow>
        <boxGeometry args={[0.06, 0.7, 0.08]} />
        <meshLambertMaterial color={PALETTE.carDark} />
      </mesh>
      <mesh position={[0.56, 2.3, 0.47]}>
        <boxGeometry args={[0.06, 0.32, 0.42]} />
        <meshLambertMaterial color={PALETTE.gold} />
      </mesh>
    </group>
  );
}

export default function Landmarks({ stops }: { stops: Stop[] }) {
  const offices = useMemo(() => stops.filter((s) => s.kind === "internship"), [stops]);
  const projects = useMemo(() => stops.filter((s) => s.kind === "project"), [stops]);
  const wins = useMemo(() => stops.filter((s) => s.kind === "win"), [stops]);
  const contact = stops.find((s) => s.kind === "contact");
  return (
    <group>
      <Pads stops={stops} />
      <Offices stops={offices} />
      <Suspense fallback={null}>
        {offices.map((s) => (s.logo ? <LogoBoard key={s.id} stop={{ ...s, logo: s.logo }} /> : null))}
      </Suspense>
      <Exhibits stops={projects} wins={wins} />
      {contact && <Mailbox stop={contact} />}
    </group>
  );
}
