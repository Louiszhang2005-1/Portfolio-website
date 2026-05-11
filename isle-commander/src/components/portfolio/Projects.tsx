import { ProjectCard } from "@/components/ui/project-card";
import { ProjectShowcase } from "@/components/ui/project-showcase";
import { projects, featuredProjects } from "@/lib/portfolio";

const categories = ["Mechanical", "Robotics & Electronics", "Software"];

export default function Projects() {
  return (
    <section id="projects" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="mb-4 text-xs font-label uppercase tracking-widest text-[var(--color-primary)]">
              Projects
            </div>
            <h2 className="font-headline text-4xl font-extrabold leading-tight text-[var(--color-on-surface)] sm:text-5xl">
              Built artifacts, not just case studies.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-on-surface-variant)]">
            This page now uses the same project records as the game, but presents them as a dense engineering
            portfolio: local images where available, PDF evidence for ResQ-Link, metrics, and clear pathways to
            demos or repositories.
          </p>
        </div>

        <div className="mb-14 grid gap-3 sm:grid-cols-3">
          {categories.map((category) => {
            const count = projects.filter((project) => project.displaySector === category).length;
            return (
              <div
                key={category}
                className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
                  {category}
                </div>
                <div className="mt-2 font-headline text-3xl font-extrabold text-[var(--color-on-surface)]">
                  {count}
                </div>
                <div className="text-xs text-[var(--color-on-surface-variant)]">active builds</div>
              </div>
            );
          })}
        </div>

        <div className="mb-16">
          <h3 className="mb-2 font-label text-sm font-medium uppercase tracking-wide text-[var(--color-on-surface-variant)]">
            Selected Work
          </h3>
          <ProjectShowcase projects={featuredProjects} />
        </div>

        <h3 className="mb-6 font-label text-sm font-medium uppercase tracking-wide text-[var(--color-on-surface-variant)]">
          Full Project Bay
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.details}
              imgSrc={project.image}
              link={`/portfolio/${project.slug}`}
              linkText="Open case study"
              tags={project.skills}
              accent={project.accent}
              metrics={project.metrics}
              documents={project.documents}
              detailHref={`/portfolio/${project.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
