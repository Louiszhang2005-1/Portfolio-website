"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Anchor, Home, LogOut, Map, Navigation, Search } from "lucide-react";
import type { VirtualJoystickInput } from "@/hooks/useMatterEngine";

interface MobileControlsProps {
  onJoystickChange: (input: VirtualJoystickInput) => void;
  onMap: () => void;
  onReturnHome: () => void;
  onInteract: () => void;
  canInteract: boolean;
  isDocked: boolean;
  nearbyLabel?: string;
}

const STICK_RADIUS = 54;

export default function MobileControls({
  onJoystickChange,
  onMap,
  onReturnHome,
  onInteract,
  canInteract,
  isDocked,
  nearbyLabel,
}: MobileControlsProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const [stick, setStick] = useState({ x: 0, y: 0, active: false });

  const publish = useCallback((input: VirtualJoystickInput) => {
    setStick(input);
    onJoystickChange(input);
  }, [onJoystickChange]);

  const updateStick = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rawX = clientX - cx;
    const rawY = clientY - cy;
    const distance = Math.min(STICK_RADIUS, Math.hypot(rawX, rawY));
    const angle = Math.atan2(rawY, rawX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    publish({
      x: x / STICK_RADIUS,
      y: y / STICK_RADIUS,
      active: true,
    });
  }, [publish]);

  const resetStick = useCallback(() => {
    activePointerRef.current = null;
    publish({ x: 0, y: 0, active: false });
  }, [publish]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    activePointerRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateStick(e.clientX, e.clientY);
  }, [updateStick]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== e.pointerId) return;
    updateStick(e.clientX, e.clientY);
  }, [updateStick]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    resetStick();
  }, [resetStick]);

  const throttle = Math.max(0, -stick.y);
  const reverse = Math.max(0, stick.y);
  const actionLabel = isDocked ? "Dock" : canInteract ? "Inspect" : "Scan";

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+14px)] z-[70] flex items-end justify-between px-4 md:hidden">
      <div className="pointer-events-auto">
        <div className="mb-2 flex items-center gap-2 pl-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
          <span className="font-label text-[9px] font-black uppercase tracking-[0.22em] text-cyan-50/68">
            Touch Helm
          </span>
        </div>

        <div
          ref={baseRef}
          className="relative h-36 w-36 touch-none rounded-full border border-cyan-100/24 bg-slate-950/48 shadow-[0_20px_50px_rgba(0,0,0,0.34),inset_0_0_28px_rgba(103,232,249,0.08)] backdrop-blur-xl"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={resetStick}
          role="application"
          aria-label="Boat joystick"
        >
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-3 -translate-x-1/2 font-label text-[8px] font-black uppercase tracking-[0.16em] text-cyan-100/42">
            Ahead
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-label text-[8px] font-black uppercase tracking-[0.16em] text-cyan-100/34">
            Astern
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-4 w-px bg-cyan-100/16" />
            <div className="absolute h-px w-4 bg-cyan-100/16" />
          </div>
          <div
            className="absolute left-1/2 top-1/2 grid h-16 w-16 place-items-center rounded-full border border-cyan-100/34 bg-cyan-100/14 shadow-[0_0_22px_rgba(103,232,249,0.22)] transition-shadow"
            style={{
              transform: `translate(calc(-50% + ${stick.x * STICK_RADIUS}px), calc(-50% + ${stick.y * STICK_RADIUS}px))`,
            }}
          >
            <Navigation className="h-7 w-7 text-cyan-50" />
          </div>
        </div>

        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="bg-cyan-300 transition-all" style={{ width: `${throttle * 100}%` }} />
          <span className="ml-auto bg-amber-300 transition-all" style={{ width: `${reverse * 100}%` }} />
        </div>
      </div>

      <div className="pointer-events-auto grid w-[112px] gap-2">
        <button
          onClick={onInteract}
          className={`flex h-12 items-center justify-center gap-2 rounded-[8px] border px-3 font-label text-[10px] font-black uppercase tracking-[0.14em] shadow-lg backdrop-blur-xl transition-colors ${
            canInteract || isDocked
              ? "border-cyan-100/35 bg-cyan-300/22 text-cyan-50"
              : "border-white/10 bg-slate-950/42 text-white/42"
          }`}
          disabled={!canInteract && !isDocked}
        >
          {isDocked ? <Anchor className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          {actionLabel}
        </button>
        <button
          onClick={onMap}
          className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-cyan-100/20 bg-slate-950/48 px-3 font-label text-[10px] font-black uppercase tracking-[0.14em] text-cyan-50/76 shadow-lg backdrop-blur-xl"
        >
          <Map className="h-4 w-4" />
          Map
        </button>
        <button
          onClick={onReturnHome}
          className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-emerald-100/20 bg-emerald-300/12 px-3 font-label text-[10px] font-black uppercase tracking-[0.14em] text-emerald-50/76 shadow-lg backdrop-blur-xl"
        >
          <Home className="h-4 w-4" />
          Home
        </button>
        <Link
          href="/"
          className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-rose-100/20 bg-rose-300/12 px-3 font-label text-[10px] font-black uppercase tracking-[0.14em] text-rose-50/76 shadow-lg backdrop-blur-xl"
        >
          <LogOut className="h-4 w-4" />
          Exit
        </Link>
        {nearbyLabel && (
          <div className="rounded-[8px] border border-white/10 bg-black/38 px-2 py-1.5 text-center font-label text-[8px] font-bold uppercase tracking-[0.12em] text-white/48 backdrop-blur-xl">
            {nearbyLabel}
          </div>
        )}
      </div>
    </div>
  );
}
