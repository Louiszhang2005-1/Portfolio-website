import Link from "next/link";
import { ALSO_COMPETED, HONORS, WINS } from "./projectData";

/** Static light section: no pinning, just the record. */
export default function WinsChapter({ id }: { id: string }) {
  return (
    <section id={id} data-theme="light" className="white px-6 pb-28 pt-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-[clamp(2.25rem,4.5vw,3.75rem)]">Three hackathon wins.</h2>
        <p className="mt-4 max-w-[34rem] text-[1.0625rem] leading-[1.55] text-[var(--text-on-light-secondary)]">
          Each one has a full write-up in the projects below.
        </p>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {WINS.map((w) => (
            <li key={w.event}>
              <Link
                href={`/portfolio/${w.slug}`}
                className="group flex h-full flex-col rounded-[20px] border border-[var(--border-light)] bg-[var(--surface-light)] p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_50px_-30px_rgba(0,0,0,0.35)]"
              >
                <span className="text-sm text-[var(--text-on-light-secondary)]">
                  {w.event}, {w.date}
                </span>
                <h3 className="mt-4 text-[1.6rem] leading-[1.1] text-[var(--text-on-light)]">{w.prize}</h3>
                {w.sponsor && <span className="mt-2 text-sm text-[var(--text-on-light-secondary)]">{w.sponsor}</span>}
                <span className="mt-auto flex items-center justify-between border-t border-[var(--border-light)] pt-4 text-[15px]">
                  <span className="font-medium text-[var(--text-on-light)]">{w.project}</span>
                  <span className="link">Read the case study</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-14 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <h3 className="text-lg text-[var(--text-on-light)]">Also built at</h3>
            <ul className="mt-3 divide-y divide-[var(--border-light)] border-y border-[var(--border-light)]">
              {ALSO_COMPETED.map((c) => (
                <li key={c.event}>
                  <Link
                    href={`/portfolio/${c.slug}`}
                    // the visible cells read as a table; the link's name says it as a sentence
                    aria-label={`${c.project}, built at ${c.event}, ${c.date}`}
                    // fixed date column keeps every row's columns on the same lines
                    className="grid min-h-[48px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7.5rem] items-center gap-4 px-2 text-left text-[15px] transition-colors hover:bg-[var(--surface-light)]"
                  >
                    <span className="truncate font-medium text-[var(--text-on-light)]">{c.event}</span>
                    <span className="truncate text-[var(--text-on-light-secondary)]">{c.project}</span>
                    <span className="whitespace-nowrap text-right font-mono text-xs tabular-nums text-[var(--text-on-light-secondary)]">{c.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg text-[var(--text-on-light)]">Honors</h3>
            <ul className="mt-3 space-y-2 text-[15px] text-[var(--text-on-light-secondary)]">
              {HONORS.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
