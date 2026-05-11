import { ArrowUpRight, FileText } from "lucide-react";
import { fullPortfolioDocument, fullPortfolioPages } from "@/lib/portfolio";

export default function FullPortfolioDeck() {
  return (
    <section id="portfolio-deck" className="border-y border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-14">
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

        <div className="-mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
          {fullPortfolioPages.map((src, index) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-[min(78vw,360px)] shrink-0 snap-start"
            >
              <div className="overflow-hidden rounded-2xl border border-[var(--color-outline-variant)] bg-white p-2 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
                <img
                  src={src}
                  alt={`Full portfolio page ${index + 1}`}
                  className="aspect-[8.5/11] w-full rounded-xl object-contain"
                />
              </div>
              <div className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Page {index + 1}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
