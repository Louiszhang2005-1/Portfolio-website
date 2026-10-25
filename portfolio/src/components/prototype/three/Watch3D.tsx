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
  CalloutLayout,
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
import { drawCellLabel, drawWatch } from "./screens";

const W = 0.4;
const H = 0.48;
const R = 0.1;
const GAP = 0.13;
const N = 7;

export const WATCH_PARTS: Part[] = [
  { code: "W1", name: "Band", spec: "Fluoroelastomer" },
  { code: "W2", name: "Sensor array", spec: "Optical HR · 4 LED" },
  { code: "W3", name: "Cell", spec: "Li-ion · 308 mAh" },
  { code: "W4", name: "System in package", spec: "SiP · BLE · IMU" },
  { code: "W5", name: "Case", spec: "6000-series Al" },
  { code: "W6", name: "OLED panel", spec: "1.9 in · LTPO" },
  { code: "W7", name: "Cover glass", spec: "Sapphire · 0.6 mm" },
];

const zAt = (i: number) => (i - (N - 1) / 2) * 0.012;

type WatchProps = { m: DeviceMotion; notif: MotionValue<number>; hero: MotionValue<number> };

/** Band strap whose far end fades out, so a large watch never ends in a hard edge. */
function useStrapFade() {
  return useMemo(
    () =>
      canvasTexture(8, 256, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 256);
        // fully transparent well before the far end, so the view's edge never cuts the band
        g.addColorStop(0, "black");
        g.addColorStop(0.55, "black");
        g.addColorStop(0.92, "white");
        g.addColorStop(1, "white");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 8, 256);
      }).tex,
    []
  );
}

