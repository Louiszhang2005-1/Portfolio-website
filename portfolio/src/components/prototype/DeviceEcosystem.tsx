"use client";

import { useReducedMotion } from "framer-motion";
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
import { CONTACT, OpenTo, useWebGL } from "./stage";

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
