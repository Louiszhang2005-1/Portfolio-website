import Link from "next/link";
import { ALSO_COMPETED, FOCUS, FRAMING, RECOGNITION, WINS, allProjects } from "./projectData";

/** The winning project's own image, aimed like the Projects chapter (named region or focal point). */
function WinImage({ slug, alt }: { slug: string; alt: string }) {
  const item = allProjects.find((p) => p.slug === slug);
  if (!item?.image) return null;
  const crop = FRAMING[item.id];
  if (crop) {
    // the named region was framed for 16:10; this 4:3 frame is taller, so zoom into its centre until it fills
    const zoom = 1.5;
    const left = crop.x + (crop.w - crop.w / zoom) / 2;
    return (
      <img
        src={item.image}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute left-0 top-0 h-auto max-w-none"
        style={{ width: `${(100 / crop.w) * zoom}%`, transform: `translate(-${left * 100}%, -${crop.y * 100}%)` }}
      />
    );
  }
  return (
    <img
      src={item.image}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.03]"
      style={{ objectPosition: FOCUS[item.id] ?? "center" }}
    />
  );
}

/** Static light section: no pinning, just the record. Wins lead with what was built; the rest reads as two lists. */
export default function WinsChapter({ id }: { id: string }) {
  return (
    <section id={id} data-theme="light" className="white px-6 md:px-10 xl:px-16 pb-28 pt-28">
      <div className="mx-auto max-w-[1352px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="max-w-3xl text-[clamp(2.25rem,4.5vw,3.75rem)]">Three hackathon wins.</h2>
          <p className="max-w-[26rem] text-[1.0625rem] leading-[1.55] text-[var(--text-on-light-secondary)]">
            Each one built over a hackathon weekend, with a full write-up in the projects below.
          </p>
        </div>

        {/* the project photo is the card: no boxes, the image and the type carry it */}
        <ol className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-8">
          {WINS.map((w) => (
            <li key={w.event}>
              <Link href={`/portfolio/${w.slug}`} className="group flex h-full flex-col">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-[var(--mat-ink)] shadow-[0_24px_48px_-30px_rgba(0,0,0,0.45)]">
                  <WinImage slug={w.slug} alt={w.project} />
                </span>
                <span className="mt-5 text-sm text-[var(--text-on-light-secondary)]">
                  {w.event} · {w.date}
                </span>
                <h3 className="mt-2 text-[1.6rem] leading-[1.12] text-[var(--text-on-light)]">{w.prize}</h3>
                {w.sponsor && <span className="mt-1.5 text-sm text-[var(--text-on-light-secondary)]">{w.sponsor}</span>}
                <span aria-hidden className="min-h-4 flex-1" />
                <span className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--border-light)] pt-3.5 text-[15px]">
                  <span className="font-medium text-[var(--text-on-light)]">{w.project}</span>
                  <span className="whitespace-nowrap text-[var(--accent-on-light)]">
                    Case study{" "}
                    <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {/* two short lists side by side instead of one table stretched across the window */}
        <div className="mt-24 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="text-lg text-[var(--text-on-light)]">Also built at</h3>
            <ul className="mt-4 divide-y divide-[var(--border-light)] border-y border-[var(--border-light)]">
              {ALSO_COMPETED.map((c) => (
                <li key={c.event}>
                  <Link
                    href={`/portfolio/${c.slug}`}
                    // the visible cells read as a table; the link's name says it as a sentence
                    aria-label={`${c.project}, built at ${c.event}, ${c.date}`}
                    className="group grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-3 text-left transition-colors"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[15px] font-medium text-[var(--text-on-light)] transition-colors group-hover:text-[var(--accent-on-light)]">
                        {c.project}
                      </span>
                      <span className="text-sm text-[var(--text-on-light-secondary)]">{c.event}</span>
                    </span>
                    <span className="whitespace-nowrap text-right font-mono text-xs tabular-nums text-[var(--text-on-light-secondary)]">{c.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* scholarship, leadership, speaking, judging: label on the left, the fact on the right; no cards or pills */}
          <div>
            <h3 className="text-lg text-[var(--text-on-light)]">Beyond the hackathons</h3>
            <dl className="mt-4 divide-y divide-[var(--border-light)] border-y border-[var(--border-light)]">
              {RECOGNITION.map((r) => (
                <div key={r.label} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                  <dt className="pt-px text-sm text-[var(--text-on-light-secondary)]">{r.label}</dt>
                  <dd>
                    <span className="block text-[15px] font-medium leading-snug text-[var(--text-on-light)]">{r.title}</span>
                    {r.detail.map((d) => (
                      <span key={d} className="mt-0.5 block text-sm text-[var(--text-on-light-secondary)]">
                        {d}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
