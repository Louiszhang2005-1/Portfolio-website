import Link from "next/link";
import { Award } from "lucide-react";
import { ALSO_COMPETED, COMMUNITY, FOCUS, FRAMING, SCHOLARSHIPS, WINS, allProjects, type Recognition } from "./projectData";

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

/**
 * One entry, read like a profile: a large logo, the role in bold, the organisation, the date (or amount),
 * one sentence. The whole entry links when there is a case study.
 */
function Entry({ r, money }: { r: Recognition; money?: boolean }) {
  const body = (
    <>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[var(--border-light)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:h-[72px] sm:w-[72px]">
        {r.logo ? (
          <img src={r.logo} alt="" width={72} height={72} loading="lazy" decoding="async" className="h-full w-full object-contain p-2" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#1d4f91]">
            <Award aria-hidden className="h-7 w-7 text-white" strokeWidth={1.7} />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <span className="text-[17px] font-semibold leading-snug text-[var(--text-on-light)] transition-colors group-hover:text-[var(--accent-on-light)]">
            {r.title}
            {r.href && (
              <span aria-hidden className="ml-1.5 inline-block text-[var(--accent-on-light)] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            )}
          </span>
          {r.meta && (
            <span className={money ? "text-[17px] font-semibold tabular-nums text-[var(--text-on-light)]" : "font-mono text-xs tabular-nums text-[var(--text-on-light-secondary)]"}>
              {r.meta}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[15px] text-[var(--text-on-light)] opacity-80">{r.org}</span>
        {r.detail && <span className="mt-2 block text-sm leading-relaxed text-[var(--text-on-light-secondary)]">{r.detail}</span>}
      </span>
    </>
  );
  const cls = "group flex items-start gap-4 px-5 py-5 sm:gap-5 sm:px-6";
  return <li>{r.href ? <Link href={r.href} className={`${cls} transition-colors hover:bg-[var(--surface-light)]`}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
}

/** a titled panel of entries, dividers inset past the logo like a profile page */
function Panel({ title, items, money }: { title: string; items: Recognition[]; money?: boolean }) {
  return (
    <div>
      <h3 className="text-lg text-[var(--text-on-light)]">{title}</h3>
      <ul className="mt-4 overflow-hidden rounded-[18px] border border-[var(--border-light)] bg-white shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)] [&>li+li]:border-t [&>li+li]:border-[var(--border-light)]">
        {items.map((r) => (
          <Entry key={r.title + r.org} r={r} money={money} />
        ))}
      </ul>
    </div>
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

        {/* the rest of the record: community work on the left; scholarships and the other hackathon builds on the right */}
        <div className="mt-24 grid gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
          <Panel title="Beyond the hackathons" items={COMMUNITY} />

          <div className="space-y-14">
            <Panel title="Scholarships" items={SCHOLARSHIPS} money />

            <div>
              <h3 className="text-lg text-[var(--text-on-light)]">Also built at</h3>
              <ul className="mt-4 overflow-hidden rounded-[18px] border border-[var(--border-light)] bg-white shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)] [&>li+li]:border-t [&>li+li]:border-[var(--border-light)]">
                {ALSO_COMPETED.map((c) => (
                  <li key={c.event}>
                    <Link
                      href={`/portfolio/${c.slug}`}
                      // the visible cells read as a table; the link's name says it as a sentence
                      aria-label={`${c.project}, built at ${c.event}, ${c.date}`}
                      className="group grid min-h-[56px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-3.5 text-left transition-colors hover:bg-[var(--surface-light)] sm:px-6"
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
          </div>
        </div>
      </div>
    </section>
  );
}
