"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useMap, type Motion } from "./devices";
import { AVAILABILITY, BeatCopy, CONTACT, DeviceStage, btnGhostDark, btnPrimaryDark, withPads, useSmoothProgress } from "./stage";

const Watch3D = dynamic(() => import("./three/Watch3D"), { ssr: false });

/** Shares of this chapter's own scroll track. */
const T = {
  hero: [0, 0.3],
  notif: [0.06, 0.14, 0.3, 0.36],
  tilt: [0.36, 0.5],
  spread: [0.42, 0.82],
};

const beats = withPads([
  {
    start: 0,
    end: 0.34,
    title: "Louis Zhang",
    body: "Mechanical engineering student at Polytechnique Montréal. I design hardware and write the software that runs on it.",
    note: "Interned at Tesla, Lockheed Martin and the City of Montréal. Hackathon winner at HackHarvard 2026, ConUHacks X and RoboHacks 2025.",
    status: AVAILABILITY,
    actions: (
      <>
        <a className={btnPrimaryDark} href="#chapter-deck">
          See the portfolio
        </a>
        <a className={btnGhostDark} href={`mailto:${CONTACT.email}`}>
          Email me
        </a>
      </>
    ),
  },
  {
    start: 0.46,
    end: 1,
    title: "Every product is an assembly.",
    body: "Band, sensors, cell, board, case, glass: each layer is its own engineering problem.",
  },
]);

export default function WatchChapter({ id }: { id: string }) {
  const ref = useRef<HTMLElement>(null);
  const p = useSmoothProgress(ref);
  const one = useMotionValue(1);
  const zero = useMotionValue(0);
  const tilt = useMap(p, T.tilt, [0, 1]);
  const m: Motion = { spread: useMap(p, T.spread, [0, 1]), fade: one, tilt, dive: zero };
  const notif = useMap(p, T.notif, [0, 1, 1, 0]);
  const hero = useMap(p, T.hero, [1.12, 1]);
  const shadow = useTransform(tilt, (t) => 0.55 - t * 0.3);
  const cue = useMap(p, [0, 0.05], [1, 0]);

  return (
    <section ref={ref} id={id} data-theme="light" className="white relative h-[180vh]">
      <DeviceStage
        shadow={shadow}
        overlay={
          <motion.div
            style={{ opacity: cue }}
            className="pointer-events-none absolute inset-x-0 bottom-6 hidden flex-col items-center gap-2 text-xs text-[var(--text-tertiary)] lg:flex"
          >
            Scroll to take it apart
            <span className="h-8 w-px bg-gradient-to-b from-[var(--text-tertiary)] to-transparent" />
          </motion.div>
        }
        copy={beats.map((b, i) => (
          <BeatCopy key={b.title} progress={p} beat={b} hero={i === 0} />
        ))}
        device={
          <Watch3D m={m} notif={notif} hero={hero} />
        }
      />
    </section>
  );
}
