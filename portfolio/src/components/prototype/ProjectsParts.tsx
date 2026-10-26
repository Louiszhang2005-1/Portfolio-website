"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { DRAWINGS, FRAMING, GROUPS, allProjects, type ProjectItem } from "./projectData";
import { btnGhostLight, btnPrimaryLight } from "./stage";

export const FILTERS = ["All", ...GROUPS] as const;
export type Filter = (typeof FILTERS)[number];

export const filterList = (f: Filter) => (f === "All" ? allProjects : allProjects.filter((p) => p.group === f));

const isAward = (s: string) => /award|place|best use|prize|winner/i.test(s);
const awardLabel = (s: string) => s.split("·").map((x) => x.trim()).find(isAward);
const context = (s: string) =>
  s
    .split("·")
    .map((x) => x.trim())
    .filter((x) => !isAward(x))
    .join(", ");

const ENG =
  /\b(built|build|designed|developed|coded|modell?ed|model|sensors?|radar|NFC|coil|firmware|pipeline|simulation|FEA|CAD|SolidWorks|Arduino|ESP32|Raspberry|PCB|robot|autonomous|machin\w*|prototyp\w*|assembl\w*|piston|telescopic|fine-tuned|FastAPI|React|Python|C\+\+|detects?)\b/i;
const MARKET = /\$\s?\d|\d+(?:\.\d+)?%|\bmarket\b|losses|wait times|have risen/i;
// always business, even when an engineering word appears ("Business model: hardware...")
const BUSINESS = /business model|seed round|running cost|malpractice|SaaS/i;
const isMarket = (x: string) => BUSINESS.test(x) || (MARKET.test(x) && !ENG.test(x));

