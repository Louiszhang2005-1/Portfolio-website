"use client";

import { View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import * as THREE from "three";
import { markThreeReady } from "../DeviceSkeleton";
import { anyDeviceViewVisible, subscribeDeviceViews } from "./core";

/** Contract with useWebGL() (stage.tsx): on this event the page swaps every device for its static layout. */
const WEBGL_LOST = "proto:webgl-lost";
const reportLost = () => window.dispatchEvent(new Event(WEBGL_LOST));

/** A shader or context failure must never take the page down with it: drop the canvas, let the DOM fallbacks take over. */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    reportLost();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** A stopped loop leaves its last frame on screen; wipe it so a device that scrolled away is not frozen at the edge. */
function ClearWhenIdle({ idle }: { idle: boolean }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!idle) return;
    gl.setScissorTest(false);
    gl.clear(true, true);
  }, [idle, gl]);
  return null;
}

/** Lifts the device skeletons once a frame has actually been drawn (the frame after the first, so it is on screen). */
function ReadySignal() {
  const drawn = useRef(false);
  useFrame(() => {
    if (drawn.current) return;
    drawn.current = true;
    requestAnimationFrame(markThreeReady);
  });
  return null;
}

/**
 * The page's single WebGL context (DESIGN.md: at most one 3D scene per page). Fixed behind the header;
 * each chapter's <View> tells it which box to draw that device into, and off-screen views are skipped.
 * The loop only runs while a device view is on screen; the scroll springs keep it busy just long enough.
 */
export default function ThreeRoot() {
  const live = useSyncExternalStore(subscribeDeviceViews, anyDeviceViewVisible, () => false);
  // R3F clamps the range to the device ratio. 1x on a 2-3x phone made every screen texture blurry, so even
  // low-core devices (incl. iPhones, which report few cores) get high-DPI; only the ceiling drops a little.
  const [dpr] = useState<[number, number]>(() => [1, (navigator.hardwareConcurrency ?? 8) <= 4 ? 1.75 : 2]);
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <WebGLBoundary>
        <Canvas
          dpr={dpr}
          frameloop={live ? "always" : "never"}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          style={{ pointerEvents: "none" }}
          onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", reportLost, { once: true })}
        >
          <ClearWhenIdle idle={!live} />
          <ReadySignal />
          <View.Port />
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
