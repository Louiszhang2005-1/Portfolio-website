"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./prototype.css";
import DeckChapter from "./DeckChapter";
import ExperienceChapter from "./ExperienceChapter";
import PhoneChapter from "./PhoneChapter";
import ProjectsChapter from "./ProjectsChapter";
import { StaticIntro, StaticSkills } from "./StaticDevices";
import WatchChapter from "./WatchChapter";
import WinsChapter from "./WinsChapter";
import { ACCENT } from "./parts";
import { CONTACT, OpenTo, btnGhostDark, btnPrimaryDark, useWebGL } from "./stage";

/** single shared WebGL canvas for every 3D device; client-only */
const ThreeRoot = dynamic(() => import("./three/ThreeRoot"), { ssr: false });

/** Each chapter scrolls on its own track; the bar names them by content and shows progress through the current one. */
const chapters = [
  { label: "Intro", id: "chapter-intro" },
  { label: "Portfolio", id: "chapter-deck" },
  { label: "Skills", id: "chapter-skills" },
  { label: "Experience", id: "chapter-experience" },
  { label: "Wins", id: "chapter-wins" },
  { label: "Projects", id: "chapter-projects" },
];

function useChapterPosition() {
  const [state, setState] = useState({ active: 0, progress: 0, light: false });
  useEffect(() => {
    const onScroll = () => {
      const probe = window.innerHeight * 0.3;
      let active = 0;
      chapters.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= probe) active = i;
      });
      const el = document.getElementById(chapters[active].id);
      const rect = el?.getBoundingClientRect();
      const span = rect ? Math.max(1, rect.height - window.innerHeight) : 1;
      const progress = rect ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      setState({ active, progress, light: el?.dataset.theme === "light" });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return state;
}

function ChapterNav() {
  const { active, progress, light } = useChapterPosition();
  const navRef = useRef<HTMLElement>(null);
  // on narrow screens the pill row scrolls; keep the current chapter visible in it
  useEffect(() => {
    const el = navRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);
  const fg = light ? "var(--text-on-light)" : "var(--text)";
  const muted = light ? "var(--text-on-light-secondary)" : "var(--text-secondary)";

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-colors duration-300"
      // solid frosted bar: a fade-to-transparent let page text show through behind the nav links
      style={{
        background: light ? "rgba(var(--bg-light-rgb),.88)" : "rgba(var(--bg-rgb),.85)",
        borderColor: light ? "var(--border-light)" : "var(--border)",
      }}
    >
      {/* first tab stop: the projects are what most visitors came for */}
      <a
        href="#chapter-projects"
        className="sr-only left-3 top-3 z-50 rounded-full bg-[var(--text)] text-[13px] font-medium text-[var(--bg)] focus:not-sr-only focus:fixed focus:px-4 focus:py-2"
      >
        Skip to projects
      </a>
      {/* progress through the current chapter */}
      <div className="h-[2px] origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${progress})` }} />
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-sm font-medium" style={{ color: fg }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
          {/* on phones the dot alone is the home link, leaving room for the chapters and Contact */}
          <span className="sr-only sm:not-sr-only">Louis Zhang</span>
        </Link>
        <nav ref={navRef} aria-label="Chapters" className="-mr-1 flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-20px),transparent)] max-md:px-2">
          {chapters.map((c, i) => {
            const on = i === active;
            // plain anchors: deep-linkable, work without JS; html scroll-behavior keeps the glide
            return (
              <a
                key={c.id}
                href={`#${c.id}`}
                aria-current={on ? "location" : undefined}
                className="inline-flex min-h-[40px] shrink-0 items-center rounded-full px-2.5 text-[13px] font-medium transition-colors sm:min-h-[34px] sm:px-3.5"
                style={on ? { background: fg, color: light ? "var(--bg-light)" : "var(--bg)" } : { color: muted }}
              >
                {c.label}
              </a>
            );
          })}
        </nav>
        {/* recruiters shouldn't have to scroll to the end to reach me */}
        <a
          href="#contact"
          className="inline-flex min-h-[34px] shrink-0 items-center rounded-full bg-[var(--accent)] px-3 text-[13px] font-semibold text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)] sm:px-4"
        >
          Contact
        </a>
      </div>
    </header>
  );
}

function ContactFooter() {
  return (
    <footer id="contact" data-theme="light" className="white relative border-t border-[var(--border)] px-6 pb-16 pt-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-[clamp(2.5rem,6vw,5rem)]">Let&apos;s build the next one.</h2>
        <p className="mt-5 max-w-xl text-lg text-[var(--text-secondary)]">
          Mechanical design, manufacturing engineering, mechatronics and robotics, from consumer hardware to batteries and aerospace.
        </p>
        <OpenTo className="mt-5" />
        <div className="mt-8 flex flex-wrap gap-3">
          <a className={btnPrimaryDark} href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          <a className={btnGhostDark} href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className={btnGhostDark} href={CONTACT.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <Link className={btnGhostDark} href="/game">
            Play the game version
          </Link>
        </div>
        <p className="mt-24 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-tertiary)]">
          Louis Zhang · Mechanical engineering, Polytechnique Montréal
        </p>
      </div>
    </footer>
  );
}

export default function DeviceEcosystem() {
  // reduced motion or no WebGL: static layouts with the CSS device drawings
  const webgl = useWebGL();
  const reduced = useReducedMotion() || !webgl;
  return (
    <main className="proto min-h-screen overflow-x-clip">
      <span data-token-source className="on-dark hidden" />
      <ChapterNav />
      {!reduced && <ThreeRoot />}
      {reduced ? <StaticIntro id="chapter-intro" /> : <WatchChapter id="chapter-intro" />}
      <DeckChapter id="chapter-deck" />
      {reduced ? <StaticSkills id="chapter-skills" /> : <PhoneChapter id="chapter-skills" />}
      <ExperienceChapter id="chapter-experience" />
      <WinsChapter id="chapter-wins" />
      <ProjectsChapter id="chapter-projects" />
      <ContactFooter />
    </main>
  );
}
