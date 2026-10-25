"use client";

import { useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { fullPortfolioDocument, fullPortfolioPages } from "@/lib/portfolio";
import { useMap } from "./devices";
import BookDeck, { PH, PW, SPREADS } from "./BookDeck";
import { Fit, btnGhostLight, btnPrimaryLight, useSmoothProgress } from "./stage";

const PAGE_TITLES = [
  "Profile and skills",
  "Lunar transport system",
  "Predictive simulation and analysis",
  "Mechatronics and fabrication",
  "Nursie, AI nurse assistant",
  "Nursie, alert pipeline and outcomes",
  "Autonomous reforestation robot",
];

/** Pages flip inside this window of the chapter's own scroll track. */
const PAGES = [0.08, 0.96];

function PageList({ active, onPick }: { active: number[]; onPick: (i: number) => void }) {
  return (
    <ol className="mt-8 space-y-0.5">
      {PAGE_TITLES.map((t, i) => {
        const on = active.includes(i);
        return (
          <li key={t}>
            <button
              onClick={() => onPick(i)}
              aria-current={on}
              className="flex min-h-[36px] w-full max-w-[26rem] items-center gap-4 rounded-lg px-3 text-left text-[15px] transition-colors hover:bg-[var(--surface-light)]"
              style={{
                color: on ? "var(--text-on-light)" : "var(--text-on-light-secondary)",
                background: on ? "var(--surface-light)" : undefined,
              }}
            >
              <span className="w-5 font-mono text-xs tabular-nums" style={{ color: on ? "var(--accent-on-light)" : undefined }}>
                {i + 1}
              </span>
              <span className={on ? "font-medium" : undefined}>{t}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Intro() {
  return (
    <>
      <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] text-[var(--text-on-light)]">The portfolio, in seven pages.</h2>
      <p className="mt-4 max-w-[30rem] text-[1.0625rem] leading-[1.55] text-[var(--text-on-light-secondary)]">
        My full portfolio as a PDF: lunar transport, simulation, mechatronics, Nursie and the reforestation robot.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className={btnPrimaryLight} href={fullPortfolioDocument.href} target="_blank" rel="noopener noreferrer">
          Open the PDF
        </a>
        <a className={btnGhostLight} href={fullPortfolioDocument.href} download>
          Download
        </a>
      </div>
    </>
  );
}

export default function DeckChapter({ id }: { id: string }) {
  const reduced = useReducedMotion();
  return reduced ? <StaticDeck id={id} /> : <PinnedDeck id={id} />;
}

function StaticDeck({ id }: { id: string }) {
  return (
    <section id={id} data-theme="light" className="light px-6 md:px-10 xl:px-16 py-28">
      <div className="mx-auto max-w-[1480px]">
        <Intro />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {fullPortfolioPages.map((src, i) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)]">
              <img src={src} alt={`Portfolio page ${i + 1}: ${PAGE_TITLES[i]}`} loading="lazy" decoding="async" className="aspect-[8.5/11] w-full object-contain" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pages visible on spread `s`: cover alone, then [1|2], [3|4], [5|6], [7]. */
const pagesOn = (s: number) => (s < 1 ? [] : [2 * s - 2, 2 * s - 1].filter((i) => i < fullPortfolioPages.length));

function PinnedDeck({ id }: { id: string }) {
  const ref = useRef<HTMLElement>(null);
  const p = useSmoothProgress(ref);
  const flip = useMap(p, PAGES, [0, SPREADS]);
  const intro = useMap(p, [0, PAGES[0]], [0, 1]);
  const [spread, setSpread] = useState(0);
  useMotionValueEvent(flip, "change", (f) => setSpread(Math.round(f)));
  const visible = pagesOn(spread);

  const pick = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const s = Math.floor(i / 2) + 1;
    const at = PAGES[0] + (s / SPREADS) * (PAGES[1] - PAGES[0]);
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + at * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <section ref={ref} id={id} data-theme="light" className="light relative" style={{ height: `${100 + SPREADS * 45}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-14">
        <div className="relative mx-auto grid w-full max-w-[1480px] grid-cols-[minmax(0,1fr)] items-center gap-6 px-6 md:px-10 xl:px-16 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:gap-10 lg:gap-12">
          <div className="order-2 md:order-1">
            <Intro />
            <div className="tall-only hidden lg:block">
              <PageList active={visible} onPick={pick} />
            </div>
            <p className="mt-4 text-sm text-[var(--text-on-light-secondary)] lg:hidden">
              {visible.length ? `Pages ${visible.map((i) => i + 1).join(" and ")}: ${PAGE_TITLES[visible[0]]}` : "Cover"}
            </p>
          </div>
          <div className="order-1 h-[300px] min-w-0 sm:h-[400px] md:order-2 md:h-[min(620px,calc(100vh-130px))]">
            <Fit w={PW * 2 + 40} h={PH + 60} max={1.45}>
              <BookDeck flip={flip} intro={intro} spread={spread} titles={PAGE_TITLES} />
            </Fit>
          </div>
        </div>
      </div>
    </section>
  );
}
