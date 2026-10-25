"use client";

import { motion, transform, useTransform, type MotionValue } from "framer-motion";
import { FileText, FolderKanban, Gamepad2, Mail } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ACCENT, ALU, AluRing, Cell, Glass, KAPTON, Lens, Midframe, PhoneBoard, WatchBoard } from "./parts";

/**
 * Scroll-linked range mapping through a JS callback. Plain `useTransform(mv, input, output)` on scroll
 * progress gets offloaded to a native scroll timeline, which left opacity stuck mid-fade here.
 */
export function useMap(mv: MotionValue<number>, input: number[], output: number[]): MotionValue<number>;
export function useMap(mv: MotionValue<number>, input: number[], output: string[]): MotionValue<string>;
export function useMap(mv: MotionValue<number>, input: number[], output: number[] | string[]) {
  const map = transform<number | string>(input, output);
  return useTransform(mv, (v) => map(v)) as MotionValue<number> & MotionValue<string>;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Gap between exploded layers, in px of depth. */
const GAP = 76;
/** Delay between one layer lifting and the next, as a share of the explode. */
const STAGGER = 0.07;

export type Part = { code: string; name: string; spec: string };

export type Motion = {
  /** 0 assembled → 1 exploded; layers peel top-first, one after another */
  spread: MotionValue<number>;
  /** device visibility */
  fade: MotionValue<number>;
  /** 0 flat → 1 isometric; drives the counter-rotation that keeps callouts readable */
  tilt: MotionValue<number>;
  /** camera depth: n = the top n layers have flown past the viewer */
  dive: MotionValue<number>;
};

function Layer({
  m,
  index,
  total,
  drift = [0, 0],
  part,
  children,
}: {
  m: Motion;
  index: number;
  total: number;
  drift?: [number, number];
  part?: Part;
  children: ReactNode;
}) {
  const order = total - 1 - index; // top layer lifts first and is the first one the camera passes
  const local = useTransform(m.spread, (s) =>
    easeInOut(clamp01((s - order * STAGGER) / (1 - (total - 1) * STAGGER)))
  );
  const z = useTransform(local, (l) => (index - (total - 1) / 2) * l * GAP);
  const x = useTransform(local, (l) => l * drift[0]);
  const y = useTransform(local, (l) => l * drift[1]);
  // a passing layer lifts a little and dissolves; scaling it huge swept hard-edged planes across the copy
  const passed = useTransform(m.dive, (d) => clamp01(d - order));
  const scale = useTransform(passed, (p) => 1 + p * 0.3);
  const lift = useTransform(passed, (p) => 1 - clamp01((p - 0.45) / 0.55));
  const labelOn = useTransform(local, (l) => clamp01((l - 0.7) / 0.3));
  // counter-rotate to face the viewer, then float toward them so the layers above never cover the callout
  const labelTransform = useTransform(m.tilt, (t) => `rotateZ(${t * 38}deg) rotateX(${-t * 58}deg) translateZ(${t * 140}px)`);

  // Each opacity is its own single-input value on nested leaves: combined motion values (useTransform over
  // an array) were not recomputed reliably on scroll jumps. Never put opacity on a preserve-3d node either,
  // it flattens the stack.
  return (
    <motion.div className="absolute inset-0" style={{ x, y, z, scale, transformStyle: "preserve-3d" }}>
      <motion.div className="absolute inset-0" style={{ opacity: m.fade }}>
        <motion.div className="absolute inset-0" style={{ opacity: lift }}>
          {children}
        </motion.div>
      </motion.div>
      {part && (
        <motion.div
          className="pointer-events-none absolute left-full top-[calc(50%-12px)] pl-2 max-lg:hidden"
          style={{ opacity: m.fade, transform: labelTransform, transformOrigin: "left center" }}
        >
          <motion.div style={{ opacity: labelOn }} className="flex items-start gap-2 whitespace-nowrap">
            <span className="mt-[6px] h-px w-16 bg-[var(--mat-alu-lo)]" />
            <span className="mt-[3px] h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: ACCENT }} />
            <span className="leading-tight">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text)]">
                <span className="text-[var(--text-tertiary)]">{part.code}</span> {part.name}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{part.spec}</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

function useClock() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, ""));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 15000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return time;
}

