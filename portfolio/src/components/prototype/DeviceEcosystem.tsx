"use client";

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
import Loader from "./Loader";
import { CONTACT, OpenTo, useWebGL, useReducedMotionSafe } from "./stage";

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

/**
 * Current chapter for the bar. Measured once per frame, and React only hears about it when the chapter or theme
 * changes; the progress hairline is written straight to the DOM. Re-rendering the frosted bar on every scroll event
 * made it stutter on phones, worst in Projects where the page is already swapping a project per step.
 */
function useChapterPosition() {
  const bar = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ active: 0, light: false });
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
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
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      const light = el?.dataset.theme === "light";
      setState((s) => (s.active === active && s.light === light ? s : { active, light }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return { ...state, bar };
}

function ChapterNav() {
  const { active, light, bar } = useChapterPosition();
  const atContact = active === chapters.length;
  const fg = light ? "var(--text-on-light)" : "var(--text)";
  const muted = light ? "var(--text-on-light-secondary)" : "var(--text-secondary)";
  const current = chapters[active]?.label ?? (atContact ? "Contact" : "");
  // phones: the current chapter name opens a small menu of every chapter
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    // tap outside the bar closes it (a fixed overlay can't be used: the bar's backdrop-filter contains it)
    const onTap = (e: PointerEvent) => !(e.target as Element).closest("header") && close();
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onTap);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onTap);
      window.removeEventListener("scroll", close);
    };
  }, [menu]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300"
      // solid frosted bar: a fade-to-transparent let page text show through behind the nav links
      style={{
        background: light ? "rgba(var(--bg-light-rgb),.82)" : "rgba(var(--bg-rgb),.8)",
        borderColor: light ? "var(--border-light)" : "var(--border)",
      }}
    >
      {/* first tab stop: the projects are what most visitors came for */}
      <a
        href="#chapter-projects"
        className="sr-only left-3 top-3 z-50 rounded-md bg-[var(--text)] text-[13px] font-medium text-[var(--bg)] focus:not-sr-only focus:fixed focus:px-4 focus:py-2"
      >
        Skip to projects
      </a>
      {/* quiet typographic bar: wordmark, text links, a hairline under the current chapter; no pills */}
      <div className="mx-auto grid h-12 max-w-[1480px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-10 xl:px-16">
        <Link href="/" className="wide justify-self-start whitespace-nowrap text-[15px] tracking-tight" style={{ color: fg }}>
          Louis Zhang
        </Link>
        <nav aria-label="Chapters" className="hidden h-full items-stretch md:flex">
          {chapters.map((c, i) => {
            const on = i === active;
            // plain anchors: deep-linkable, work without JS; html scroll-behavior keeps the glide
            return (
              <a
                key={c.id}
                href={`#${c.id}`}
                aria-current={on ? "location" : undefined}
                className="relative flex items-center px-3.5 text-[13px] transition-colors duration-200 hover:!text-[var(--text)]"
                style={{ color: on ? fg : muted }}
              >
                {c.label}
                <span
                  aria-hidden
                  className="absolute inset-x-3.5 -bottom-px h-px origin-center transition-transform duration-300"
                  style={{ background: fg, transform: `scaleX(${on ? 1 : 0})` }}
                />
              </a>
            );
          })}
        </nav>
        {/* phones: the bar names where you are; tapping it opens the chapter menu */}
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-controls="chapter-menu"
          aria-label={`Sections, currently ${current}`}
          className="flex min-h-[44px] items-center gap-1.5 px-2 text-[13px] md:hidden"
          style={{ color: menu ? fg : muted }}
        >
          {current}
          <svg aria-hidden width="10" height="6" viewBox="0 0 10 6" className="transition-transform duration-200" style={{ transform: menu ? "rotate(180deg)" : undefined }}>
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* recruiters shouldn't have to scroll to the end to reach me */}
        <a
          href="#contact"
          aria-current={atContact ? "location" : undefined}
          // phones: once the middle already reads "Contact", a second one beside it is noise
          className={`group justify-self-end whitespace-nowrap text-[13px] font-medium ${atContact ? "max-md:invisible" : ""}`}
          style={{ color: fg }}
        >
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]" style={atContact ? { backgroundSize: "100% 1px" } : undefined}>
            Contact
          </span>
          <span aria-hidden className="ml-1 inline-block text-[var(--accent-on-light)] transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </div>
      {menu && (
        <>
          <nav
            id="chapter-menu"
            aria-label="Sections"
            // solid, not frosted: a backdrop-filter nested in the bar's own doesn't blur, so the page showed through
            className="absolute inset-x-0 top-full border-b shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)] md:hidden"
            style={{ background: light ? "var(--bg-light)" : "var(--bg)", borderColor: light ? "var(--border-light)" : "var(--border)" }}
          >
            <ul className="px-5 py-2">
              {[...chapters, { id: CONTACT_ID, label: "Contact" }].map((c, i) => {
                const on = i === active;
                return (
                  <li key={c.id} className="border-b last:border-b-0" style={{ borderColor: light ? "var(--border-light)" : "var(--border)" }}>
                    <a
                      href={`#${c.id}`}
                      onClick={() => setMenu(false)}
                      aria-current={on ? "location" : undefined}
                      className="flex min-h-[48px] items-center justify-between text-[15px]"
                      style={{ color: on ? fg : muted, fontWeight: on ? 500 : 400 }}
                    >
                      {c.label}
                      {on && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
      {/* progress through the current chapter: a hairline, not a stripe */}
      <div ref={bar} className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-[var(--accent)] opacity-70" style={{ transform: "scaleX(0)" }} />
    </header>
  );
}

/** Right column of the footer: a recap of facts already on the page, plus jump links back to each chapter. */
const RECAP: [string, string][] = [
  ["Studying", "B.Eng. Mechanical Engineering, Polytechnique Montréal"],
  ["Leadership", "VP Events, Google Developer Group Polytechnique"],
  ["Interned at", "Tesla, Lockheed Martin, City of Montréal"],
  ["Hackathon wins", "HackHarvard 2026, ConUHacks X, RoboHacks 2025"],
  ["Speaking and judging", "Guest speaker at SCS Concordia; judge at MPC Hacks and Hack Découverte"],
];

/** Brand marks (Simple Icons paths, 24×24). */
const SOCIAL = [
  {
    label: "LinkedIn",
    href: CONTACT.linkedin,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "GitHub",
    href: CONTACT.github,
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3.99.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
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
      <div className="mx-auto grid max-w-[1352px] grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <h2 className="max-w-3xl text-[clamp(2.5rem,6vw,5rem)]">Let&apos;s build the next one.</h2>
          <p className="mt-5 max-w-xl text-lg text-[var(--text-secondary)]">
            Mechanical design, manufacturing engineering, mechatronics and robotics, from consumer hardware to batteries and aerospace.
          </p>
          <OpenTo className="mt-6" />
          {/* typographic contact: the address itself is the call to action, no button chrome */}
          <a href={`mailto:${CONTACT.email}`} className="group mt-10 flex w-fit max-w-full items-baseline gap-3 text-[var(--text)]">
            <span className="wide truncate bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 text-[clamp(1.5rem,3.4vw,2.6rem)] leading-tight transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
              {CONTACT.email}
            </span>
            <span aria-hidden className="text-[clamp(1.25rem,2.6vw,2rem)] text-[var(--accent-on-light)] transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          {/* the marks themselves are the links: recognisable at a glance, quieter than a row of labelled buttons */}
          <ul className="mt-8 flex flex-wrap items-center gap-3 text-[15px] font-medium">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} (opens in a new tab)`}
                  title={s.label}
                  className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--border)] text-[var(--text)] transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg-light)]"
                >
                  <svg aria-hidden viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
            <li className="ml-4">
              <a href="/game" className="group inline-flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]">
                Game version
                <span aria-hidden className="text-[var(--accent-on-light)] transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </li>
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
  const reduced = useReducedMotionSafe() || !webgl;
  return (
    <main className="proto min-h-screen overflow-x-clip">
      <span data-token-source className="on-dark hidden" />
      <Loader static={reduced} />
      <ChapterNav />
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
