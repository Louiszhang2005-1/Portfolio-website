"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { markThreeReady } from "../DeviceSkeleton";

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

/** Lifts the device skeletons and the loader once a frame has actually been drawn (the frame after the first). */
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
 * One device's own WebGL canvas, living inside its section. It used to be a single fixed full-screen canvas with a
 * <View> per device, but that canvas repositions devices from JS after the browser has already scrolled: on iOS
 * momentum scrolling the device trailed its section by several frames and bled into the next one. A canvas in the
 * section scrolls with it on the compositor, so it can never lag. Mounted only near the viewport (see DeviceView),
 * so at most one or two contexts exist at a time.
 */
export default function DeviceCanvas({ live, children }: { live: boolean; children: ReactNode }) {
  // R3F clamps to the device ratio; the box is small, so 2x stays affordable and keeps screen text crisp
  const [dpr] = useState<[number, number]>(() => [1, (navigator.hardwareConcurrency ?? 8) <= 4 ? 1.75 : 2]);
  // unmounting (scrolled far away) makes R3F release the context on purpose, which also fires webglcontextlost:
  // only a loss while still mounted is a real failure worth swapping the page to its static layouts
  const alive = useRef(true);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return (
    <WebGLBoundary>
      <Canvas
        dpr={dpr}
        frameloop={live ? "always" : "never"}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        onCreated={({ gl }) =>
          gl.domElement.addEventListener("webglcontextlost", () => alive.current && reportLost(), { once: true })
        }
      >
        <ReadySignal />
        {children}
      </Canvas>
    </WebGLBoundary>
  );
}
