import Link from "next/link";
import type { Stop, WorldData } from "./driveData";

const SECTIONS: { kind: Stop["kind"]; title: string }[] = [
  { kind: "internship", title: "Internships" },
  { kind: "project", title: "Projects" },
  { kind: "win", title: "Hackathon wins" },
  { kind: "community", title: "Community" },
];

function Row({ stop }: { stop: Stop }) {
  if (!stop.href) {
    // no case study: show the role, with its outside links
    return (
      <li className="grid grid-cols-[3px_1fr] gap-4 border-b border-[#1d2321]/10 py-4">
        <span className="h-full min-h-10 self-stretch" style={{ background: stop.accent }} aria-hidden />
        <span className="min-w-0">
          <span className="block font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b625e]">{stop.kicker}</span>
          <span className="mt-0.5 block font-label text-lg font-bold leading-tight text-[#1d2321]">{stop.title}</span>
          <span className="mt-1 block text-sm leading-snug text-[#5b625e]">{stop.line}</span>
          {stop.links.length > 0 && (
            <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {stop.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-label text-sm font-semibold underline decoration-[#1d2321]/30 underline-offset-4 hover:decoration-[#1d2321]">
                  {l.label} ↗
                </a>
              ))}
            </span>
          )}
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={stop.href ?? "/"}
        className="group grid grid-cols-[3px_1fr_auto] items-center gap-4 border-b border-[#1d2321]/10 py-4 transition-colors hover:bg-[#1d2321]/[0.03] focus-visible:bg-[#1d2321]/[0.05] focus-visible:outline-none"
      >
        <span className="h-full min-h-10 self-stretch" style={{ background: stop.accent }} aria-hidden />
        <span className="min-w-0">
          <span className="block font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b625e]">{stop.kicker}</span>
          <span className="mt-0.5 block font-label text-lg font-bold leading-tight text-[#1d2321]">{stop.title}</span>
          <span className="mt-1 block text-sm leading-snug text-[#5b625e]">{stop.line}</span>
        </span>
        <span className="pr-1 text-sm font-semibold text-[#1d2321] transition-transform group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}

/** the same world as a plain list: for reduced motion, no WebGL, or anyone who prefers reading */
export default function DriveList({ world, onDrive }: { world: WorldData; onDrive?: () => void }) {
  const contact = world.stops.find((s) => s.kind === "contact");
  return (
    <main className="min-h-dvh bg-[#e7ecdf] px-4 pb-16 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-[#1d2321] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-label text-sm font-semibold text-[#1d2321]/70 hover:text-[#1d2321]">
            ← Portfolio
          </Link>
          {onDrive && (
            <button
              type="button"
              onClick={onDrive}
              className="rounded-[6px] border border-[#1d2321]/20 bg-[#fbfaf6] px-3 py-1.5 font-label text-sm font-semibold hover:border-[#1d2321]/40"
            >
              Drive instead
            </button>
          )}
        </div>
        <h1 className="mt-8 font-label text-4xl font-bold tracking-tight sm:text-5xl">Louis Zhang</h1>
        <p className="mt-2 text-[#5b625e]">Mechanical Engineering · Polytechnique Montréal</p>
        {contact && <p className="mt-1 font-semibold text-[#e4572e]">{contact.line}</p>}

        {SECTIONS.map((section) => {
          const items = world.stops.filter((s) => s.kind === section.kind);
          if (items.length === 0) return null;
          return (
            <section key={section.kind} className="mt-10">
              <h2 className="border-b border-[#1d2321] pb-2 font-label text-xs font-bold uppercase tracking-[0.16em]">{section.title}</h2>
              <ul>
                {items.map((s) => (
                  <Row key={s.id} stop={s} />
                ))}
              </ul>
            </section>
          );
        })}

        {contact && (
          <section className="mt-10">
            <h2 className="border-b border-[#1d2321] pb-2 font-label text-xs font-bold uppercase tracking-[0.16em]">Contact</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
              {contact.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  className="font-label font-semibold underline decoration-[#1d2321]/30 underline-offset-4 hover:decoration-[#1d2321]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
