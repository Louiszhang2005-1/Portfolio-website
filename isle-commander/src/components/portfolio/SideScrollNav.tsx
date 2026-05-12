"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "about", label: "Story" },
  { id: "portfolio-deck", label: "Deck" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "game-portal", label: "Game" },
  { id: "contact", label: "Contact" },
];

const sectionTones: Record<string, "light" | "dark"> = {
  about: "dark",
  "portfolio-deck": "light",
  experience: "light",
  projects: "dark",
  "game-portal": "dark",
  contact: "light",
};

export default function SideScrollNav() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const isDark = (sectionTones[activeId] ?? "dark") === "dark";

  return (
    <nav
      aria-label="Section navigation"
      className={`fixed right-4 lg:right-6 top-1/2 z-40 -translate-y-1/2 hidden lg:flex flex-col items-end gap-3.5 rounded-2xl px-4 py-4 backdrop-blur-md transition-colors duration-300 ${
        isDark ? "bg-black/25" : "bg-white/60 shadow-sm"
      }`}
    >
      {sections.map(({ id, label }) => {
        const active = activeId === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active ? "page" : undefined}
            className="group flex items-center gap-2 py-1"
          >
            <span
              className={`text-sm font-medium transition-all duration-200 ${
                active
                  ? `font-semibold ${isDark ? "text-[var(--color-primary-fixed)]" : "text-[var(--color-primary)]"}`
                  : isDark
                  ? "text-white/55 group-hover:text-white/85"
                  : "text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)]"
              }`}
            >
              {label}
            </span>
            <span
              aria-hidden
              className={`block flex-shrink-0 rounded-full transition-all duration-200 ${
                active
                  ? `h-3 w-3 ${isDark ? "bg-[var(--color-primary-fixed)] border-[var(--color-primary-fixed)]" : "bg-[var(--color-primary)] border-[var(--color-primary)]"} border-2`
                  : `h-2 w-2 border-2 bg-transparent ${isDark ? "border-white/45 group-hover:border-white/75" : "border-[var(--color-on-surface-variant)] group-hover:border-[var(--color-on-surface)]"}`
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