function WatchModel({ rig, m, notif, hero, labels }: WatchProps & { labels: CalloutRef[]; rig: RefObject<THREE.Group | null> }) {
  const mat = useMaterials();
  const fade = useStrapFade();
  const geo = useMemo(
    () => ({
      case: slab(W, H, R, 0.1, [{ w: W - 0.04, h: H - 0.04, r: R - 0.02 }], 0.014),
      back: slab(W - 0.02, H - 0.02, R - 0.01, 0.014),
      screen: roundedPlane(W - 0.05, H - 0.05, R - 0.025),
      bezel: slab(W - 0.03, H - 0.03, R - 0.015, 0.006),
      glass: slab(W - 0.005, H - 0.005, R - 0.003, 0.008, [], 0.004),
    }),
    []
  );
  const strapMat = useMemo(() => {
    const s = mat.rubber.clone();
    s.alphaMap = fade;
    s.transparent = true;
    return s;
  }, [mat, fade]);
  const cellLabel = useMemo(() => canvasTexture(256, 256, (ctx) => drawCellLabel(ctx, ["Li-ion", "3.85 V", "308 mAh"])).tex, []);
  const screen = useScreen(
    360,
    440,
    (ctx) => drawWatch(ctx, quantize(notif.get(), 1 / 40)),
    () => quantize(notif.get(), 1 / 40).toFixed(3) + new Date().getMinutes()
  );

  useFrame((state) => {
    const g = rig.current;
    if (!g) return;
    const t = m.tilt.get();
    g.rotation.set(-t * 1.0 + 0.02, -0.12 * (1 - t), t * 0.66);
    g.scale.setScalar((1 - t * 0.5) * hero.get());
    g.position.x = -t * 0.14;
    g.position.y = Math.sin(state.clock.elapsedTime * 1.05) * 0.006;
  });

  const anchor = (i: number): [number, number, number] => [W / 2 - 0.02, -H / 2 + 0.03, zAt(i)];
  const L = { m, total: N, gap: GAP };

  return (
    <group ref={rig}>
      <Layer3D {...L} index={0} anchor={[0.14, -0.42, zAt(0)]} label={labels[0]}>
        <group position-z={zAt(0) - 0.01}>
          {[1, -1].map((dir) => (
            <mesh key={dir} position={[0, dir * (H / 2 + 0.26), 0]} rotation-z={dir === 1 ? 0 : Math.PI} material={strapMat}>
              <boxGeometry args={[0.3, 0.56, 0.035]} />
            </mesh>
          ))}
        </group>
      </Layer3D>

      <Layer3D {...L} index={1} anchor={anchor(1)} label={labels[1]}>
        <group position-z={zAt(1)}>
          <mesh geometry={geo.back} material={mat.ink} />
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} material={mat.led} position={[Math.cos((k * Math.PI) / 2) * 0.06, Math.sin((k * Math.PI) / 2) * 0.06, 0.009]}>
              <sphereGeometry args={[0.012, 16, 16]} />
            </mesh>
          ))}
        </group>
      </Layer3D>

      <Layer3D {...L} index={2} anchor={anchor(2)} label={labels[2]}>
        <group position-z={zAt(2)}>
          <RoundedBox args={[0.28, 0.34, 0.016]} radius={0.04} smoothness={4} material={mat.cell} />
          <mesh position-z={0.0085}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshStandardMaterial map={cellLabel} roughness={0.6} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={3} drift={[-0.03, 0]} anchor={anchor(3)} label={labels[3]}>
        <group position-z={zAt(3)}>
          <RoundedBox args={[0.3, 0.36, 0.01]} radius={0.06} smoothness={4} material={mat.pcb} />
          <mesh material={mat.chip} position-z={0.009}>
            <boxGeometry args={[0.12, 0.12, 0.01]} />
          </mesh>
          {Array.from({ length: 8 }, (_, k) => (
            <mesh key={k} material={mat.gold} position={[-0.09 + k * 0.026, -0.14, 0.007]}>
              <boxGeometry args={[0.01, 0.022, 0.003]} />
            </mesh>
          ))}
          <mesh material={mat.kapton} position={[0.16, 0.1, 0.004]} rotation-z={0.5}>
            <boxGeometry args={[0.12, 0.035, 0.004]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={4} anchor={[W / 2 - 0.02, -H / 2 + 0.03, zAt(4)]} label={labels[4]}>
        <group position-z={zAt(4)}>
          <mesh geometry={geo.case} material={mat.alu} />
          {/* digital crown + side button */}
          <mesh material={mat.alu} position={[W / 2 + 0.018, 0.07, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.034, 0.034, 0.04, 36]} />
          </mesh>
          <mesh material={mat.aluDark} position={[W / 2 + 0.008, -0.08, 0]}>
            <boxGeometry args={[0.016, 0.1, 0.03]} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={5} anchor={anchor(5)} label={labels[5]}>
        <group position-z={zAt(5) + 0.03}>
          <mesh geometry={geo.bezel} material={mat.ink} />
          <mesh geometry={geo.screen} position-z={0.0035}>
            <meshBasicMaterial map={screen} toneMapped={false} />
          </mesh>
        </group>
      </Layer3D>

      <Layer3D {...L} index={6} anchor={anchor(6)} label={labels[6]}>
        <mesh geometry={geo.glass} material={mat.glass} position-z={zAt(6) + 0.04} />
      </Layer3D>
    </group>
  );
}

export default function Watch3D(props: WatchProps) {
  const rig = useRef<THREE.Group>(null);
  const caption = useRef<HTMLDivElement>(null);
  const labels = useMemo(() => makeCallouts(WATCH_PARTS.length), []);
  return (
    <DeviceView
      label="3D watch showing Louis Zhang's name and the time, which comes apart into labelled layers as you scroll"
      caption={caption}
      overlay={WATCH_PARTS.map((p, i) => <Callout key={p.code} part={p} c={labels[i]} />)}
    >
      {/* framed by the case: the band is allowed to run off the frame like a product shot */}
      <FitCamera w={0.56} h={0.6} fill={0.72} />
      <Studio />
      <WatchModel {...props} labels={labels} rig={rig} />
      <CalloutLayout callouts={labels} target={rig} caption={caption} />
    </DeviceView>
  );
}
