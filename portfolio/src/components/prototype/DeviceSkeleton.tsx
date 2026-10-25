"use client";

import { useEffect, useState } from "react";

/* "3D is on screen" signal, sent by ThreeRoot after the canvas draws its first frame. A window event plus a flag
   (not module state): ThreeRoot lives in its own lazily loaded chunk, so module-level state was not shared. */
const READY = "proto:three-ready";
type ReadyWindow = Window & { __protoThreeReady?: boolean };
export function markThreeReady() {
  const w = window as ReadyWindow;
  if (w.__protoThreeReady) return;
  w.__protoThreeReady = true;
  window.dispatchEvent(new Event(READY));
}
function useThreeReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => setReady(true);
    if ((window as ReadyWindow).__protoThreeReady) return done();
    window.addEventListener(READY, done);
    // never leave a skeleton up if the first frame is slow or never comes (the static fallback takes over then)
    const t = window.setTimeout(done, 8000);
    return () => {
      window.removeEventListener(READY, done);
      window.clearTimeout(t);
    };
  }, []);
  return ready;
}

const SHAPES = {
  watch: { w: "min(38%, 300px)", aspect: "0.86", radius: "22%" },
  phone: { w: "min(30%, 230px)", aspect: "0.47", radius: "14% / 7%" },
  laptop: { w: "min(80%, 640px)", aspect: "1.6", radius: "3%" },
} as const;

/** A shimmering device silhouette shown while three.js downloads and compiles; fades once the real device draws. */
export default function DeviceSkeleton({ kind }: { kind: keyof typeof SHAPES }) {
  const done = useThreeReady();
  const s = SHAPES[kind];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: done ? 0 : 1 }}
    >
      <div className="flex w-full flex-col items-center" style={{ maxWidth: s.w }}>
        <div className="skeleton w-full" style={{ aspectRatio: s.aspect, borderRadius: s.radius }} />
        {kind === "laptop" && <div className="skeleton mt-1 h-3 w-[112%] rounded-b-lg" />}
      </div>
    </div>
  );
}
