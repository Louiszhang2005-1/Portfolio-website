"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import DeviceSkeleton from "./DeviceSkeleton";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useMap, type Motion } from "./devices";
import { BeatCopy, DeviceStage, withPads, type Beat, useSmoothProgress } from "./stage";

const Phone3D = dynamic(() => import("./three/Phone3D"), { ssr: false });

/** Shares of this chapter's own scroll track. The app icons key off `home` (devices.tsx AppIcon starts at .935). */
const T = {
  lock: [0, 0.1, 0.12],
  tilt: [0, 0.12, 0.18, 0.3, 0.36, 0.86, 0.92],
  spread: [0, 0.12, 0.26, 0.3, 0.36, 0.86, 0.92],
  screws: [0.12, 0.18],
  code: [0.33, 0.36, 0.47, 0.49],
  dive: [0.36, 0.86, 0.93],
  home: [0.93, 0.95],
};
const LAYERS = 8;
const diveAt = (r: number) => T.dive[0] + (r * (T.dive[1] - T.dive[0])) / LAYERS;

/** The dive passes two layers per discipline. Skills only: experience and projects get their own chapters. */
const disciplines: Omit<Beat, "start" | "end">[] = [
  {
    title: "Software.",
    body: "What runs on the screen.",
    tools: ["Python", "TypeScript", "React", "Next.js", "LLM agents", "SQL"],
    note: "Layers 1 and 2: cover glass and display",
  },
  {
    title: "Mechanical design.",
    body: "The structure that holds it all together.",
    tools: ["SolidWorks", "CATIA V6", "GD&T", "DFM / DFA", "FEA (Ansys)"],
    note: "Layers 3 and 4: frame and midframe",
  },
  {
    title: "Electronics.",
    body: "Boards, sensors and the firmware on them.",
    tools: ["Arduino", "ESP32", "Raspberry Pi", "ROS 2", "PLC / HMI"],
    note: "Layers 5 and 6: logic board and cell",
  },
  {
    title: "Manufacturing.",
    body: "Getting it built at volume, and fixing it when it isn't.",
    tools: ["CNC machining", "Root-cause analysis", "Equipment design"],
    note: "Layers 7 and 8: cameras and back glass",
  },
];

const beats = withPads([
  {
    start: 0,
    end: 0.12,
    title: "What I work with.",
    body: "Mechanical Engineering at Polytechnique Montréal, working across hardware and software. Here is the toolkit, layer by layer.",
  },
  {
    start: 0.15,
    end: 0.34,
    title: "Four disciplines, one device.",
    body: "Each pair of layers is a set of skills. Keep scrolling to go inside.",
  },
  // the last discipline holds through the pull-out, so the copy never blanks before "Assembled."
  ...disciplines.map((b, i) => ({
    ...b,
    start: diveAt(i * 2) + 0.006,
    end: i === disciplines.length - 1 ? 0.9 : diveAt(i * 2 + 2) - 0.006,
  })),
  {
    start: 0.93,
    end: 1,
    title: "Assembled.",
    body: "Every icon is a tool I use. Next, where I've used them.",
  },
]);

/** Depth readout while the camera is inside the phone (a spec readout, so mono + uppercase is allowed). */
function DepthHud({ dive, progress }: { dive: MotionValue<number>; progress: MotionValue<number> }) {
  const [d, setD] = useState(0);
  useMotionValueEvent(dive, "change", setD);
  const opacity = useMap(progress, [0.34, 0.36, 0.86, 0.88], [0, 1, 1, 0]);
  const layer = Math.min(LAYERS, Math.floor(d) + 1);
  return (
    // aligned to the stage's content column (same max width and gutters as DeviceStage), not the window edge
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto hidden w-full max-w-[1480px] items-center gap-4 px-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:px-10 lg:flex xl:px-16"
    >
      <span>
        Layer <span className="text-[var(--text)]">{String(layer).padStart(2, "0")}</span>/08
      </span>
      <span className="h-px w-10 bg-[var(--mat-alu-lo)]" />
      <span>
        Depth <span className="tabular-nums text-[var(--text)]">{(d * 1.04).toFixed(2)}</span> mm
      </span>
    </motion.div>
  );
}

export default function PhoneChapter({ id }: { id: string }) {
  const ref = useRef<HTMLElement>(null);
  const p = useSmoothProgress(ref);
  const one = useMotionValue(1);
  // inside the phone the stack stays slightly tilted and separated, so it reads as layers, not a flat slab
  const tilt = useMap(p, T.tilt, [0, 0, 1, 1, 0.4, 0.4, 0]);
  const dive = useMap(p, T.dive, [0, LAYERS, 0]);
  const m: Motion = { spread: useMap(p, T.spread, [0, 0, 1, 1, 0.2, 0.2, 0]), fade: one, tilt, dive };
  const shadow = useTransform(tilt, (t) => 0.55 - t * 0.35);
  // passing layers lift toward the viewer; pull the whole device back a little while inside so they stay on screen
  const diveScale = useMap(p, [0.32, 0.37, 0.85, 0.91], [1, 0.8, 0.8, 1]);
  const lockOn = useMap(p, T.lock, [1, 1, 0]);
  const homeOn = useMap(p, T.home, [0, 1]);
  const codeOn = useMap(p, T.code, [0, 1, 1, 0]);

  return (
    <section ref={ref} id={id} data-theme="light" className="white relative h-[320svh]">
      <DeviceStage
        shadow={shadow}
        copy={beats.map((b) => (
          <BeatCopy key={b.title} progress={p} beat={b} />
        ))}
        device={
          <>
            <DeviceSkeleton kind="phone" />
            <Phone3D m={m} lockOn={lockOn} homeOn={homeOn} codeOn={codeOn} progress={p} diveScale={diveScale} />
          </>
        }
        overlay={<DepthHud dive={dive} progress={p} />}
      />
    </section>
  );
}
