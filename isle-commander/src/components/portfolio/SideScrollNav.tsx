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

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-4 lg:right-6 top-1/2 z-40 -translate-y-1/2 hidden lg:flex flex-col items-end gap-4"
    >
      {sections.map(({ id, label }) => {
        const active = activeId === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active ? "page" : undefined}
            className="group flex items-center gap-2"
          >
            <span
              className={`text-xs font-medium transition-all duration-200 ${
                active
                  ? "text-[var(--color-primary)] opacity-100"
                  : "text-white/40 opacity-100 group-hover:text-white/70"
              }`}
            >
              {label}
            </span>
            <span
              aria-hidden
              className={`block rounded-full border transition-all duration-200 ${
                active
                  ? "h-2.5 w-2.5 border-[var(--color-primary)] bg-[var(--color-primary)]"
                  : "h-1.5 w-1.5 border-white/40 bg-transparent group-hover:border-white/70"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
