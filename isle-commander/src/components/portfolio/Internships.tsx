import Link from "next/link";
import { internships } from "@/lib/portfolio";

export default function Internships() {
  const active = internships.filter((i) => i.status === "active");

  return (
    <section id="experience" className="bg-[var(--color-surface-container-low)] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
          <div className="mb-4 text-xs font-label uppercase tracking-widest text-[var(--color-primary)]">
            Experience
          </div>
          <h2 className="font-headline text-4xl font-extrabold leading-tight text-[var(--color-on-surface)]">
            Internships, from next stop to first fieldwork.
          </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-on-surface-variant)]">
            Ordered from most recent to least recent. Open any experience for its dedicated detail page.
          </p>
        </div>

        <div className="space-y-0">
          {active.map((exp, idx) => (
            <Link
              key={exp.id}
              href={`/portfolio/${exp.slug}`}
              className={`group flex flex-col gap-6 py-8 transition hover:bg-white/25 sm:flex-row sm:px-4 ${idx < active.length - 1 ? "border-b border-[var(--color-outline-variant)]" : ""}`}
            >
              <div className="flex-shrink-0">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-surface-container)] p-2 ring-1 ring-inset ring-[var(--color-outline-variant)]/60">
                  {exp.image ? (
                    <img src={exp.image} alt={exp.title} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-container)] text-xl font-bold text-[var(--color-on-surface-variant)]">
                      {exp.emoji}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-[var(--color-on-surface)] transition group-hover:text-[var(--color-primary)]">
                      {exp.title}
                    </h3>
                    <p className="text-sm font-medium text-[var(--color-primary)]">{exp.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-3 py-1 text-xs font-bold text-[var(--color-on-surface-variant)]">
                    {exp.date}
                  </span>
                </div>

                <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-4 whitespace-pre-line">
                  {exp.details}
                </p>

                {exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[var(--color-surface-container-highest)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-on-surface-variant)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
