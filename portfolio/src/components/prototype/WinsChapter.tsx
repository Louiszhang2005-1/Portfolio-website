import Link from "next/link";
import { ALSO_COMPETED, HONORS, WINS } from "./projectData";

/** Static light section: no pinning, just the record. */
export default function WinsChapter({ id }: { id: string }) {
  return (
    <section id={id} data-theme="light" className="white px-6 md:px-10 xl:px-16 pb-28 pt-28">
      <div className="mx-auto max-w-[1352px]">
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
                {/* the subtitle line is always reserved, so every card's title and divider sit on the same lines */}
                <span className="mt-2 min-h-5 text-sm leading-5 text-[var(--text-on-light-secondary)]">{w.sponsor ?? " "}</span>
                <span aria-hidden className="min-h-6 flex-1" />
                <span className="flex items-center justify-between border-t border-[var(--border-light)] pt-4 text-[15px]">
                  <span className="font-medium text-[var(--text-on-light)]">{w.project}</span>
                  <span className="link">Read the case study</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-14">
          <h3 className="text-lg text-[var(--text-on-light)]">Also built at</h3>
          <ul className="mt-3 divide-y divide-[var(--border-light)] border-y border-[var(--border-light)]">
            {ALSO_COMPETED.map((c) => (
              <li key={c.event}>
                <Link
                  href={`/portfolio/${c.slug}`}
                  // the visible cells read as a table; the link's name says it as a sentence
                  aria-label={`${c.project}, built at ${c.event}, ${c.date}`}
                  // phones: event over project, date on the right; wider: three columns on fixed lines
                  className="grid min-h-[48px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-2 py-2.5 text-left text-[15px] transition-colors hover:bg-[var(--surface-light)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7.5rem] sm:py-0"
                >
                  <span className="flex min-w-0 flex-col sm:contents">
                    <span className="font-medium text-[var(--text-on-light)] sm:truncate">{c.event}</span>
                    <span className="text-[var(--text-on-light-secondary)] sm:truncate">{c.project}</span>
                  </span>
                  <span className="whitespace-nowrap text-right font-mono text-xs tabular-nums text-[var(--text-on-light-secondary)]">{c.date}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* a compact row under the table instead of a mostly empty side column */}
          <div className="mt-10 flex flex-col gap-1 rounded-[16px] border border-[var(--border-light)] bg-[var(--surface-light)] px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6">
            <h3 className="shrink-0 text-lg text-[var(--text-on-light)]">Honors</h3>
            <ul className="space-y-1 text-[15px] text-[var(--text-on-light-secondary)]">
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
