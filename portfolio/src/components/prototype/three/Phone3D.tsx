"use client";
/* eslint-disable react-hooks/immutability -- the rig group (passed in so CalloutLayout can measure it) is posed
   per frame inside useFrame, the react-three-fiber way to animate without re-rendering. */

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  Callout,
  clamp01,
  CalloutLayout,
  calloutsShown,
  DeviceView,
  FitCamera,
  Layer3D,
  makeCallouts,
  quantize,
  Studio,
  canvasTexture,
  roundedPlane,
  slab,
  useMaterials,
  useScreen,
  type CalloutRef,
  type DeviceMotion,
  type Part,
} from "./core";
import { drawCellLabel, drawPhone } from "./screens";

const W = 0.72;
const H = 1.48;
const R = 0.11;
const GAP = 0.24;
const N = 8;

export const PHONE_PARTS: Part[] = [
  { code: "P8", name: "Back glass", spec: "Matte · 0.8 mm" },
  { code: "P7", name: "Camera modules", spec: "48 MP · OIS · LiDAR" },
  { code: "P6", name: "Cell", spec: "Li-ion · 4,000 mAh" },
  { code: "P5", name: "Logic board", spec: "10-layer HDI" },
  { code: "P4", name: "Midframe", spec: "7000-series Al · taptic" },
  { code: "P3", name: "Frame + buttons", spec: "Anodised Al · antenna" },
  { code: "P2", name: "OLED panel", spec: "6.1 in · 460 ppi" },
  { code: "P1", name: "Cover glass", spec: "Ceramic-glass · 0.7 mm" },
];

/** assembled stacking offset so layers never z-fight before they explode */
const zAt = (i: number) => (i - (N - 1) / 2) * 0.0105;

type PhoneProps = {
  m: DeviceMotion;
  lockOn: MotionValue<number>;
  homeOn: MotionValue<number>;
  codeOn: MotionValue<number>;
  /** chapter progress; kept for API compatibility (the screen now keys off homeOn alone) */
  progress: MotionValue<number>;
  diveScale: MotionValue<number>;
};

