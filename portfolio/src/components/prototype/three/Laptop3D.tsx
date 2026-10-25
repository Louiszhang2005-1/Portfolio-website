"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PortfolioItem } from "@/lib/portfolio";
import { DeviceView, FitCamera, Studio, canvasTexture, clamp01, easeInOut, quantize, useMaterials, useScreen } from "./core";
import { drawKeyboard, drawLaptop } from "./screens";

const BW = 3.0; // base width
const BD = 2.0; // base depth
const LH = 1.95; // lid height

const CLOSED = Math.PI / 2;
const OPEN = -0.22;
/** 0 closed → 1 fully open, from the lid angle */
const openness = (lid: MotionValue<number>) => clamp01((CLOSED - lid.get()) / (CLOSED - OPEN));

type LaptopProps = {
  jobs: PortfolioItem[];
  lid: MotionValue<number>; // radians: PI/2 closed (lying on the deck) → ~-0.2 open
  screenOn: MotionValue<number>;
  track: MotionValue<number>;
};

function LaptopModel({ jobs, lid, screenOn, track }: LaptopProps) {
  const mat = useMaterials();
  const lidRef = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const loaded = useRef(0);
  const logos = useMemo(() => {
    const map: Record<string, HTMLImageElement> = {};
    for (const j of jobs) {
      if (!j.image || map[j.image]) continue;
      const img = new Image();
      img.onload = () => (loaded.current += 1); // forces a redraw once each logo arrives
      img.src = j.image;
      map[j.image] = img;
    }
    return map;
  }, [jobs]);
  const keyboard = useMemo(() => canvasTexture(1024, 420, drawKeyboard).tex, []);
  // the 1280x800 upload is the most expensive per-frame work on the page: redraw only on a visible step
  // the panel wakes while the lid is still rising (not only once it is open), so it is never a black slab on screen
  const state = () => ({
    screen: quantize(Math.max(screenOn.get(), 1 - (1 - clamp01((openness(lid) - 0.1) / 0.3)) ** 2), 1 / 20),
    track: quantize(track.get(), 1 / 40),
  });
  const screen = useScreen(
    1280,
    800,
    (ctx) => drawLaptop(ctx, state(), jobs, logos),
    () => {
      const s = state();
      return `${s.screen.toFixed(3)}|${s.track.toFixed(3)}|${loaded.current}`;
    }
  );

  useFrame((state) => {
    if (lidRef.current) lidRef.current.rotation.x = lid.get();
    if (rig.current) rig.current.position.y = Math.sin(state.clock.elapsedTime * 1.05) * 0.01;
  });

  return (
    <group ref={rig} rotation-y={-0.32} position-x={0.1}>
      {/* deck */}
      <RoundedBox args={[BW, 0.08, BD]} radius={0.035} smoothness={4} material={mat.alu} position={[0, -0.04, 0]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, -0.3]}>
        <planeGeometry args={[2.5, 1.02]} />
        <meshStandardMaterial map={keyboard} roughness={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0015, 0.55]} material={mat.aluDark}>
        <planeGeometry args={[1.05, 0.62]} />
      </mesh>

      {/* lid, hinged on the back edge of the deck */}
      <group ref={lidRef} position={[0, 0, -BD / 2]}>
        <RoundedBox args={[BW, LH, 0.045]} radius={0.03} smoothness={4} material={mat.alu} position={[0, LH / 2 + 0.01, -0.02]} />
        <mesh position={[0, LH / 2 + 0.01, 0.0035]} material={mat.ink}>
          <planeGeometry args={[BW - 0.06, LH - 0.06]} />
        </mesh>
        <mesh position={[0, LH / 2 + 0.03, 0.005]}>
          <planeGeometry args={[BW - 0.24, (BW - 0.24) / 1.6]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function pose(lid: MotionValue<number>) {
  const o = easeInOut(quantize(openness(lid), 1 / 100));
  return { y: 2.1 + (1.15 - 2.1) * o, lookY: 0.05 + (0.72 - 0.05) * o };
}

export default function Laptop3D(props: LaptopProps) {
  return (
    <DeviceView label="3D laptop whose screen shows one window per internship">
      {/* aim follows the lid: a closed laptop is a flat slab near y=0, so centre it instead of leaving it at the
          bottom of a frame sized for the open screen */}
      <FitCamera w={3.5} h={2.75} fill={0.98} pose={() => pose(props.lid)} />
      <Studio intensity={1.05} />
      <LaptopModel {...props} />
    </DeviceView>
  );
}
