"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Car, { carFx } from "./Car";
import Confetti from "./Confetti";
import { resetCar, stepCar } from "./carPhysics";
import type { WorldData } from "./driveData";
import { CAMERA_OFFSET, car, driveStore } from "./driveStore";
import { BOWLING, buildBodies, buildDetails, buildScreens, screenColliders } from "./extrasLayout";
import { Details, Toys } from "./Extras";
import Labels from "./Labels";
import Showcases from "./Showcases";
import Landmarks from "./Landmarks";
import NameBlocks from "./NameBlocks";
import { PALETTE } from "./palette";
import { Ground, Props } from "./Scenery";
import { buildColliders, buildRoads, buildScenery, STOP_TRIGGER, type Circle } from "./worldLayout";

/** physics, stop detection, camera and the shadow light: the one loop that drives everything else */
function Simulation({ world, colliders }: { world: WorldData; colliders: Circle[] }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const light = useRef<THREE.DirectionalLight>(null);
  const follow = useRef({ x: car.x, z: car.z, shake: 0, ready: false });
  const lightTarget = useMemo(() => new THREE.Object3D(), []);
  // reduced motion: same world, no camera shake
  const calm = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    scene.add(lightTarget);
    return () => {
      scene.remove(lightTarget);
    };
  }, [scene, lightTarget]);

  // camera distance from the aspect: wide screens frame ~52 units, portrait phones pull back (capped so the car stays legible)
  const aspect = size.width / Math.max(1, size.height);
  const zoom = THREE.MathUtils.clamp(30 / (0.536 * aspect), 52, 78) / Math.hypot(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z);
  const dist = zoom * Math.hypot(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z);
  const bigShadow = size.width >= 900;

  useEffect(() => {
    const handle = (window as unknown as { __drive?: Record<string, unknown> }).__drive;
    if (process.env.NODE_ENV !== "production" && handle) Object.assign(handle, { camera, gl });
  }, [camera, gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const fx = stepCar(dt, colliders);
    carFx.accel += (fx.accel - carFx.accel) * (1 - Math.exp(-10 * dt));
    carFx.lateral = fx.lateral;
    carFx.steer += (fx.steer - carFx.steer) * (1 - Math.exp(-12 * dt));
    carFx.impact = fx.impact;
    if (car.moved) driveStore.markMoved();

    // nearest stop whose pad the car is on (a little hysteresis so the card doesn't flicker)
    let best: string | null = null;
    let bestD = Infinity;
    const current = driveStore.getNearby();
    for (const s of world.stops) {
      const d = Math.hypot(car.x - s.x, car.z - s.z);
      const limit = STOP_TRIGGER[s.kind] + (s.id === current ? 1.2 : 0);
      if (d < limit && d < bestD) {
        best = s.id;
        bestD = d;
      }
    }
    driveStore.setNearby(best);

    // which district the car is in (names live in the HUD, where nothing in the world can cover them)
    let area: string | null = null;
    let areaD = 17;
    for (const d of world.districts) {
      const dd = Math.hypot(car.x - d.x, car.z - d.z);
      if (dd < areaD) {
        area = d.label;
        areaD = dd;
      }
    }
    driveStore.setDistrict(area);

    // camera: damped follow with a little look-ahead in the direction of travel
    const f = follow.current;
    const tx = car.x + car.vx * 0.32;
    const tz = car.z + car.vz * 0.32;
    if (!f.ready) {
      f.x = tx;
      f.z = tz;
      f.ready = true;
    }
    const k = 1 - Math.exp(-3.2 * dt);
    f.x += (tx - f.x) * k;
    f.z += (tz - f.z) * k;
    f.shake = calm ? 0 : Math.max(f.shake * Math.exp(-7 * dt), fx.impact * 0.5);
    const sx = (Math.random() - 0.5) * f.shake;
    const sy = (Math.random() - 0.5) * f.shake;
    camera.position.set(f.x + CAMERA_OFFSET.x * zoom + sx, CAMERA_OFFSET.y * zoom + sy, f.z + CAMERA_OFFSET.z * zoom);
    camera.lookAt(f.x + sx, 0, f.z);

    // shadow light follows the car, snapped to whole shadow texels so edges don't shimmer
    const l = light.current;
    if (l) {
      const step = 72 / (bigShadow ? 2048 : 1024);
      const lx = Math.round(f.x / step) * step;
      const lz = Math.round(f.z / step) * step;
      l.position.set(lx + 18, 34, lz + 10);
      lightTarget.position.set(lx, 0, lz);
      lightTarget.updateMatrixWorld();
    }
  });

  return (
    <>
      <fog attach="fog" args={[PALETTE.sky, dist + 22, dist + 85]} />
      <hemisphereLight args={["#f6f8ef", "#9fae8c", 1.55]} />
      <directionalLight
        ref={light}
        target={lightTarget}
        intensity={2.1}
        color="#fff6e6"
        castShadow
        shadow-mapSize={bigShadow ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />
    </>
  );
}

