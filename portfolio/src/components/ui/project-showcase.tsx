"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@/lib/portfolio";

interface ProjectShowcaseProps {
  projects: PortfolioItem[];
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [containerOrigin, setContainerOrigin] = useState({ left: 0, top: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setContainerOrigin({ left: rect.left, top: rect.top });
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-2xl mx-auto px-0 py-8"
    >
      {/* Floating image preview */}
      <div
        className="pointer-events-none fixed z-50 overflow-hidden rounded-xl shadow-2xl"
        style={{
          left: containerOrigin.left,
          top: containerOrigin.top,
          transform: `translate3d(${smoothPosition.x + 20}px, ${smoothPosition.y - 100}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? "1" : "0.8",
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative w-[280px] h-[180px] bg-[var(--color-surface-container)] rounded-xl overflow-hidden">
          {projects.map((project, index) => (
            <img
              key={project.id}
              src={project.image ?? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='180'%3E%3Crect width='280' height='180' fill='%23e2ddbf'/%3E%3C/svg%3E"}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? "1" : "1.1",
                filter: hoveredIndex === index ? "none" : "blur(10px)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      <div className="space-y-0">
        {projects.map((project, index) => {
          const href = `/portfolio/${project.slug}`;
          return (
            <a
              key={project.id}
              href={href}
              className="group block"
              onMouseEnter={() => { setHoveredIndex(index); setIsVisible(true); }}
              onMouseLeave={() => { setHoveredIndex(null); setIsVisible(false); }}
            >
              <div className="relative py-5 border-t border-[var(--color-outline-variant)] transition-all duration-300 ease-out">
                <div
                  className={`absolute inset-0 -mx-4 px-4 bg-[var(--color-surface-container)] rounded-lg transition-all duration-300 ease-out ${
                    hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2">
                      <span className="mr-1">{project.emoji}</span>
                      <h3 className="text-[var(--color-on-surface)] font-medium text-lg tracking-tight font-headline">
                        <span className="relative">
                          {project.title}
                          <span
                            className={`absolute left-0 -bottom-0.5 h-px bg-[var(--color-primary)] transition-all duration-300 ease-out ${
                              hoveredIndex === index ? "w-full" : "w-0"
                            }`}
                          />
                        </span>
                      </h3>
                      <ArrowUpRight
                        className={`w-4 h-4 text-[var(--color-on-surface-variant)] transition-all duration-300 ease-out ${
                          hoveredIndex === index
                            ? "opacity-100 translate-x-0 translate-y-0"
                            : "opacity-0 -translate-x-2 translate-y-2"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm mt-1 leading-relaxed transition-all duration-300 ease-out ${
                        hoveredIndex === index
                          ? "text-[var(--color-on-surface)]"
                          : "text-[var(--color-on-surface-variant)]"
                      }`}
                    >
                      {project.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-on-surface-variant)] tabular-nums shrink-0">
                    {project.sector}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
        <div className="border-t border-[var(--color-outline-variant)]" />
      </div>
    </section>
  );
}
