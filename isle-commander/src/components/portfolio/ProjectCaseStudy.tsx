"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { PortfolioItem } from "@/lib/portfolio";
import { CinematicFooter } from "@/components/ui/motion-footer";

// ── word-stagger hero headline ──────────────────────────────────────────────
function WordsPullUp({
  text,
  className = "",
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={prefersReduced ? false : { y: 22, opacity: 0 }}
          animate={prefersReduced ? {} : isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// ── scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReduced ? false : { y: 28, opacity: 0 }}
      animate={prefersReduced ? {} : isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── micro-label kicker ───────────────────────────────────────────────────────
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-label text-[0.65rem] uppercase tracking-[0.28em] text-white/40">
      {children}
    </p>
  );
}

// ── link icon ────────────────────────────────────────────────────────────────
function LinkIcon({ kind }: { kind?: string }) {
  return kind === "github"
    ? <GitBranch className="h-4 w-4 shrink-0" />
    : <ExternalLink className="h-4 w-4 shrink-0" />;
}

// ============================================================================
export default function ProjectCaseStudy({
  item,
  related,
}: {
  item: PortfolioItem;
  related: PortfolioItem[];
}) {
  const prefersReduced = useReducedMotion();

  // hero visual parallax
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroVisualRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? [0, 0] : [-18, 18]
  );

  // hero featured image
  const heroSrc =
    item.image ??
    item.gallery.find((s) => !s.includes("/portfolio-pages/full/")) ??
    (item.gallery.length ? item.gallery[0] : null);

  const hasPortfolioPages = item.gallery.some((s) => s.includes("/portfolio-pages/full/"));
  const galleryHeading = hasPortfolioPages ? "Portfolio Pages" : "Visual Evidence";

  // spec strip cells
  type Cell = { value: string; caption: string };
  const specCells: Cell[] = item.metrics.slice(0, 4).map((m) => {
    const idx = m.search(/\s/);
    return idx > 0
      ? { value: m.slice(0, idx), caption: m.slice(idx + 1) }
      : { value: m, caption: "highlight" };
  });
  const fallbacks: Cell[] = [
    { value: String(item.skills.length), caption: "competencies" },
    { value: item.displaySector, caption: "domain" },
    { value: item.date, caption: "timeline" },
  ];
  while (specCells.length < 3 && fallbacks[specCells.length]) {
    specCells.push(fallbacks[specCells.length]);
  }

  return (
    <main className="relative min-h-screen bg-[#06090e] text-white">

      {/* ── fixed background — paints once, never repaints on scroll ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 75% 8%, ${item.accent}38, transparent 32%), radial-gradient(circle at 12% 65%, ${item.accent}14, transparent 28%), #06090e`,
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* ── floating nav pill ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-0 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-4 rounded-b-2xl border border-white/10 bg-black/80 px-5 py-3 shadow-2xl backdrop-blur-md">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
          <div className="h-4 w-px bg-white/12" />
          <span className="max-w-[160px] truncate text-sm font-bold text-white/85 sm:max-w-xs">
            {item.title}
          </span>
        </div>
      </motion.div>

      {/* ───────────────────────────────── HERO ────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pt-28 pb-8 text-center sm:pt-32 sm:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-5 inline-flex items-center gap-2.5"
        >
          <div className="h-px w-5 bg-white/25" />
          <Kicker>
            {item.displaySector}
            {item.date ? ` · ${item.date}` : ""}
          </Kicker>
          <div className="h-px w-5 bg-white/25" />
        </motion.div>

        <WordsPullUp
          text={item.title}
          className="font-headline font-extrabold leading-[0.92] tracking-[-0.04em] text-white"
          style={{ fontSize: "clamp(2.6rem,7.5vw,5.5rem)" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-8 text-white/60"
        >
          {item.subtitle}
        </motion.p>

        {(item.links.length > 0 || item.documents.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            {item.links.map((link, i) => (
              <a
                key={`${link.href}-${i}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  i === 0
                    ? "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                    : "group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white/75 transition hover:-translate-y-0.5 hover:text-white"
                }
                style={
                  i === 0
                    ? { background: item.accent, boxShadow: `0 4px 18px ${item.accent}50` }
                    : undefined
                }
              >
                <LinkIcon kind={link.kind} />
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
            {item.documents[0] && (
              <a
                href={item.documents[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white/75 transition hover:-translate-y-0.5 hover:text-white"
              >
                <FileText className="h-4 w-4" />
                View deck
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </motion.div>
        )}
      </section>

      {/* ─────────────────────────────── HERO VISUAL ───────────────────────── */}
      {heroSrc && (
        <Reveal className="mx-auto mt-3 max-w-6xl px-4 sm:px-6">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-8 rounded-3xl opacity-20 blur-3xl"
              style={{ background: item.accent }}
            />
            <div
              ref={heroVisualRef}
              className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30 shadow-[0_40px_100px_rgba(0,0,0,0.55)]"
            >
              <motion.img
                src={heroSrc}
                alt={`${item.title} featured visual`}
                style={{ y: parallaxY }}
                loading="eager"
                decoding="async"
                className={
                  heroSrc.includes("/portfolio-pages/full/")
                    ? "h-auto w-full bg-white object-contain p-2"
                    : "aspect-[16/7] w-full object-cover"
                }
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* ─────────────────────────────── SPEC STRIP ────────────────────────── */}
      {specCells.length > 0 && (
        <Reveal className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:flex-nowrap sm:divide-x sm:divide-y-0">
            {specCells.slice(0, 4).map((cell, i) => (
              <div
                key={i}
                className="flex w-full flex-col items-center justify-center gap-1.5 px-4 py-7 text-center sm:w-auto sm:flex-1 sm:px-6 sm:py-8"
              >
                <span className="font-headline text-3xl font-extrabold tabular-nums leading-none text-white sm:text-4xl">
                  {cell.value}
                </span>
                <span className="font-label text-[0.6rem] uppercase tracking-[0.22em] text-white/38">
                  {cell.caption}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* ─────────────────────────────── OVERVIEW ──────────────────────────── */}
      <Reveal className="mx-auto mt-16 max-w-3xl px-5 sm:mt-20 sm:px-8">
        <div
          className="mb-4 h-px w-10"
          style={{ background: item.accent }}
        />
        <Kicker>Overview</Kicker>
        <p className="mt-5 text-lg leading-[1.85] text-white/78 sm:text-xl whitespace-pre-line">
          {item.details}
        </p>
      </Reveal>

      {/* ─────────────────────────────── SKILLS ────────────────────────────── */}
      <Reveal className="mx-auto mt-16 max-w-3xl px-5 sm:mt-20 sm:px-8">
        <div
          className="mb-4 h-px w-10"
          style={{ background: item.accent }}
        />
        <Kicker>
          Stack & Skills · {item.skills.length} competencies
        </Kicker>
        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-2"
          variants={{ visible: { transition: { staggerChildren: 0.025 } }, hidden: {} }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {item.skills.map((skill) => (
            <motion.div
              key={skill}
              variants={{
                hidden: { y: 8, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white/68"
            >
              <CheckCircle2
                className="h-3 w-3 shrink-0"
                style={{ color: item.accent }}
              />
              {skill}
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      {/* ─────────────────────────────── DOCUMENTS ─────────────────────────── */}
      {item.documents.length > 0 && (
        <Reveal className="mx-auto mt-16 max-w-4xl px-5 sm:mt-20 sm:px-8">
          <div className="mb-4 h-px w-10" style={{ background: item.accent }} />
          <Kicker>Documents</Kicker>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {item.documents.map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:border-white/20"
                style={
                  {
                    "--accent": item.accent,
                  } as React.CSSProperties
                }
              >
                <div className="mb-4 flex items-center justify-between">
                  <FileText className="h-5 w-5 text-white/45 transition group-hover:text-white/75" />
                  <ArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/65" />
                </div>
                <div className="text-sm font-bold leading-snug text-white/80">{doc.label}</div>
                <div className="mt-2 font-label text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
                  Open PDF
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      )}

      {/* ─────────────────────────────── GALLERY ───────────────────────────── */}
      {item.gallery.length > 0 && (
        <section
          className="mx-auto mt-16 max-w-5xl px-5 pb-4 sm:mt-20 sm:px-8"
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 700px" } as React.CSSProperties}
        >
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-4 h-px w-10" style={{ background: item.accent }} />
                <Kicker>{galleryHeading}</Kicker>
                <h2 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {galleryHeading}
                </h2>
                {hasPortfolioPages && (
                  <p className="mt-1.5 max-w-md text-sm text-white/40">
                    High-resolution case-study pages from the May 04 portfolio deck.
                  </p>
                )}
              </div>
              {hasPortfolioPages && item.documents[0] && (
                <a
                  href={item.documents[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/65 transition hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  Full PDF
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
            </div>
          </Reveal>

          {hasPortfolioPages ? (
            <div className="space-y-6">
              {item.gallery.map((src, i) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mx-auto block w-full max-w-[940px] overflow-hidden rounded-2xl border border-white/10 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
                >
                  <div className="aspect-[8.5/11] overflow-hidden rounded-xl">
                    <img
                      src={src}
                      alt={`${item.title} — page ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className={item.gallery.length === 1 ? "flex justify-center" : "grid gap-5 sm:grid-cols-2"}>
              {item.gallery.map((src, i) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-lg transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={src}
                      alt={`${item.title} visual ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────── RELATED ───────────────────────────── */}
      {related.length > 0 && (
        <section
          className="mx-auto mt-16 max-w-5xl px-5 pb-16 sm:mt-20 sm:px-8"
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 320px" } as React.CSSProperties}
        >
          <Reveal>
            <div className="mb-4 h-px w-10" style={{ background: item.accent }} />
            <Kicker>More from {item.displaySector}</Kicker>
          </Reveal>
          <Reveal delay={0.08} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/portfolio/${rel.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div>
                  <div className="text-sm font-bold text-white/82">{rel.title}</div>
                  <div className="mt-0.5 text-xs text-white/38">
                    {rel.metrics[0] ?? rel.displaySector}
                  </div>
                </div>
                <span className="ml-3 flex shrink-0 items-center gap-1.5">
                  <span className="text-base">{rel.emoji}</span>
                  <ArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/65" />
                </span>
              </Link>
            ))}
          </Reveal>
        </section>
      )}

      {/* ─────────────────────────────── FOOTER ────────────────────────────── */}
      <CinematicFooter />
    </main>
  );
}
