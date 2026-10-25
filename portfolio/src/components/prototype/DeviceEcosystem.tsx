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
import { CONTACT, OpenTo, useWebGL } from "./stage";

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
/** The footer is tracked too (it lights the Contact button), so "Projects" does not stay lit at the end. */
const CONTACT_ID = "contact";
const tracked = [...chapters.map((c) => c.id), CONTACT_ID];

function useChapterPosition() {
  const [state, setState] = useState({ active: 0, progress: 0, light: false });
  useEffect(() => {
    const onScroll = () => {
      // a section is current once its top crosses the middle of the viewport, i.e. once it fills most of the view
      const probe = window.innerHeight * 0.5;
      let active = 0;
      tracked.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) active = i;
      });
      const el = document.getElementById(tracked[active]);
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
  const atContact = active === chapters.length;
  // on narrow screens the pill row scrolls: centre the current pill in it (clear of the edge fades). Sets the row's
  // own scrollLeft, since scrollIntoView could also scroll the page vertically.
  useEffect(() => {
    const nav = navRef.current;
    const el = nav?.children[active] as HTMLElement | undefined;
    if (!nav || !el || nav.scrollWidth <= nav.clientWidth) return;
    const left = el.offsetLeft - nav.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
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
          aria-current={atContact ? "location" : undefined}
          className="inline-flex min-h-[34px] shrink-0 items-center rounded-full bg-[var(--accent)] px-3 text-[13px] font-semibold text-[var(--accent-ink)] transition-[background-color,box-shadow] hover:bg-[var(--accent-hover)] sm:px-4"
          // at the footer the Contact button is the current location: ring it in the bar's text colour
          style={atContact ? { boxShadow: `0 0 0 2px ${light ? "var(--bg-light)" : "var(--bg)"}, 0 0 0 4px ${fg}` } : undefined}
        >
          Contact
        </a>
      </div>
    </header>
  );
}

/** Right column of the footer: a recap of facts already on the page, plus jump links back to each chapter. */
const RECAP: [string, string][] = [
  ["Studying", "Mechanical engineering, Polytechnique Montréal"],
  ["Interned at", "Tesla, Lockheed Martin, City of Montréal"],
  ["Hackathons", "HackHarvard 2026, ConUHacks X, RoboHacks 2025"],
];

function FooterRecap() {
  return (
    <div className="lg:border-l lg:border-[var(--border)] lg:pl-12">
      <dl className="space-y-5">
        {RECAP.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-[var(--text-tertiary)]">{k}</dt>
            <dd className="mt-1 text-[17px] text-[var(--text)]">{v}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="Back to a chapter" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
        {chapters.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline">
            {c.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function ContactFooter() {
  return (
    <footer id={CONTACT_ID} data-theme="light" className="white relative border-t border-[var(--border)] px-6 md:px-10 xl:px-16 pb-16 pt-32">
      <div className="mx-auto grid max-w-[1352px] gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <h2 className="max-w-3xl text-[clamp(2.5rem,6vw,5rem)]">Let&apos;s build the next one.</h2>
          <p className="mt-5 max-w-xl text-lg text-[var(--text-secondary)]">
            Mechanical design, manufacturing engineering, mechatronics and robotics, from consumer hardware to batteries and aerospace.
          </p>
          <OpenTo className="mt-6" />
          {/* typographic contact: the address itself is the call to action, no button chrome */}
          <a href={`mailto:${CONTACT.email}`} className="group mt-10 inline-flex max-w-full items-baseline gap-3 text-[var(--text)]">
            <span className="wide truncate bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 text-[clamp(1.5rem,3.4vw,2.6rem)] leading-tight transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
              {CONTACT.email}
            </span>
            <span aria-hidden className="text-[clamp(1.25rem,2.6vw,2rem)] text-[var(--accent-on-light)] transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <ul className="mt-8 flex flex-wrap gap-x-9 gap-y-3 text-[15px] font-medium">
            {[
              { label: "LinkedIn", href: CONTACT.linkedin, external: true },
              { label: "GitHub", href: CONTACT.github, external: true },
              { label: "Game version", href: "/game", external: false },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group inline-flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                >
                  {l.label}
                  <span aria-hidden className="text-[var(--accent-on-light)] transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px">
                    {l.external ? "↗" : "→"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <FooterRecap />
        <p className="mt-10 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-tertiary)] lg:col-span-2 lg:mt-8">
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