const WALLPAPER =
  "radial-gradient(90% 60% at 75% 15%,rgba(var(--accent-rgb),0.32) 0%,transparent 60%),radial-gradient(80% 60% at 15% 95%,var(--mat-graphite) 0%,transparent 60%),var(--mat-ink)";

export function Watch({ m, notif }: { m: Motion; notif: MotionValue<number> }) {
  const time = useClock();
  const notifY = useMap(notif, [0, 1], [-20, 0]);
  // the face dims as the notification lands, like a real watch, so the two never print over each other
  const faceDim = useMap(notif, [0, 0.15], [1, 0]);
  const L = { m, total: 7 };

  return (
    <div className="relative h-[232px] w-[194px]" style={{ transformStyle: "preserve-3d" }}>
      <Layer {...L} index={0} part={{ code: "W1", name: "Band", spec: "Fluoroelastomer" }}>
        <div
          className="absolute -bottom-[104px] -top-[104px] left-1/2 w-[128px] -translate-x-1/2 rounded-[42px]"
          style={{
            background:
              "repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 6px),linear-gradient(90deg,var(--mat-chip),var(--mat-graphite) 50%,var(--mat-chip))",
            // band ends fade into the studio dark, so a large watch never runs a hard edge into the copy
            maskImage: "linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%)",
          }}
        />
      </Layer>
      <Layer {...L} index={1} part={{ code: "W2", name: "Sensor array", spec: "Optical HR · 4 LED" }}>
        <div className="absolute inset-0 flex items-center justify-center rounded-[56px] bg-[var(--mat-chip)]">
          <div className="relative h-24 w-24 rounded-full border border-[var(--border)] bg-[radial-gradient(circle,var(--mat-chip),var(--mat-ink))]">
            {[0, 90, 180, 270].map((a) => (
              <span
                key={a}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[var(--mat-led)] shadow-[0_0_6px_var(--mat-led)]"
                style={{ transform: `rotate(${a}deg) translate(26px) translate(-50%,-50%)` }}
              />
            ))}
            <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-[var(--mat-graphite)]" />
          </div>
        </div>
      </Layer>
      <Layer {...L} index={2} part={{ code: "W3", name: "Cell", spec: "Li-ion · 308 mAh" }}>
        <Cell className="absolute inset-6 rounded-[36px]" lines={["Li-ion", "3.85 V", "308 mAh"]} />
      </Layer>
      <Layer {...L} index={3} drift={[-14, 0]} part={{ code: "W4", name: "System in package", spec: "SiP · BLE · IMU" }}>
        <div className="absolute inset-5">
          <WatchBoard />
        </div>
      </Layer>
      <Layer {...L} index={4} part={{ code: "W5", name: "Case", spec: "6000-series Al" }}>
        <AluRing radius={50} width={11} />
        <div
          className="absolute -right-[12px] top-[64px] h-[38px] w-[14px] rounded-[4px]"
          style={{ background: "repeating-linear-gradient(0deg,var(--mat-alu-hi) 0 2px,var(--mat-steel) 2px 4px)" }}
        />
        <div className="absolute -right-[7px] top-[118px] h-[30px] w-[8px] rounded-[3px]" style={{ background: ALU }} />
      </Layer>
      <Layer {...L} index={5} part={{ code: "W6", name: "OLED panel", spec: "1.9 in · LTPO" }}>
        <div className="absolute inset-[11px] overflow-hidden rounded-[44px] bg-[var(--mat-black)]">
          <motion.div style={{ opacity: faceDim }} className="flex h-full flex-col items-center justify-center gap-1 text-[var(--text)]">
            <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--text-tertiary)]">LOUIS ZHANG</span>
            <span className="font-headline text-5xl font-semibold tabular-nums tracking-tight">{time}</span>
            <div className="mt-2 flex gap-2">
              {["ME", "HW", "SW"].map((t, i) => (
                <span
                  key={t}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold text-[var(--text)]"
                  style={{ borderColor: i === 0 ? ACCENT : i === 1 ? "var(--mat-alu-mid)" : "var(--mat-alu-lo)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: notif, y: notifY }}
            className="absolute inset-x-3 top-5 rounded-2xl border border-[var(--border)] bg-[var(--mat-chip)]/95 p-3 text-left"
          >
            <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-wider text-[var(--text-tertiary)]">
              <span>Louis</span>
              <span>now</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-[var(--text)]">
              Mechanical engineering student. Hardware + software.
            </p>
          </motion.div>
        </div>
      </Layer>
      <Layer {...L} index={6} part={{ code: "W7", name: "Cover glass", spec: "Sapphire · 0.6 mm" }}>
        <Glass radius={56} />
      </Layer>
    </div>
  );
}

const apps = [
  ["SolidWorks", "SW"],
  ["CATIA V6", "CA"],
  ["AutoCAD", "AC"],
  ["FEA", "FE"],
  ["GD&T", "GD"],
  ["Python", "Py"],
  ["TypeScript", "TS"],
  ["Next.js", "Nx"],
  ["ROS 2", "R2"],
  ["Arduino", "Ar"],
  ["Raspberry Pi", "Pi"],
  ["PLC", "PL"],
] as const;

const dock = [Mail, FolderKanban, FileText, Gamepad2];

function AppIcon({ progress, index, name, mark }: { progress: MotionValue<number>; index: number; name: string; mark: string }) {
  const start = 0.935 + index * 0.003;
  const opacity = useMap(progress, [start, start + 0.012], [0, 1]);
  const y = useMap(progress, [start, start + 0.012], [10, 0]);
  return (
    <motion.div style={{ opacity, y }} className="flex flex-col items-center gap-1">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--border)] font-mono text-[13px] font-bold"
        style={{
          color: index === 0 ? "var(--accent-ink)" : "var(--text)",
          background: index === 0 ? ACCENT : "linear-gradient(180deg,var(--mat-graphite),var(--mat-chip))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {mark}
      </div>
      <span className="max-w-[54px] truncate text-[8.5px] text-[var(--text-secondary)]">{name}</span>
    </motion.div>
  );
}

const screws: [number, number][] = [
  [30, 30],
  [210, 30],
  [30, 460],
  [210, 460],
  [120, 470],
  [120, 20],
];

function Screws({ out }: { out: MotionValue<number> }) {
  const z = useMap(out, [0, 1], [260, 520]);
  const opacity = useMap(out, [0, 0.15, 0.7, 1], [0, 1, 1, 0]);
  const spread = useMap(out, [0, 1], [0, 1]);
  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ z, opacity }}>
      {screws.map(([sx, sy]) => (
        <Screw key={`${sx}-${sy}`} x={sx} y={sy} spread={spread} />
      ))}
    </motion.div>
  );
}

