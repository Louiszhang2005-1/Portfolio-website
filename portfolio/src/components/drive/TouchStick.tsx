"use client";

import { useRef } from "react";
import { input } from "./driveStore";

const RADIUS = 56;

/**
 * Drag anywhere on the world to drive: the stick appears under the thumb and the car heads
 * the way it points on screen. Works with a mouse too. Writes straight to the input store
 * and moves its knob through refs, so a drag never re-renders React.
 */
export default function TouchStick() {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const origin = useRef<{ id: number; x: number; y: number } | null>(null);

  const show = (x: number, y: number) => {
    const b = base.current;
    if (!b) return;
    b.style.opacity = "1";
    b.style.transform = `translate(${x - RADIUS}px, ${y - RADIUS}px)`;
  };
  const moveKnob = (dx: number, dy: number) => {
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const end = () => {
    origin.current = null;
    input.stickActive = false;
    input.stickX = 0;
    input.stickY = 0;
    if (base.current) base.current.style.opacity = "0";
    moveKnob(0, 0);
  };

  return (
    <div
      className="absolute inset-0 z-10 touch-none select-none"
      onPointerDown={(e) => {
        if (origin.current || e.button > 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        origin.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        input.stickActive = true;
        input.stickX = 0;
        input.stickY = 0;
        show(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        const o = origin.current;
        if (!o || o.id !== e.pointerId) return;
        let dx = e.clientX - o.x;
        let dy = e.clientY - o.y;
        const len = Math.hypot(dx, dy);
        if (len > RADIUS) {
          // drag the base along so the stick never "runs out"
          const over = len - RADIUS;
          o.x += (dx / len) * over;
          o.y += (dy / len) * over;
          dx = e.clientX - o.x;
          dy = e.clientY - o.y;
          show(o.x, o.y);
        }
        input.stickX = dx / RADIUS;
        input.stickY = -dy / RADIUS;
        moveKnob(dx, dy);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div
        ref={base}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 grid place-items-center rounded-full border border-[#1d2321]/25 bg-white/35 opacity-0 transition-opacity duration-150"
        style={{ width: RADIUS * 2, height: RADIUS * 2 }}
      >
        <div ref={knob} className="h-11 w-11 rounded-full border border-[#1d2321]/30 bg-[#fbfaf6] shadow-sm" />
      </div>
    </div>
  );
}
