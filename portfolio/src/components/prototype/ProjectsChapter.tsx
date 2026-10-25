"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { GROUPS, allProjects, type Group } from "./projectData";
import { Detail, Filters, Rail, Showcase, filterList, type Filter } from "./ProjectsParts";

/** Projects step inside this window of the chapter's own scroll track. */
const STEP = [0.05, 0.97];
/** Scroll length per project, so a filtered list gets a shorter track rather than coarse steps. */
const VH_PER_PROJECT = 32;

export default function ProjectsChapter({ id }: { id: string }) {
  const reduced = useReducedMotion();
  return reduced ? <StaticProjects id={id} /> : <PinnedProjects id={id} />;
}

/** Reduced motion: every project grouped in a plain list. */
function StaticProjects({ id }: { id: string }) {
  return (
    <section id={id} data-theme="light" className="light border-t border-[var(--border-light)] px-6 md:px-10 xl:px-16 py-28">
      <div className="mx-auto max-w-[1352px]">
        <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)]">Projects.</h2>
        {GROUPS.map((g: Group) => (
          <div key={g} className="mt-16">
            <h3 className="text-2xl">{g}</h3>
            <div className="mt-8 space-y-14">
              {filterList(g).map((item) => (
                <article key={item.id} className="grid gap-8 lg:grid-cols-2">
                  <Detail item={item} />
                  <Showcase item={item} />
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PinnedProjects({ id }: { id: string }) {
  const ref = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const list = filterList(filter);
  const n = list.length;
  // the track is sized by the filtered list, so raw progress maps straight onto it
  const indexAt = (v: number) => Math.floor(Math.min(0.9999, Math.max(0, (v - STEP[0]) / (STEP[1] - STEP[0]))) * n);
  // state holds a coarse index only, so scrolling re-renders once per project, not once per frame
  const [scrolled, setScrolled] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setScrolled(indexAt(v)));
  const active = Math.min(n - 1, scrolled);
  const item = list[active];

  /** Page offset that centres project i inside its slice of the step window. */
  const topFor = (i: number) => {
    const el = ref.current;
    if (!el) return null;
    const at = STEP[0] + ((i + 0.5) / n) * (STEP[1] - STEP[0]);
    return el.getBoundingClientRect().top + window.scrollY + at * (el.offsetHeight - window.innerHeight);
  };
  const pick = (i: number) => {
    const top = topFor(i);
    if (top !== null) window.scrollTo({ top, behavior: "smooth" });
  };

  // a filter change resizes the track; if pinned, land on the new list's first project instead of past the section
  const resetOnFilter = useRef(false);
  const changeFilter = (f: Filter) => {
    if (f === filter) return;
    const r = ref.current?.getBoundingClientRect();
    resetOnFilter.current = Boolean(r && r.top <= 0 && r.bottom >= window.innerHeight);
    setScrolled(0);
    setFilter(f);
  };
  useLayoutEffect(() => {
    if (!resetOnFilter.current) return;
    resetOnFilter.current = false;
    const top = topFor(0);
    if (top !== null) window.scrollTo({ top, behavior: "instant" });
    // topFor reads the new height from the DOM; filter is the only trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <section ref={ref} id={id} data-theme="light" className="light relative border-t border-[var(--border-light)]" style={{ height: `${100 + n * VH_PER_PROJECT}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-start overflow-hidden pb-4 pt-[72px] md:justify-center">
        <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-end justify-between gap-3 px-6 md:px-10 xl:px-16">
          <h2 className="text-[clamp(2rem,4.5vw,3.75rem)]">Projects.</h2>
          <Filters value={filter} onChange={changeFilter} />
        </div>
        <div className="mx-auto mt-4 grid w-full max-w-[1480px] grid-cols-[minmax(0,1fr)] items-center gap-4 px-6 md:px-10 xl:px-16 md:mt-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8 lg:gap-12">
          {/* every project's copy is stacked in one grid cell, so the block is always as tall as the tallest one
              and the rail below never moves when the project changes */}
          <div className="relative order-2 grid md:order-1">
            {allProjects.map((p) => {
              const on = p.id === item.id;
              return (
                <div
                  key={p.id}
                  inert={!on}
                  aria-hidden={!on}
                  className={`[grid-area:1/1] transition-[opacity,transform,visibility] ${on ? "visible translate-y-0 opacity-100 delay-150 duration-300" : "invisible translate-y-3 opacity-0 duration-150"}`}
                >
                  <Detail item={p} />
                </div>
              );
            })}
          </div>
          <div className="order-1 mx-auto w-full max-w-[420px] md:order-2 md:max-w-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Showcase item={item} eager />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mx-auto mt-4 w-full max-w-[1480px] px-6 md:px-10 xl:px-16 md:mt-6">
          <Rail list={list} active={active} onPick={pick} />
        </div>
      </div>
    </section>
  );
}