function Screw({ x, y, spread }: { x: number; y: number; spread: MotionValue<number> }) {
  const dx = useTransform(spread, (s) => (x - 120) * s * 0.9);
  const dy = useTransform(spread, (s) => (y - 245) * s * 0.5);
  const rotate = useTransform(spread, (s) => s * 720);
  return (
    <motion.span
      className="absolute h-3 w-3 rounded-full"
      style={{
        left: x - 6,
        top: y - 6,
        x: dx,
        y: dy,
        rotate,
        background: "radial-gradient(circle at 35% 35%,var(--mat-alu-hi),var(--mat-alu-mid) 55%,var(--mat-alu-lo))",
        boxShadow: "inset 0 0 0 1px var(--mat-chip-edge)",
      }}
    >
      <span className="absolute left-1/2 top-1/2 h-[6px] w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-[var(--mat-alu-lo)]" />
    </motion.span>
  );
}

const code = [
  ["const", " risk = spread(fires, wind);"],
  ["if", " (risk.etaHours < 3) {"],
  ["  await", " notify(home, \"EVACUATE\");"],
  ["}", ""],
  ["", ""],
  ["export", " function route(graph, t) {"],
  ["  return", " astar(graph, closed(t));"],
  ["}", ""],
];

function CodeScreen({ on }: { on: MotionValue<number> }) {
  return (
    <motion.div style={{ opacity: on }} className="absolute inset-0 bg-[var(--mat-ink)] px-4 pt-12 font-mono text-[9px] leading-[1.9]">
      <div className="mb-3 flex gap-1.5">
        {["trace.ts", "route.ts"].map((f, i) => (
          <span key={f} className={`rounded px-2 py-0.5 ${i === 0 ? "bg-[var(--border)] text-[var(--text)]" : "text-[var(--text-tertiary)]"}`}>
            {f}
          </span>
        ))}
      </div>
      {code.map(([kw, rest], i) => (
        <div key={i} className="flex gap-3 whitespace-pre">
          <span className="w-3 text-right text-[var(--text-tertiary)]">{i + 1}</span>
          <span>
            <span style={{ color: ACCENT }}>{kw}</span>
            <span className="text-[var(--text-secondary)]">{rest}</span>
          </span>
        </div>
      ))}
      <span className="ml-6 mt-1 inline-block h-3 w-1.5 animate-pulse bg-[var(--text-secondary)]" />
    </motion.div>
  );
}

