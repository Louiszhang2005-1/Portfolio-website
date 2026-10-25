"use client";

import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { internships, type PortfolioItem } from "@/lib/portfolio";
import { useMap } from "./devices";
import { useHiddenBelow, useWebGL, useSmoothProgress } from "./stage";

const Laptop3D = dynamic(() => import("./three/Laptop3D"), { ssr: false });

/** Most recent first (internships are already sorted that way). */
const jobs = internships.filter((i) => i.status === "active");

const T = { lid: [0.02, 0.2], screen: [0.16, 0.22], windows: 0.24 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const paragraphs = (s: string) => s.split(/\n\n+/).slice(0, 3);

function RoleDetails({ job, index }: { job: PortfolioItem; index: number }) {
  return (
    <>
      <div className="flex items-center gap-4">
        {job.image && (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-light)] bg-[var(--surface-light)]">
            <img src={job.image} alt={job.title} className="h-full w-full object-contain" />
          </span>
        )}
        <div>
          <h3 className="text-2xl text-[var(--text-on-light)]">{job.title}</h3>
          <p className="text-[15px] text-[var(--text-on-light-secondary)]">{job.subtitle}</p>
          <p className="mt-1 font-mono text-xs tabular-nums text-[var(--text-on-light-secondary)]">
            {job.date}
            <span className="ml-3 opacity-60">
              {index + 1} of {jobs.length}
            </span>
          </p>
        </div>
      </div>
      {/* extra paragraphs only on tall windows (.more-paras), so the pinned screen never overflows */}
      <div className="more-paras mt-4 max-w-[34rem] space-y-3 text-[15px] leading-[1.6] text-[var(--text-on-light-secondary)]">
        {paragraphs(job.details).map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {job.skills.map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>
    </>
  );
}

/** Reduced motion: no pinned hinge, roles as a plain list. */
function StaticRoles({ id }: { id: string }) {
  return (
    <section id={id} data-theme="light" className="light px-6 md:px-10 xl:px-16 py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)]">Where I&apos;ve worked.</h2>
        <div className="mt-12 space-y-14">
          {jobs.map((job, i) => (
            <article key={job.id}>
              <RoleDetails job={job} index={i} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ExperienceChapter({ id }: { id: string }) {
  const webgl = useWebGL();
  const reduced = useReducedMotion() || !webgl;
  return reduced ? <StaticRoles id={id} /> : <PinnedRoles id={id} />;
}

function PinnedRoles({ id }: { id: string }) {
  const ref = useRef<HTMLElement>(null);
  const p = useSmoothProgress(ref);
  const track = useTransform(p, (v) => clamp((v - T.windows) / (1 - T.windows), 0, 0.9999) * jobs.length);
  const [active, setActive] = useState(0);
  useMotionValueEvent(track, "change", (v) => setActive(Math.min(jobs.length - 1, Math.floor(v))));
  // the first role arrives with the lid, so the column under the heading is never left empty for long
  const detailsOpacity = useMap(p, [0, 0.05], [0, 1]);
  const detailsHidden = useHiddenBelow(detailsOpacity);
  // lid: lying on the deck (PI/2) → open, leaning slightly back
  const lid = useMap(p, T.lid, [Math.PI / 2, -0.22]);
  const screenOn = useMap(p, T.screen, [0, 1]);

  return (
    <section ref={ref} id={id} data-theme="light" className="light relative" style={{ height: `${110 + jobs.length * 60}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-14">
        <div className="relative mx-auto grid w-full max-w-[1480px] grid-cols-[minmax(0,1fr)] items-center gap-6 px-6 md:px-10 xl:px-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-8 lg:gap-10">
          <div className="relative order-2 md:order-1">
            <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] text-[var(--text-on-light)]">Where I&apos;ve worked.</h2>
            {/* every role sits in the same grid cell, so the block is always as tall as the longest role: the heading
                and laptop never shift when the company changes, and the swap is instant (no blank frame between roles) */}
            <motion.div
              style={{ opacity: detailsOpacity }}
              aria-hidden={detailsHidden || undefined}
              inert={detailsHidden}
              className="relative mt-5 grid md:mt-7"
            >
              {jobs.map((j, i) => {
                const on = i === active;
                return (
                  <motion.div
                    key={j.id}
                    aria-hidden={!on || undefined}
                    inert={!on}
                    className="[grid-area:1/1]"
                    style={{ visibility: on ? "visible" : "hidden" }}
                    initial={false}
                    animate={on ? { opacity: [0.35, 1], y: [6, 0] } : { opacity: 0, y: 0 }}
                    transition={{ duration: on ? 0.22 : 0 }}
                  >
                    <RoleDetails job={j} index={i} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
          <div className="order-1 h-[220px] min-w-0 sm:h-[300px] md:order-2 md:h-[min(620px,calc(100vh-150px))]">
            <Laptop3D jobs={jobs} lid={lid} screenOn={screenOn} track={track} />
          </div>
        </div>
      </div>
    </section>
  );
}