/**
 * Steps the pixel ratio down (and back up) when frames run long. Done through the store's setDpr
 * from inside the canvas, so the <Canvas> element itself never re-renders with new props.
 */
function AdaptiveResolution({ max }: { max: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const dpr = useRef(max);
  const change = (d: number) => {
    // never below 1x: blurrier than that reads as broken, and a 1x screen has nothing to give
    const next = Math.round(THREE.MathUtils.clamp(d, Math.min(1, max), max) * 4) / 4;
    if (next === dpr.current) return;
    dpr.current = next;
    setDpr(next);
  };
  return <PerformanceMonitor onDecline={() => change(dpr.current - 0.25)} onIncline={() => change(dpr.current + 0.25)} flipflops={4} />;
}

/** lifts the loading screen once a frame has been drawn */
function Ready({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

export default function DriveScene({ world, onReady, onLost }: { world: WorldData; onReady: () => void; onLost: () => void }) {
  const layout = useMemo(() => {
    const { segments, plazas } = buildRoads(world.districts, world.stops);
    const { trees, rocks } = buildScenery(world.stops, segments, plazas);
    const screens = buildScreens(world.stops);
    const colliders = [...buildColliders(world.stops, trees, rocks), ...screenColliders(screens)];
    const details = buildDetails(world.stops, segments, plazas);
    const bodies = buildBodies(world.stops);
    const labelDistricts = [...world.districts, { label: "Bowling", x: (BOWLING.laneFromX + BOWLING.laneToX) / 2 - 1.5, z: BOWLING.z + 1.4, ground: true }];
    return { segments, plazas, trees, rocks, colliders, screens, details, bodies, labelDistricts };
  }, [world]);
  const [maxDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));

  useEffect(() => {
    resetCar();
  }, []);
  // unmounting (switching to the list) releases the context on purpose, which also fires
  // webglcontextlost: only a loss while still mounted is a real failure
  const alive = useRef(true);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  return (
    <Canvas
      dpr={maxDpr}
      shadows={{ type: THREE.PCFShadowMap }}
      flat
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 30, near: 1, far: 260, position: [CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z] }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => alive.current && onLost(), { once: true });
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      aria-hidden
    >
      <color attach="background" args={[PALETTE.sky]} />
      <AdaptiveResolution max={maxDpr} />
      <Simulation world={world} colliders={layout.colliders} />
      <Ground segments={layout.segments} plazas={layout.plazas} />
      <Props trees={layout.trees} rocks={layout.rocks} />
      <Details tufts={layout.details.tufts} flowers={layout.details.flowers} lamps={layout.details.lamps} />
      <Showcases screens={layout.screens} />
      <Toys specs={layout.bodies} colliders={layout.colliders} />
      <Landmarks stops={world.stops} />
      <NameBlocks />
      <Car />
      <Confetti stops={world.stops} />
      <Suspense fallback={null}>
        <Labels stops={world.stops} districts={layout.labelDistricts} />
      </Suspense>
      <Ready onReady={onReady} />
    </Canvas>
  );
}