export function Phone({
  m,
  lockOn,
  homeOn,
  codeOn,
  screwsOut,
  progress,
}: {
  m: Motion;
  lockOn: MotionValue<number>;
  homeOn: MotionValue<number>;
  codeOn: MotionValue<number>;
  screwsOut: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const time = useClock();
  const L = { m, total: 8 };

  return (
    <div className="relative h-[490px] w-[240px]" style={{ transformStyle: "preserve-3d" }}>
      <Layer {...L} index={0} part={{ code: "P8", name: "Back glass", spec: "Matte · 0.8 mm" }}>
        <div
          className="absolute inset-0 rounded-[46px] border border-[var(--border)]"
          style={{ background: "radial-gradient(120% 80% at 30% 0%,var(--mat-graphite-hi),var(--mat-graphite) 60%,var(--mat-chip))" }}
        >
          <div className="absolute left-4 top-4 h-[104px] w-[104px] rounded-[30px] border border-[var(--border)] bg-[var(--mat-graphite)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <span className="absolute left-[10px] top-[10px] h-10 w-10 rounded-full bg-[var(--mat-black)]/80 ring-2 ring-[var(--mat-alu-lo)]" />
            <span className="absolute left-[10px] top-[54px] h-10 w-10 rounded-full bg-[var(--mat-black)]/80 ring-2 ring-[var(--mat-alu-lo)]" />
            <span className="absolute left-[56px] top-[32px] h-10 w-10 rounded-full bg-[var(--mat-black)]/80 ring-2 ring-[var(--mat-alu-lo)]" />
            <span className="absolute right-[12px] top-[12px] h-3 w-3 rounded-full bg-[var(--mat-flash)]" />
            <span className="absolute bottom-[12px] right-[14px] h-2.5 w-2.5 rounded-full bg-[var(--mat-black)] ring-1 ring-[var(--mat-alu-lo)]" />
          </div>
        </div>
      </Layer>
      <Layer {...L} index={1} drift={[-30, -20]} part={{ code: "P7", name: "Camera modules", spec: "48 MP · OIS · LiDAR" }}>
        <div className="absolute left-4 top-4 h-[104px] w-[104px]">
          {[
            [10, 10],
            [10, 54],
            [56, 32],
          ].map(([l, t]) => (
            <span
              key={`${l}-${t}`}
              className="absolute flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--mat-graphite)]"
              style={{ left: l, top: t }}
            >
              <Lens size={30} />
            </span>
          ))}
          <svg className="absolute inset-0 overflow-visible" viewBox="0 0 104 104">
            <path d="M50 30 C70 20 90 40 120 40" strokeWidth="6" fill="none" opacity="0.9" style={{ stroke: KAPTON }} />
          </svg>
        </div>
      </Layer>
      <Layer {...L} index={2} drift={[18, 10]} part={{ code: "P6", name: "Cell", spec: "Li-ion · 4,000 mAh" }}>
        <Cell
          className="absolute bottom-[78px] left-7 right-7 top-[176px] rounded-[14px]"
          lines={["Li-ion polymer", "3.87 V ⎓ 4,000 mAh", "15.48 Wh"]}
        />
      </Layer>
      <Layer {...L} index={3} drift={[-18, -8]} part={{ code: "P5", name: "Logic board", spec: "10-layer HDI" }}>
        <div className="absolute left-5 right-5 top-5 h-[150px]">
          <PhoneBoard />
        </div>
      </Layer>
      <Layer {...L} index={4} part={{ code: "P4", name: "Midframe", spec: "7000-series Al · taptic" }}>
        <Midframe />
      </Layer>
      <Layer {...L} index={5} part={{ code: "P3", name: "Frame + buttons", spec: "Anodised Al · antenna" }}>
        <AluRing radius={42} width={8} />
        {[
          ["-right-[10px]", "top-[130px]", "h-[70px]"],
          ["-left-[10px]", "top-[110px]", "h-[44px]"],
          ["-left-[10px]", "top-[164px]", "h-[44px]"],
        ].map((c) => (
          <span key={c.join()} className={`absolute w-[6px] rounded ${c.join(" ")}`} style={{ background: ALU }} />
        ))}
        {/* antenna breaks */}
        <span className="absolute left-[60px] top-0 h-[8px] w-[3px] bg-[var(--mat-alu-lo)]" />
        <span className="absolute bottom-0 right-[60px] h-[8px] w-[3px] bg-[var(--mat-alu-lo)]" />
      </Layer>
      <Layer {...L} index={6} part={{ code: "P2", name: "OLED panel", spec: "6.1 in · 460 ppi" }}>
        <div className="absolute inset-[8px] overflow-hidden rounded-[38px] bg-[var(--mat-black)]">
          <div
            className="absolute inset-0"
            style={{ background: "repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 3px)" }}
          />
          <CodeScreen on={codeOn} />
          {/* home screen */}
          <motion.div
            style={{ opacity: homeOn, background: WALLPAPER }}
            className="absolute inset-0 flex flex-col px-4 pb-4 pt-12"
          >
            <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              {apps.map(([name, mark], i) => (
                <AppIcon key={name} progress={progress} index={i} name={name} mark={mark} />
              ))}
            </div>
            <div className="mt-auto flex justify-around rounded-[22px] border border-[var(--border)] bg-[var(--border)] px-2 py-2.5">
              {dock.map((Icon, i) => (
                <div key={i} className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--border)]">
                  <Icon className="h-5 w-5 text-[var(--text)]" strokeWidth={1.6} />
                </div>
              ))}
            </div>
          </motion.div>
          {/* lock screen */}
          <motion.div
            style={{ opacity: lockOn, background: WALLPAPER }}
            className="absolute inset-0 flex flex-col items-center px-5 pt-14 text-[var(--text)]"
          >
            <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--text-secondary)]">FRIDAY</span>
            <span className="font-headline text-6xl font-semibold tabular-nums tracking-tight">{time}</span>
            <div className="mb-6 mt-auto w-full rounded-2xl border border-[var(--border)] bg-[var(--mat-black)]/40 p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full font-mono text-sm font-bold text-[var(--accent-ink)]"
                  style={{ background: ACCENT }}
                >
                  LZ
                </span>
                <div>
                  <p className="text-sm font-bold">Louis Zhang</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">Mech. Eng. · Polytechnique Montréal</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-snug text-[var(--text-secondary)]">Designs the enclosure. Writes what runs on it.</p>
            </div>
            <span className="mb-3 h-1 w-24 rounded-full bg-[var(--text-secondary)]" />
          </motion.div>
          <div className="absolute left-1/2 top-3 h-6 w-20 -translate-x-1/2 rounded-full bg-[var(--mat-black)]" />
        </div>
      </Layer>
      <Layer {...L} index={7} part={{ code: "P1", name: "Cover glass", spec: "Ceramic-glass · 0.7 mm" }}>
        <Glass radius={46} />
      </Layer>
      <Screws out={screwsOut} />
    </div>
  );
}
