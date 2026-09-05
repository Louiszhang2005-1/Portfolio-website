"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imgSrc: string | null;
  title: string;
  description: string;
  link: string;
  linkText?: string;
  tags?: string[];
  accent?: string;
  metrics?: string[];
  documents?: { label: string; href: string }[];
  detailHref?: string;
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      className,
      imgSrc,
      title,
      description,
      link,
      linkText = "View Project",
      tags,
      accent = "#00656f",
      metrics = [],
      documents = [],
      detailHref,
      ...props
    },
    ref
  ) => {
    const router = useRouter();

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-2 hover:shadow-xl",
          className
        )}
        style={{ "--project-accent": accent } as React.CSSProperties}
        role={detailHref ? "link" : undefined}
        tabIndex={detailHref ? 0 : undefined}
        onClick={(event) => {
          if (!detailHref || (event.target as HTMLElement).closest("a")) return;
          router.push(detailHref);
        }}
        onKeyDown={(event) => {
          if (!detailHref || (event.target as HTMLElement).closest("a")) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(detailHref);
          }
        }}
        {...props}
      >
        <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-container)]">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--project-accent)_34%,transparent),transparent_34%),linear-gradient(135deg,#111827,#f8fafc)] p-6">
              <div className="grid w-full max-w-[220px] gap-2">
                {(documents.length ? documents : [{ label: "System brief", href: "#" }]).slice(0, 3).map((doc) => (
                  <div
                    key={doc.label}
                    className="flex items-center gap-2 rounded-lg border border-white/22 bg-white/16 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {metrics[0] ?? "System build"}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-headline text-xl font-semibold transition-colors duration-300 group-hover:text-[var(--color-primary)]">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-on-surface-variant)]">{description}</p>

          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--color-surface-container-highest)] px-2 py-0.5 text-xs text-[var(--color-on-surface-variant)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {metrics.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {metrics.slice(1, 3).map((metric) => (
                <div
                  key={metric}
                  className="rounded-lg border border-[var(--color-outline-variant)] bg-white/35 px-2 py-1.5 text-[11px] font-semibold text-[var(--color-on-surface-variant)]"
                >
                  {metric}
                </div>
              ))}
            </div>
          )}

          {documents.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {documents.slice(0, 2).map((doc) => (
                <span
                  key={doc.href}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-highest)] px-2.5 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)]"
                >
                  <FileText className="h-3 w-3" />
                  {doc.label}
                </span>
              ))}
            </div>
          )}

          {link && link !== "#" ? (
            <a
              href={link}
              target={link.startsWith("/") ? undefined : "_blank"}
              rel={link.startsWith("/") ? undefined : "noopener noreferrer"}
              className="group/button mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition-all duration-300 hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {linkText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </a>
          ) : (
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
              Open case study
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export { ProjectCard };
