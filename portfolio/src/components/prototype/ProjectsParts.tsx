"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { DRAWINGS, GROUPS, allProjects, type ProjectItem } from "./projectData";
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

export function Filters({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  return (
    <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-[var(--border-light)] bg-[var(--surface-light)] p-1 [scrollbar-width:none]">
      {FILTERS.map((f) => {
        const on = f === value;
        return (
          <button
            key={f}
            aria-pressed={on}
            onClick={() => onChange(f)}
            className="min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors hover:text-[var(--text-on-light)] sm:min-h-[34px]"
            style={on ? { background: "var(--text-on-light)", color: "var(--bg-light)" } : { color: "var(--text-on-light-secondary)" }}
          >
            {f}
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag">{item.group}</span>
        {award && <span className="badge-award">{award}</span>}
      </div>
      <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.5rem)] text-[var(--text-on-light)]">{item.title}</h3>
      <p className="mt-1 text-[15px] text-[var(--text-on-light-secondary)]">{context(item.subtitle)}</p>
      {/* exclusive ranges, so the clamp never depends on utility order: 2 lines on phones, 3 on short windows, 4 on tall */}
      <p className="mt-3 line-clamp-2 max-w-[32rem] text-[15px] leading-[1.55] text-[var(--text-on-light-secondary)] [@media(min-width:640px)_and_(max-height:859px)]:line-clamp-3 [@media(min-width:640px)_and_(min-height:860px)]:line-clamp-4">
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
      <div className="mt-5 flex flex-wrap gap-3">
        {item.slug ? (
          <Link href={`/portfolio/${item.slug}`} className={btnPrimaryLight}>
            Read the case study
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
export function LatexLogo({ size = 64 }: { size?: number }) {
  return (
    <span
      aria-label="LaTeX"
      className="inline-flex items-baseline text-[var(--text)]"
      style={{ fontFamily: "'Latin Modern Roman', 'Computer Modern Serif', 'Times New Roman', Times, serif", fontSize: size, lineHeight: 1 }}
    >
      L
      <span style={{ fontSize: "0.75em", marginLeft: "-0.32em", marginRight: "-0.12em", position: "relative", top: "-0.22em" }}>A</span>
      T
      <span style={{ marginLeft: "-0.16em", marginRight: "-0.11em", position: "relative", top: "0.22em" }}>E</span>
      X
    </span>
  );
}

/** Lane, described by what it does: cycles, the eight statuses, Gmail sync. No personal application numbers. */
function LaneVisual() {
  const statuses = ["Saved", "Applied", "Phone screen", "Interview", "Offer", "Rejected", "Withdrew", "Ghosted"];
  return (
    <div className="flex h-full flex-col justify-center gap-4 px-7">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-[var(--text)]">Lane</span>
        <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-ink)]">Gmail synced</span>
      </div>
      <div className="flex gap-1.5">
        {/* cycle names as in the Lane README */}
        {["Summer 2025", "Winter 2026", "Summer 2026"].map((c, i) => (
          <span
            key={c}
            className="rounded-full px-2.5 py-1 text-[11px]"
            style={i === 0 ? { background: "var(--text)", color: "var(--bg)" } : { color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((st) => (
          <span key={st} className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
            {st}
          </span>
        ))}
      </div>
      <p className="text-xs text-[var(--text-secondary)]">Pipeline chart · CSV export</p>
    </div>
  );
}

function LatexVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <LatexLogo size={72} />
      <p className="text-sm text-[var(--text-secondary)]">PDF or Word resume in, LaTeX out</p>
    </div>
  );
}

/** `eager` only for the one image on screen; the static list's images load as they scroll in. */
export function Showcase({ item, eager = false }: { item: ProjectItem; eager?: boolean }) {
  const drawing = DRAWINGS.has(item.id);
  return (
    <div
      // drawn visuals and drawings sit on white like a printed page; screenshots get a dark mat behind any letterboxing
      className={`relative aspect-[16/10] max-h-[24vh] w-full overflow-hidden rounded-[20px] border border-[var(--border-light)] shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)] md:max-h-[calc(100vh-330px)] ${item.image && !drawing ? "bg-[var(--mat-ink)]" : "bg-white"}`}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "auto" : "async"}
          className={`h-full w-full ${drawing ? "object-contain p-3" : "object-cover object-top"}`}
        />
      ) : item.visual === "lane" ? (
        <LaneVisual />
      ) : item.visual === "latex" ? (
        <LatexVisual />
      ) : null}
    </div>
  );
}

const THUMB = 132;
const GAP = 12;

/**
 * Thumbnail rail; a group label sits over the first project of each group.
 * One tab stop (the active thumb); arrows, Home and End move between projects, and focus follows the pick.
 */
export function Rail({ list, active, onPick }: { list: ProjectItem[]; active: number; onPick: (i: number) => void }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
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
    <div className="relative overflow-hidden">
      {/* left: 50% is the container's centre; the translate puts the active thumb on it */}
      <ol
        aria-label="Projects"
        onKeyDown={onKey}
        className="relative left-1/2 flex w-max gap-3 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateX(-${active * (THUMB + GAP) + THUMB / 2}px)` }}
      >
        {list.map((item, i) => {
          const on = i === active;
          const groupStart = i === 0 || list[i - 1].group !== item.group;
          return (
            <li key={item.id} style={{ width: THUMB }} className={groupStart && i > 0 ? "border-l border-[var(--border-light)] pl-3" : ""}>
              <span aria-hidden className="mb-2 hidden h-4 truncate text-[11px] text-[var(--text-on-light-secondary)] sm:block">
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
                  className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[10px] border bg-[var(--surface-light)] transition-[border-color,opacity] duration-300"
                  style={{ borderColor: on ? "var(--accent)" : "var(--border-light)", opacity: on ? 1 : 0.6 }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`h-full w-full ${DRAWINGS.has(item.id) ? "bg-white object-contain p-1" : "object-cover object-top"}`}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--surface-light)]">
                      {item.visual === "latex" ? (
                        <LatexLogo size={26} />
                      ) : (
                        <span className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--text)]">
                          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                          {item.title}
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span
                  className="mt-2 block truncate text-[13px] transition-colors group-hover:text-[var(--text-on-light)]"
                  style={{ color: on ? "var(--text-on-light)" : "var(--text-on-light-secondary)" }}
                >
                  {item.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {/* edge fades so the rail reads as continuing */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-light)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-light)] to-transparent" />
    </div>
  );
}