/** Lines of one paragraph, minus a leading emoji, an all-caps heading ("HOW WE BUILT IT"), bullets and market-only lines. */
const lines = (para: string) => {
  const out = para
    .replace(/^\p{Extended_Pictographic}\s*/u, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (out.length > 1 && /^[^a-z]+$/.test(out[0])) out.shift();
  const bare = out.map((l) => l.replace(/^[•\-–]\s*/, ""));
  // a one-line paragraph is trimmed sentence by sentence in summary(), not dropped whole
  return bare.length > 1 ? bare.filter((l) => !isMarket(l)) : bare;
};

// split only before a capital so "3.1 m" and "Node.js" stay whole
const sentences = (line: string) => line.split(/(?<=[.!?])\s+(?=[A-Z])/);
const join = (ls: string[]) => ls.map((l) => (/[.!?]$/.test(l) ? l : `${l}.`)).join(" ");

/**
 * What was built, not the market blurb: drop leading market sentences, start at the first paragraph that names the
 * engineering (fallback: paragraph 1), and add the next engineering paragraph while it is short. Wording is untouched.
 */
export const summary = (details: string, echo = "") => {
  const paras = details
    .split(/\n\n+/)
    .map((p) => {
      const ls = lines(p);
      if (ls.length !== 1) return ls;
      const s = sentences(ls[0]);
      while (s.length > 1 && isMarket(s[0])) s.shift();
      return [s.join(" ")];
    })
    .filter((ls) => ls.length > 0);
  if (!paras.length) return "";
  const at = paras.findIndex((ls) => ENG.test(ls.join(" ")) && !isMarket(ls.join(" ")));
  const start = Math.max(0, at);
  let out = dropEcho(join(paras[start]), echo);
  for (const next of paras.slice(start + 1)) {
    if (out.length >= 200) break;
    const t = next.join(" ");
    if (ENG.test(t) && !isMarket(t)) out = `${out} ${join(next)}`.trim();
  }
  return out;
};

const words = (x: string) => x.toLowerCase().match(/[\p{L}\d]+/gu) ?? [];
/** Drop opening sentences that mostly restate the context line printed right above the summary. */
const dropEcho = (text: string, echo: string) => {
  const seen = new Set(words(echo));
  if (!seen.size) return text;
  const s = sentences(text);
  while (s.length > 1) {
    const w = words(s[0]);
    if (!w.length || w.filter((x) => seen.has(x)).length / w.length < 0.5) break;
    s.shift();
  }
  return s.join(" ");
};

/**
 * "3.1m deployable tube" → value "3.1m", caption "deployable tube". Ordinals keep their noun ("1st place").
 * Phrases without a number ("Best Use of ElevenLabs") stay whole instead of splitting after the first word.
 */
const splitMetric = (m: string) => {
  const ordinal = m.match(/^(\d+(?:st|nd|rd|th) place),?\s*(.*)$/i);
  if (ordinal) return { value: ordinal[1], caption: ordinal[2], numeric: true };
  const i = m.search(/\s/);
  if (i > 0 && /\d/.test(m.slice(0, i))) return { value: m.slice(0, i), caption: m.slice(i + 1), numeric: true };
  return { value: m, caption: "", numeric: false };
};

/** Phone labels, so all four tabs fit a 360px row without scrolling. */
const SHORT: Record<string, string> = { "Hardware & robotics": "Hardware", "Software & AI": "Software", "Side projects": "Side" };

export function Filters({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  return (
    <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-[var(--border-light)] bg-[var(--surface-light)] p-1 [scrollbar-width:none]">
      {FILTERS.map((f) => {
        const on = f === value;
        return (
          <button
            key={f}
            aria-pressed={on}
            aria-label={f}
            onClick={() => onChange(f)}
            className="min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors hover:text-[var(--text-on-light)] sm:min-h-[34px] sm:px-4"
            style={on ? { background: "var(--text-on-light)", color: "var(--bg-light)" } : { color: "var(--text-on-light-secondary)" }}
          >
            <span className="sm:hidden">{SHORT[f] ?? f}</span>
            <span className="hidden sm:inline">{f}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Detail({ item }: { item: ProjectItem }) {
  const award = awardLabel(item.subtitle);
  const external = item.links.find((l) => l.kind !== "document");
  return (
    <div>
      {/* one line: a long award label truncates instead of wrapping and pushing the rail down */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="tag shrink-0">{item.group}</span>
        {award && <span className="badge-award min-w-0 truncate">{award}</span>}
      </div>
      <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.5rem)] text-[var(--text-on-light)]">{item.title}</h3>
      <p className="mt-1 text-[15px] text-[var(--text-on-light-secondary)]">{context(item.subtitle)}</p>
      {/* exclusive ranges, so the clamp never depends on utility order: 2 lines on phones, 3 on short windows, 4 on tall */}
      <p className="phone-roomy-only mt-3 line-clamp-2 max-w-[32rem] text-[15px] leading-[1.55] text-[var(--text-on-light-secondary)] [@media(min-width:640px)_and_(max-height:859px)]:line-clamp-3 [@media(min-width:640px)_and_(min-height:860px)]:line-clamp-4">
        {summary(item.details, context(item.subtitle))}
      </p>
      {item.metrics.length > 0 && (
        <dl className="tall-only mt-4 hidden grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[var(--border-light)] bg-[var(--border-light)] sm:grid">
          {item.metrics.slice(0, 4).map((m, i, shown) => {
            const { value, caption, numeric } = splitMetric(m);
            // an odd last cell spans the row instead of leaving an empty slot
            const span = i === shown.length - 1 && shown.length % 2 === 1;
            return (
              <div key={m} className={`bg-[var(--surface-light)] px-4 py-2.5 ${span ? "col-span-2" : ""}`}>
                <dd className={numeric ? "font-mono text-lg tabular-nums text-[var(--text-on-light)]" : "py-1 text-[15px] font-medium text-[var(--text-on-light)]"}>{value}</dd>
                <dt className="text-xs text-[var(--text-on-light-secondary)]">{caption}</dt>
              </div>
            );
          })}
        </dl>
      )}
      {/* buttons stay on one row: smaller and shorter-labelled on phones */}
      <div className="mt-4 flex flex-nowrap gap-2 sm:mt-5 sm:gap-3 [&>*]:whitespace-nowrap max-sm:[&>*]:px-4 max-sm:[&>*]:text-[14px]">
        {item.slug ? (
          <Link href={`/portfolio/${item.slug}`} className={btnPrimaryLight}>
            <span className="sm:hidden">Case study</span>
            <span className="hidden sm:inline">Read the case study</span>
          </Link>
        ) : null}
        {external && (
          <a
            href={external.href}
            target="_blank"
            rel="noopener noreferrer"
            className={item.slug ? btnGhostLight : btnPrimaryLight}
          >
            {item.slug ? external.label : `View on ${external.label}`}
          </a>
        )}
      </div>
    </div>
  );
}

/** The LaTeX wordmark, set the way LaTeX sets it: small raised A, lowered E, tight kerning. */
export function LatexLogo({ size = 64, color = "var(--text)" }: { size?: number; color?: string }) {
  return (
    <span
      aria-label="LaTeX"
      className="inline-flex items-baseline"
      style={{ color, fontFamily: "'Latin Modern Roman', 'Computer Modern Serif', 'Times New Roman', Times, serif", fontSize: size, lineHeight: 1 }}
    >
      L
      <span style={{ fontSize: "0.75em", marginLeft: "-0.32em", marginRight: "-0.12em", position: "relative", top: "-0.22em" }}>A</span>
      T
      <span style={{ marginLeft: "-0.16em", marginRight: "-0.11em", position: "relative", top: "0.22em" }}>E</span>
      X
    </span>
  );
}

const LANE_STATUSES = ["Saved", "Applied", "Phone screen", "Interview", "Offer", "Rejected", "Withdrew", "Ghosted"];

/**
 * Lane as its extension window: cycles, a board of the statuses, Gmail sync. Every column holds the same skeleton
 * cards (clipped by the frame), so nothing reads as a count: no personal application numbers.
 */
function LaneVisual() {
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--bg-light)] p-3 sm:gap-3 sm:p-5 lg:gap-4 lg:p-7">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-base font-semibold text-[var(--text)] sm:text-lg lg:text-xl">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          Lane
        </span>
        <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-ink)] lg:text-xs">Gmail synced</span>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {/* cycle names as in the Lane README */}
        {["Summer 2025", "Winter 2026", "Summer 2026"].map((c, i) => (
          <span
            key={c}
            className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] lg:px-3 lg:py-1 lg:text-xs"
            style={i === 0 ? { background: "var(--text)", color: "var(--bg)" } : { color: "var(--text-secondary)", border: "1px solid var(--border-hover)" }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3">
        {LANE_STATUSES.slice(1, 5).map((st, i) => (
          <div key={st} className="flex min-h-0 flex-col gap-1.5 overflow-hidden rounded-[10px] border border-[var(--border)] bg-white p-1.5 sm:gap-2 sm:p-2.5 lg:p-3">
            <span className="shrink-0 truncate text-[10px] font-medium leading-tight text-[var(--text-secondary)] sm:text-[11px] lg:text-[13px]">{st}</span>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <span key={k} className="flex shrink-0 flex-col gap-1 rounded-md border border-[var(--border)] p-1.5 lg:gap-1.5 lg:p-2.5">
                <span className="h-1.5 w-4/5 rounded-full lg:h-2" style={{ background: i === 3 && k === 0 ? "var(--accent)" : "var(--border-hover)" }} />
                <span className="h-1.5 w-1/2 rounded-full bg-[var(--border)] lg:h-2" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)] lg:text-xs">
        <span className="truncate">{LANE_STATUSES.length} statuses, Saved to Offer</span>
        <span className="shrink-0">Sankey chart · CSV export</span>
      </div>
    </div>
  );
}

/** Rail-sized Lane tile, like the LaTeX logo tile. */
function LaneMini() {
  return (
    <span className="flex h-full w-full flex-col justify-center gap-1.5 bg-[var(--bg-light)] px-3">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Lane
      </span>
      <span className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className="flex h-6 flex-col gap-0.5 rounded-[3px] border border-[var(--border)] bg-white p-0.5">
            <span className="h-1 rounded-full" style={{ background: k === 3 ? "var(--accent)" : "var(--border-hover)" }} />
            <span className="h-1 w-2/3 rounded-full bg-[var(--border)]" />
          </span>
        ))}
      </span>
    </span>
  );
}

/** Generic LaTeX resume source: template structure only, no personal content. */
const TEX = String.raw`\documentclass[letterpaper,11pt]{article}
\usepackage{titlesec, enumitem}
\begin{document}
\begin{center}
  \textbf{\Huge \scshape Name}
\end{center}
\section{Education}
  \resumeSubheading{...}{...}
\section{Experience}
  \resumeSubHeadingListStart
    \resumeItem{...}
    \resumeItem{...}
\section{Projects}
    \resumeProjectHeading{...}
\section{Technical Skills}
\end{document}`.split("\n");
const SECTION = String.raw`\section`;

/** LaTeXify: a resume page in, the LaTeX source out, set side by side and filling the frame. */
function LatexVisual() {
  return (
    <div className="grid h-full grid-cols-[minmax(0,4fr)_auto_minmax(0,6fr)] items-stretch gap-2 bg-[var(--bg-light)] p-3 sm:gap-4 sm:p-5 lg:p-7">
      <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden rounded-[8px] border border-[var(--border)] bg-white p-2.5 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.35)] sm:gap-2 sm:p-4 lg:p-5">
        <span className="shrink-0 text-[10px] font-medium text-[var(--text-secondary)] sm:text-[11px] lg:text-xs">resume.pdf / .docx</span>
        <span className="mx-auto mt-1 h-2 w-1/2 shrink-0 rounded-full bg-[var(--text)] opacity-70 lg:h-3" />
        <span className="mx-auto h-1.5 w-2/3 shrink-0 rounded-full bg-[var(--border-hover)]" />
        {[0, 1, 2, 3, 4].map((g) => (
          <span key={g} className="mt-1 flex shrink-0 flex-col gap-1.5 lg:mt-2 lg:gap-2">
            <span className="h-1.5 w-1/3 rounded-full bg-[var(--text)] opacity-50 lg:h-2" />
            <span className="h-px w-full bg-[var(--border-hover)]" />
            {[92, 78, 85].map((w, k) => (
              <span key={k} className="h-1.5 rounded-full bg-[var(--border-hover)] lg:h-2" style={{ width: `${w - g * 3}%` }} />
            ))}
          </span>
        ))}
      </div>
      <span aria-hidden className="self-center text-lg text-[var(--accent)] sm:text-2xl">→</span>
      <div className="flex min-h-0 flex-col overflow-hidden rounded-[8px] bg-[var(--mat-graphite)] p-2.5 sm:p-4 lg:p-5">
        <span className="flex shrink-0 items-center justify-between gap-2">
          <LatexLogo size={22} color="#fff" />
          <span className="text-[10px] text-white/60 sm:text-[11px] lg:text-xs">PDF + .tex out</span>
        </span>
        <pre className="mt-2 min-h-0 flex-1 overflow-hidden font-mono text-[9px] leading-[1.6] text-white/80 sm:text-[11px] lg:mt-3 lg:text-[13px]">
          {TEX.map((l, k) => (
            <span key={k} className={`block truncate ${l.startsWith(SECTION) ? "text-[var(--accent)]" : ""}`}>
              {l}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

/** `eager` only for the one image on screen; the static list's images load as they scroll in. */
export function Showcase({ item, eager = false }: { item: ProjectItem; eager?: boolean }) {
  const drawing = DRAWINGS.has(item.id);
  const crop = FRAMING[item.id];
  const load = { loading: eager ? ("eager" as const) : ("lazy" as const), decoding: eager ? ("auto" as const) : ("async" as const) };
  return (
    <div
      // drawings sit as a sheet on a drafting-grid desk; screenshots get a dark mat behind any letterboxing
      className={`relative aspect-[16/10] max-h-[24svh] w-full max-md:[@media(max-height:760px)]:max-h-[18svh] overflow-hidden rounded-[20px] border border-[var(--border-light)] shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)] md:max-h-[calc(100svh-330px)] ${item.image && !drawing ? "bg-[var(--mat-ink)]" : "bg-[var(--bg-light)]"}`}
      style={drawing ? { backgroundImage: GRID, backgroundSize: "16px 16px" } : undefined}
    >
      {item.image && drawing ? (
        <div className="flex h-full w-full items-center justify-center p-2 sm:p-3">
          <img src={item.image} alt={item.title} {...load} className="max-h-full max-w-full rounded-[6px] bg-white object-contain shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]" />
        </div>
      ) : item.image && crop ? (
        // a named region of a wide screenshot, filling the frame instead of a cropped strip of empty canvas
        <img
          src={item.image}
          alt={item.title}
          {...load}
          className="absolute left-0 top-0 h-auto max-w-none"
          style={{ width: `${100 / crop.w}%`, transform: `translate(-${crop.x * 100}%, -${crop.y * 100}%)` }}
        />
      ) : item.image ? (
        <img src={item.image} alt={item.title} {...load} className="h-full w-full object-cover object-top" />
      ) : item.visual === "lane" ? (
        <LaneVisual />
      ) : item.visual === "latex" ? (
        <LatexVisual />
      ) : null}
    </div>
  );
}

const GRID = "linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)";
const THUMB = 132;
const GAP = 12;
const FADE = 48;

/**
 * Thumbnail rail; a group label sits over the first project of each group.
 * The active thumb is centred, clamped so the rail never scrolls past either end. One tab stop (the active thumb);
 * arrows, Home and End move between projects, and focus follows the pick.
 */
export function Rail({ list, active, onPick }: { list: ProjectItem[]; active: number; onPick: (i: number) => void }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const total = list.length * THUMB + (list.length - 1) * GAP;
  const maxShift = Math.max(0, total - width);
  const shift = width ? Math.min(maxShift, Math.max(0, active * (THUMB + GAP) + THUMB / 2 - width / 2)) : 0;
  // fade only an edge that has thumbs beyond it; a mask blends into any section background
  const left = shift > 1 ? FADE : 0;
  const right = shift < maxShift - 1 ? FADE : 0;
  const mask = `linear-gradient(to right, transparent 0, #000 ${left}px, #000 calc(100% - ${right}px), transparent 100%)`;

  const go = (i: number) => {
    const next = Math.max(0, Math.min(list.length - 1, i));
    onPick(next);
    // preventScroll: the page scroll from onPick is the movement; focus must not fight it
    buttons.current[next]?.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const move = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: list.length - 1 }[e.key];
    if (move === undefined) return;
    e.preventDefault();
    go(move);
  };
  return (
    <div ref={box} className="relative overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <ol
        aria-label="Projects"
        onKeyDown={onKey}
        className="flex w-max transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ gap: GAP, transform: `translateX(-${shift}px)` }}
      >
        {list.map((item, i) => {
          const on = i === active;
          const groupStart = i === 0 || list[i - 1].group !== item.group;
          return (
            // every tile is exactly THUMB wide; the group divider sits in the gap, so it never narrows a tile
            <li key={item.id} style={{ width: THUMB }} className="relative shrink-0">
              {groupStart && i > 0 && <span aria-hidden className="absolute inset-y-0 w-px bg-[var(--border-light)]" style={{ left: -GAP / 2 - 0.5 }} />}
              <span aria-hidden className="mb-2 hidden h-4 truncate text-[11px] leading-4 text-[var(--text-on-light-secondary)] sm:block">
                {groupStart ? item.group : ""}
              </span>
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                onClick={() => go(i)}
                tabIndex={on ? 0 : -1}
                aria-current={on ? "true" : undefined}
                aria-label={`Show ${item.title}`}
                className="group block w-full rounded-[10px] text-left"
              >
                <span
                  className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[10px] border bg-[var(--surface-light)] transition-[border-color,opacity] duration-300"
                  style={{ borderColor: on ? "var(--accent)" : "var(--border-light)", opacity: on ? 1 : 0.6 }}
                >
                  {item.image && FRAMING[item.id] ? (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute left-0 top-0 h-auto max-w-none"
                      style={{ width: `${100 / FRAMING[item.id].w}%`, transform: `translate(-${FRAMING[item.id].x * 100}%, -${FRAMING[item.id].y * 100}%)` }}
                    />
                  ) : item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`h-full w-full ${DRAWINGS.has(item.id) ? "bg-white object-contain p-1" : "object-cover object-top"}`}
                    />
                  ) : item.visual === "latex" ? (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--bg-light)]">
                      <LatexLogo size={26} />
                    </span>
                  ) : (
                    <LaneMini />
                  )}
                </span>
                <span
                  className="phone-tall-only mt-2 block truncate text-[13px] leading-5 transition-colors group-hover:text-[var(--text-on-light)]"
                  style={{ color: on ? "var(--text-on-light)" : "var(--text-on-light-secondary)" }}
                >
                  {item.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
