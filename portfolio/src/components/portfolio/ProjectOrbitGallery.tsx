"use client";

import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import type { PortfolioItem } from "@/lib/portfolio";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1200' viewBox='0 0 900 1200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%2307131a'/%3E%3Cstop offset='0.52' stop-color='%23114d54'/%3E%3Cstop offset='1' stop-color='%23f4d58a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='1200' fill='url(%23g)'/%3E%3Cpath d='M120 760C265 505 545 420 785 265' stroke='rgba(255,255,255,.45)' stroke-width='18' fill='none'/%3E%3Ccircle cx='265' cy='640' r='72' fill='rgba(255,255,255,.2)'/%3E%3Ccircle cx='560' cy='430' r='118' fill='rgba(255,255,255,.13)'/%3E%3C/svg%3E";

export default function ProjectOrbitGallery({ projects }: { projects: PortfolioItem[] }) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const step = projects.length ? 360 / projects.length : 45;

  const galleryItems: GalleryItem[] = projects.map((project) => ({
    id: project.slug,
    common: project.title,
    binomial: project.displaySector,
    href: `/portfolio/${project.slug}`,
    accent: project.accent,
    photo: {
      url: project.image ?? project.gallery[0] ?? fallbackImage,
      text: project.title,
      pos: project.id === "P-5" ? "left center" : "center",
      by: project.metrics[0] ?? "Open case study",
    },
  }));

  return (
    <section id="projects" className="relative min-h-screen overflow-hidden bg-[#071015] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,#071015,#0c1410_65%,#071015)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
          <div className="z-10 max-w-3xl text-center">
            <div className="mb-4 text-xs font-label uppercase tracking-widest text-cyan-100/70">
              Project Orbit
            </div>
            <h2 className="font-headline text-4xl font-extrabold leading-tight sm:text-6xl">
              Scroll through the build archive.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/58">
              Each rotating panel opens a dedicated case-study page with the full brief, visuals, documents, and links.
            </p>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20 bg-cyan-100/5 shadow-[0_0_90px_rgba(34,211,238,0.22)]" />
          <div className="h-[620px] w-full max-w-[1200px]">
            <CircularGallery items={galleryItems} radius={430} autoRotateSpeed={0.01} rotationOffset={rotationOffset} />
          </div>

          <div className="z-20 mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => setRotationOffset((value) => value + step)}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/16 bg-white/10 text-white transition hover:bg-white hover:text-[#071015]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <a
              href="#game-portal"
              className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-bold text-white/78 transition hover:bg-white hover:text-[#071015]"
            >
              Game preview
            </a>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => setRotationOffset((value) => value - step)}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/16 bg-white/10 text-white transition hover:bg-white hover:text-[#071015]"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
      </div>
    </section>
  );
}