function PhoneModel({ rig, m, lockOn, homeOn, codeOn, diveScale, labels }: PhoneProps & { labels: CalloutRef[]; rig: RefObject<THREE.Group | null> }) {
  const mat = useMaterials();
  const geo = useMemo(
    () => ({
      back: slab(W, H, R, 0.012),
      midframe: slab(W - 0.05, H - 0.05, R - 0.025, 0.012, [
        { w: 0.58, h: 0.44, r: 0.04, y: 0.44 },
        { w: 0.6, h: 0.72, r: 0.04, y: -0.2 },
      ]),
      frame: slab(W, H, R, 0.05, [{ w: W - 0.05, h: H - 0.05, r: R - 0.025 }], 0.01),
      bezel: slab(W - 0.03, H - 0.03, R - 0.015, 0.006),
      screen: roundedPlane(W - 0.06, H - 0.06, R - 0.03),
      glass: slab(W, H, R, 0.006, [], 0.003),
      camWindow: roundedPlane(0.34, 0.34, 0.07),
    }),
    []
  );
  const cellLabel = useMemo(() => canvasTexture(512, 512, (ctx) => drawCellLabel(ctx, ["Li-ion polymer", "3.87 V 4,000 mAh", "15.48 Wh"])).tex, []);
  // draw from the same snapped values as the key, so the resting frame matches what was last drawn
  const state = () => ({
    lock: quantize(lockOn.get(), 1 / 20),
    home: quantize(homeOn.get(), 1 / 20),
    code: quantize(codeOn.get(), 1 / 20),
  });
  const screen = useScreen(
    540,
    1150,
    (ctx) => drawPhone(ctx, state()),
    () => {
      const s = state();
      return [s.lock, s.home, s.code].map((v) => v.toFixed(3)).join() + new Date().getMinutes();
    }
  );

  useFrame((state) => {
    const g = rig.current;
    if (!g) return;
    const t = m.tilt.get();
    g.rotation.set(-t * 1.0, 0, t * 0.66);
    g.scale.setScalar((1 - t * 0.4) * diveScale.get());
    g.position.x = calloutsShown() ? -t * 0.3 * clamp01((m.spread.get() - 0.3) / 0.7) : 0;
    g.position.y = Math.sin(state.clock.elapsedTime * 1.05) * 0.012;
  });

  /* Anchors are picked so they project in stacking order once exploded (screen-up ≈ 0.33x + 0.43y + 0.84z at full
     tilt, 0.2 per layer): the label column is in layer order too, so no two leader lines cross. */
  const L = { m, total: N, gap: GAP };

  return (
    <group ref={rig}>
      <Layer3D {...L} index={0} anchor={[W / 2 - 0.02, -H / 2 + 0.03, zAt(0)]} label={labels[0]}>
        {/* inner face of the back glass: charging coil + camera window, so the last layer of the dive reads as a part */}
        <group position-z={zAt(0)}>
          <mesh geometry={geo.back} material={mat.graphite} />
          <mesh material={mat.gold} position={[0, -0.12, 0.0065]}>
            <ringGeometry args={[0.1, 0.17, 48]} />
          </mesh>
          <mesh material={mat.kapton} position={[0, -0.12, 0.007]}>
            <circleGeometry args={[0.1, 48]} />
          </mesh>
          <mesh geometry={geo.camWindow} material={mat.ink} position={[-W / 2 + 0.2, H / 2 - 0.22, 0.0065]} />
        </group>
      </Layer3D>

      <Layer3D {...L} index={1} drift={[-0.08, 0.05]} anchor={[0.22, 0.5, zAt(1)]} label={labels[1]}>
        <group position={[-W / 2 + 0.2, H / 2 - 0.22, zAt(1)]}>
          {[
            [-0.06, 0.06],
            [-0.06, -0.08],
            [0.08, -0.01],
          ].map(([x, y], k) => (
            <group key={k} position={[x, y, 0]}>
              <mesh material={mat.alu} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.058, 0.058, 0.028, 40]} />
              </mesh>
              <mesh material={mat.lens} rotation-x={Math.PI / 2} position-z={0.012}>
                <cylinderGeometry args={[0.044, 0.044, 0.01, 40]} />
              </mesh>
            </group>
          ))}
          <mesh material={mat.kapton} position={[0.2, -0.02, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.004]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={2} drift={[0.05, 0.02]} anchor={[0.26, 0.1, zAt(2)]} label={labels[2]}>
        <group position={[0, -0.2, zAt(2)]}>
          <RoundedBox args={[0.56, 0.72, 0.018]} radius={0.03} smoothness={4} material={mat.cell} />
          <mesh position-z={0.0095}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshStandardMaterial map={cellLabel} roughness={0.6} />
          </mesh>
          <mesh material={mat.kapton} position={[0, 0.38, 0]}>
            <boxGeometry args={[0.14, 0.06, 0.004]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={3} drift={[-0.05, -0.02]} anchor={[0.28, 0.26, zAt(3)]} label={labels[3]}>
        <group position={[0, 0.44, zAt(3)]}>
          <RoundedBox args={[0.6, 0.42, 0.012]} radius={0.025} smoothness={3} material={mat.pcb} />
          <mesh material={mat.steel} position={[-0.13, 0.03, 0.012]}>
            <boxGeometry args={[0.26, 0.2, 0.012]} />
          </mesh>
          <mesh material={mat.chip} position={[0.14, 0.07, 0.01]}>
            <boxGeometry args={[0.12, 0.12, 0.008]} />
          </mesh>
          <mesh material={mat.chip} position={[0.24, 0.08, 0.009]}>
            <boxGeometry args={[0.07, 0.06, 0.006]} />
          </mesh>
          <mesh material={mat.chip} position={[0.24, -0.02, 0.009]}>
            <boxGeometry args={[0.07, 0.04, 0.006]} />
          </mesh>
          {Array.from({ length: 12 }, (_, k) => (
            <mesh key={k} material={mat.gold} position={[-0.24 + k * 0.025, -0.17, 0.008]}>
              <boxGeometry args={[0.012, 0.03, 0.003]} />
            </mesh>
          ))}
          <mesh material={mat.kapton} position={[0.27, -0.13, 0.004]} rotation-z={-0.4}>
            <boxGeometry args={[0.18, 0.05, 0.004]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={4} anchor={[W / 2 - 0.03, 0, zAt(4)]} label={labels[4]}>
        <group position-z={zAt(4)}>
          <mesh geometry={geo.midframe} material={mat.brushed} />
          <mesh material={mat.steel} position={[-0.14, -0.62, 0.01]}>
            <boxGeometry args={[0.26, 0.08, 0.02]} />
          </mesh>
          <mesh material={mat.chip} position={[0.18, -0.62, 0.008]}>
            <boxGeometry args={[0.16, 0.08, 0.016]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={5} anchor={[W / 2, 0.1, zAt(5)]} label={labels[5]}>
        <group position-z={zAt(5)}>
          <mesh geometry={geo.frame} material={mat.alu} />
          <mesh material={mat.alu} position={[W / 2 + 0.006, 0.2, 0]}>
            <boxGeometry args={[0.014, 0.2, 0.03]} />
          </mesh>
          <mesh material={mat.alu} position={[-W / 2 - 0.006, 0.28, 0]}>
            <boxGeometry args={[0.014, 0.11, 0.03]} />
          </mesh>
          <mesh material={mat.alu} position={[-W / 2 - 0.006, 0.12, 0]}>
            <boxGeometry args={[0.014, 0.11, 0.03]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={6} anchor={[W / 2 - 0.03, 0, zAt(6)]} label={labels[6]}>
        <group position-z={zAt(6)}>
          <mesh geometry={geo.bezel} material={mat.ink} />
          <mesh geometry={geo.screen} position-z={0.0035}>
            <meshBasicMaterial map={screen} toneMapped={false} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={7} anchor={[W / 2 - 0.02, 0, zAt(7)]} label={labels[7]}>
        <mesh geometry={geo.glass} material={mat.glass} position-z={zAt(7) + 0.004} />
      </Layer3D>
    </group>
  );
}

/** Phone viewport: 3D model in the shared canvas, callouts as page text on top. */
export default function Phone3D(props: PhoneProps) {
  const rig = useRef<THREE.Group>(null);
  const caption = useRef<HTMLDivElement>(null);
  const labels = useMemo(() => makeCallouts(PHONE_PARTS.length), []);
  return (
    <DeviceView
      label="3D phone that comes apart into eight labelled layers: cover glass, display, frame, midframe, logic board, battery, cameras, back glass"
      caption={caption}
      overlay={PHONE_PARTS.map((p, i) => <Callout key={p.code} part={p} c={labels[i]} />)}
    >
      <FitCamera w={0.86} h={1.6} fill={0.9} />
      <Studio />
      <PhoneModel {...props} labels={labels} rig={rig} />
      <CalloutLayout callouts={labels} target={rig} caption={caption} />
    </DeviceView>
  );
}
