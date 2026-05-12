"use client";

import { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { fullPortfolioDocument, fullPortfolioPages } from "@/lib/portfolio";

export default function FullPortfolioDeck() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section id="portfolio-deck" className="border-y border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
              <FileText className="h-4 w-4" />
              Full Portfolio
            </div>
            <h2 className="font-headline text-3xl font-extrabold leading-tight text-[var(--color-on-surface)] sm:text-4xl">
              The complete 7-page deck.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scroll(-1)}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--color-outline-variant)] bg-white shadow-sm text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:shadow"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scroll(1)}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--color-outline-variant)] bg-white shadow-sm text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:shadow"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <a
              href={fullPortfolioDocument.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Open PDF
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="relative -mx-6">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 [scrollbar-width:thin]"
          >
            {fullPortfolioPages.map((src, index) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-[78vw] shrink-0 snap-start sm:w-[260px] cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <img
                    src={src}
                    alt={`Portfolio page ${index + 1}`}
                    className="aspect-[8.5/11] w-full object-cover object-top"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--color-surface-container-low)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
