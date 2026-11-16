"use client";

import { useEffect, useRef } from "react";
import type { WorldData } from "./driveData";
import { car, driveStore, SCREEN_RIGHT, SCREEN_UP, WORLD_RADIUS } from "./driveStore";
import { PALETTE } from "./palette";
import { buildRoads } from "./worldLayout";

/** a small 2D map, oriented like the view; the static layer is drawn once, the car at ~20 fps */
export default function Minimap({ world, size = 132 }: { world: WorldData; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const scale = (size / 2 - 6) / WORLD_RADIUS;
    const c = size / 2;
    const map = (x: number, z: number) => [c + (x * SCREEN_RIGHT.x + z * SCREEN_RIGHT.z) * scale, c - (x * SCREEN_UP.x + z * SCREEN_UP.z) * scale];

    const base = document.createElement("canvas");
    base.width = canvas.width;
    base.height = canvas.height;
    const b = base.getContext("2d");
    if (!b) return;
    b.scale(dpr, dpr);
    b.fillStyle = PALETTE.ground;
    b.beginPath();
    b.arc(c, c, size / 2 - 2, 0, Math.PI * 2);
    b.fill();
    const { segments, plazas } = buildRoads(world.districts, world.stops);
    b.strokeStyle = PALETTE.road;
    b.lineCap = "round";
    b.lineWidth = 4.2 * scale + 1.5;
    for (const s of segments) {
      const [ax, ay] = map(s.ax, s.az);
      const [bx, by] = map(s.bx, s.bz);
      b.beginPath();
      b.moveTo(ax, ay);
      b.lineTo(bx, by);
      b.stroke();
    }
    b.fillStyle = PALETTE.road;
    for (const p of plazas) {
      const [px, py] = map(p.x, p.z);
      b.beginPath();
      b.arc(px, py, p.r * scale, 0, Math.PI * 2);
      b.fill();
    }

    let raf = 0;
    let last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 48) return;
      last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.scale(dpr, dpr);
      const visited = driveStore.getVisited();
      const near = driveStore.getNearby();
      for (const s of world.stops) {
        const [x, y] = map(s.x, s.z);
        ctx.beginPath();
        ctx.arc(x, y, s.id === near ? 4.5 : 3.2, 0, Math.PI * 2);
        if (visited.has(s.id)) {
          ctx.fillStyle = s.accent;
          ctx.fill();
        } else {
          ctx.fillStyle = PALETTE.paper;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = s.accent;
          ctx.stroke();
        }
      }
      // car: a small arrow pointing along its heading, in map space
      const [x, y] = map(car.x, car.z);
      const hx = -Math.sin(car.heading);
      const hz = -Math.cos(car.heading);
      const mx = hx * SCREEN_RIGHT.x + hz * SCREEN_RIGHT.z;
      const my = -(hx * SCREEN_UP.x + hz * SCREEN_UP.z);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(my, mx));
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-4, 3.6);
      ctx.lineTo(-2.4, 0);
      ctx.lineTo(-4, -3.6);
      ctx.closePath();
      ctx.fillStyle = PALETTE.ink;
      ctx.fill();
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [world, size]);

  return <canvas ref={ref} aria-hidden style={{ width: size, height: size }} className="block" />;
}
