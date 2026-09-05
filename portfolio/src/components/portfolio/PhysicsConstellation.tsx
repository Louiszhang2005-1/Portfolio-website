"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioItem } from "@/lib/portfolio";

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  item: PortfolioItem;
};

function LoadingSkeleton() {
  return (
    <div className="relative h-[360px] rounded-[2rem] border border-white/10 bg-black/20 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center gap-3 flex-col">
        <div className="flex gap-2 items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: "120ms" }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: "240ms" }} />
        </div>
        <p className="text-[11px] font-label uppercase tracking-widest text-white/30">Initialising physics…</p>
      </div>
      {/* Skeleton node placeholders */}
      {[
        { left: "22%", top: "28%", w: 64 },
        { left: "55%", top: "18%", w: 72 },
        { left: "72%", top: "58%", w: 58 },
        { left: "35%", top: "65%", w: 68 },
        { left: "80%", top: "32%", w: 60 },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 animate-pulse"
          style={{ left: s.left, top: s.top, width: s.w, height: s.w, animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export default function PhysicsConstellation({ projects }: { projects: PortfolioItem[] }) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);

  const pointer = useRef({ x: 50, y: 45, active: false });
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = useMemo(() => projects.slice(0, 9), [projects]);

  const bodies = useRef<Body[]>(
    items.map((item, i) => ({
      x: 50 + Math.cos((i / Math.max(items.length, 1)) * Math.PI * 2) * (22 + (i % 3) * 6),
      y: 50 + Math.sin((i / Math.max(items.length, 1)) * Math.PI * 2) * (18 + (i % 2) * 6),
      vx: (i % 2 === 0 ? 0.05 : -0.05) * (1 + i * 0.03),
      vy: (i % 3 === 0 ? 0.04 : -0.04) * (1 + i * 0.03),
      size: 62 + (i % 3) * 10,
      item,
    }))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let frame = 0;
    let errorCount = 0;

    const tick = () => {
      try {
        const bs = bodies.current;
        for (let i = 0; i < bs.length; i++) {
          const b = bs[i];
          const centerPull = pointer.current.active ? 0.0032 : 0.0075;
          let vx = b.vx + (50 - b.x) * centerPull;
          let vy = b.vy + (50 - b.y) * centerPull;

          if (pointer.current.active) {
            const dx = b.x - pointer.current.x;
            const dy = b.y - pointer.current.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 5);
            const influence = Math.max(0, 1 - dist / 46);
            const repel = influence * influence * 0.88;
            vx += (dx / dist) * repel;
            vy += (dy / dist) * repel;
          }

          for (let j = 0; j < bs.length; j++) {
            if (i === j) continue;
            const other = bs[j];
            const dx = b.x - other.x;
            const dy = b.y - other.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 2);
            const minDist = 7.5 + (b.size + other.size) * 0.018;
            const overlap = minDist - dist;
            if (overlap > 0) {
              vx += (dx / dist) * overlap * 0.014;
              vy += (dy / dist) * overlap * 0.014;
            }
          }

          const damping = pointer.current.active ? 0.965 : 0.91;
          vx *= damping;
          vy *= damping;

          const speed = Math.max(Math.sqrt(vx * vx + vy * vy), 0.001);
          const maxSpeed = pointer.current.active ? 2.15 : 0.82;
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
          }

          let x = b.x + vx;
          let y = b.y + vy;

          if (x < 8) { vx = Math.abs(vx) * 0.85; x = 8; }
          if (x > 92) { vx = -Math.abs(vx) * 0.85; x = 92; }
          if (y < 10) { vy = Math.abs(vy) * 0.85; y = 10; }
          if (y > 88) { vy = -Math.abs(vy) * 0.85; y = 88; }

          bs[i] = { ...b, x, y, vx, vy };

          // Direct DOM update — no React re-render
          const el = nodeRefs.current[i];
          if (el) {
            el.style.left = `${x}%`;
            el.style.top = `${y}%`;
          }
        }
        errorCount = 0;
      } catch {
        errorCount++;
        if (errorCount > 10) { setError(true); return; }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  return (
    <div
      className="relative min-h-[420px] overflow-hidden border-y border-white/10 bg-[#07131a] text-white"
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,150,105,0.18),transparent_32%,rgba(14,165,233,0.16)_68%,rgba(248,113,113,0.16))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <div className="mb-4 text-xs font-label uppercase tracking-widest text-cyan-200/70">
            Project Physics
          </div>
          <h2 className="font-headline text-3xl font-extrabold leading-tight sm:text-5xl">
            A live map of the work, pulled to the core.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/62">
            Each project bubble drifts toward the center magnet. Hover through the field to scatter the cluster, then watch it pull itself back together.
          </p>
        </div>

        {error ? (
          <div className="relative h-[360px] rounded-[2rem] border border-white/10 bg-black/20 flex items-center justify-center flex-col gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-white/50 font-label uppercase tracking-wider">Physics unavailable</p>
            <a href="#project-orbit" className="text-xs text-cyan-400/70 underline">View projects above</a>
          </div>
        ) : !mounted ? (
          <LoadingSkeleton />
        ) : (
          <div
            className="relative h-[360px] rounded-[2rem] border border-white/10 bg-black/20 overflow-hidden"
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              pointer.current = {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
                active: true,
              };
            }}
            onPointerLeave={() => { pointer.current.active = false; }}
          >
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15 bg-cyan-200/4 pointer-events-none" />
            {items.map((item, i) => {
              const b = bodies.current[i];
              return (
                /* Outer div handles position; inner <a> handles hover scale — avoids transform conflict */
                <div
                  key={item.id}
                  ref={(el) => { nodeRefs.current[i] = el; }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size }}
                >
                  <a
                    href={`/portfolio/${item.slug}`}
                    className="group relative flex h-full w-full items-center justify-center rounded-full border border-white/20 bg-white/10 text-center backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/40 hover:bg-white/18"
                    style={{ boxShadow: `0 0 28px ${item.accent}44` }}
                    title={item.title}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1 leading-tight text-center select-none">
                      {item.emoji}
                    </span>
                    {/* Tooltip on hover */}
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[9px] font-label text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                      {item.title}
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
