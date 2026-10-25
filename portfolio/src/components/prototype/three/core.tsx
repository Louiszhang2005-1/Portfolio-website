"use client";
/* eslint-disable react-hooks/immutability -- three.js objects (textures, materials, groups) are mutated per frame
   inside useFrame by design; that is how react-three-fiber animates without re-rendering React. */

import { Environment, Lightformer, PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

import { readTokens } from "./tokens";

export { readTokens, type Tokens } from "./tokens";

/* ---------------------------------------------------------------- math */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Snap to a grid; screen keys use it so springs settling by tiny amounts do not redraw a texture every frame. */
export const quantize = (v: number, step: number) => Math.round(v / step) * step;

/* ---------------------------------------------------------------- shapes */

export function roundedRect(w: number, h: number, r: number, shape = new THREE.Shape()) {
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** Extruded rounded slab, optionally with rounded-rect holes (frames, midframes). Centred on z. */
export function slab(
  w: number,
  h: number,
  r: number,
  depth: number,
  holes: { w: number; h: number; r: number; x?: number; y?: number }[] = [],
  bevel = Math.min(depth * 0.35, 0.012)
) {
  const shape = roundedRect(w, h, r);
  for (const hole of holes) {
    // build the hole centred, then offset its sampled points
    const pts = roundedRect(hole.w, hole.h, hole.r)
      .getPoints(12)
      .map((p) => new THREE.Vector2(p.x + (hole.x ?? 0), p.y + (hole.y ?? 0)));
    shape.holes.push(new THREE.Path(pts));
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0005, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
    curveSegments: 18,
  });
  geo.translate(0, 0, -depth / 2 + bevel);
  return geo;
}

/** Flat rounded panel with 0..1 UVs, for screens that must follow the device's corner radius. */
export function roundedPlane(w: number, h: number, r: number) {
  const geo = new THREE.ShapeGeometry(roundedRect(w, h, r), 16);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return geo;
}

/* ---------------------------------------------------------------- canvas textures */

export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, ctx, canvas };
}

/** A redrawable screen: `draw` runs only when `key` changes, then the texture is re-uploaded. */
export function useScreen(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, key: () => string) {
  const screen = useMemo(() => canvasTexture(w, h, () => {}), [w, h]);
  const last = useRef("");
  const drawRef = useRef(draw);
  useLayoutEffect(() => {
    drawRef.current = draw;
  });
  useLayoutEffect(() => {
    // webfonts load after first paint; redraw once they are ready so canvas text uses Archivo / JetBrains Mono
    document.fonts?.ready.then(() => (last.current = ""));
  }, []);
  useFrame(() => {
    const k = key();
    if (k === last.current) return;
    last.current = k;
    drawRef.current(screen.ctx);
    screen.tex.needsUpdate = true;
  });
  return screen.tex;
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------------------------------------------------------------- materials */

export function useMaterials() {
  return useMemo(() => {
    const t = readTokens();
    const c = (v: string) => new THREE.Color(v);
    return {
      alu: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-alu-hi"]), metalness: 1, roughness: 0.32, envMapIntensity: 1.1 }),
      aluDark: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-alu-mid"]), metalness: 1, roughness: 0.42 }),
      brushed: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-alu-mid"]), metalness: 0.9, roughness: 0.5 }),
      graphite: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-graphite"]), metalness: 0.2, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2 }),
      rubber: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-chip"]), metalness: 0, roughness: 0.75, sheen: 0.4 }),
      pcb: new THREE.MeshStandardMaterial({ color: c(t["--mat-pcb"]), roughness: 0.8 }),
      chip: new THREE.MeshStandardMaterial({ color: c(t["--mat-chip"]), roughness: 0.45, metalness: 0.2 }),
      gold: new THREE.MeshStandardMaterial({ color: c(t["--mat-gold"]), roughness: 0.3, metalness: 1 }),
      steel: new THREE.MeshStandardMaterial({ color: c(t["--mat-steel"]), roughness: 0.35, metalness: 1 }),
      kapton: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-kapton"]), roughness: 0.45, clearcoat: 0.6 }),
      cell: new THREE.MeshStandardMaterial({ color: c(t["--mat-graphite"]), roughness: 0.55 }),
      lens: new THREE.MeshPhysicalMaterial({ color: c(t["--mat-black"]), metalness: 0.4, roughness: 0.05, clearcoat: 1 }),
      ink: new THREE.MeshStandardMaterial({ color: c(t["--mat-ink"]), roughness: 0.4 }),
      led: new THREE.MeshStandardMaterial({ color: c(t["--mat-led"]), emissive: c(t["--mat-led"]), emissiveIntensity: 1.6 }),
      flash: new THREE.MeshStandardMaterial({ color: c(t["--mat-flash"]), emissive: c(t["--mat-flash"]), emissiveIntensity: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.04,
        transparent: true,
        opacity: 0.12,
        clearcoat: 1,
        envMapIntensity: 1.6,
        depthWrite: false,
      }),
    };
  }, []);
}

/* ---------------------------------------------------------------- studio */

/** Key light + rim lights baked into an environment from code: no HDR download, same look in every view. */
export function Studio({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.18 * intensity} />
      <directionalLight position={[2.5, 4, 5]} intensity={2.4 * intensity} />
      <directionalLight position={[-4, 1.5, -2]} intensity={0.7 * intensity} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 3]} scale={[10, 2.5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[-6, 1, 2]} scale={[3, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} position={[6, 0.5, 2]} scale={[3, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.6} position={[0, -4, 4]} scale={5} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

/* ---------------------------------------------------------------- explode + callouts */

export type DeviceMotion = {
  spread: MotionValue<number>;
  fade: MotionValue<number>;
  tilt: MotionValue<number>;
  dive: MotionValue<number>;
};

export type Part = { code: string; name: string; spec: string };

const STAGGER = 0.07;

/**
 * One physical layer. Peels top-first on `spread`, lifts and dissolves as the camera passes it on `dive`.
 * Its callout is page text, re-projected from a 3D anchor every frame so labels stay crisp.
 */
export function Layer3D({
  m,
  index,
  total,
  gap,
  drift = [0, 0],
  anchor,
  label,
  children,
}: {
  m: DeviceMotion;
  index: number;
  total: number;
  gap: number;
  drift?: [number, number];
  anchor?: [number, number, number];
  label?: CalloutRef;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.Material[]>([]);
  const v = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();
  const order = total - 1 - index;

  useLayoutEffect(() => {
    // each layer owns its material instances so it can fade on its own
    const found: THREE.Material[] = [];
    group.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const cloned = Array.isArray(mesh.material) ? mesh.material.map((x) => x.clone()) : mesh.material.clone();
      mesh.material = cloned;
      (Array.isArray(cloned) ? cloned : [cloned]).forEach((mat) => {
        mat.userData.base = mat.opacity;
        mat.transparent = true;
        found.push(mat);
      });
    });
    mats.current = found;
  }, []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const s = m.spread.get();
    const local = easeInOut(clamp01((s - order * STAGGER) / (1 - (total - 1) * STAGGER)));
    const passed = clamp01(m.dive.get() - order);
    g.position.set(local * drift[0], local * drift[1], (index - (total - 1) / 2) * local * gap);
    g.scale.setScalar(1 + passed * 0.3);
    const op = m.fade.get() * (1 - clamp01((passed - 0.35) / 0.4)); // short dissolve: half-faded parts read as grey slabs
    for (const mat of mats.current) {
      mat.opacity = (mat.userData.base as number) * op;
      mat.visible = op > 0.01;
    }
    // report where this part is on screen; CalloutLayout arranges every label at once so none overlap
    if (label && anchor) {
      label.on = clamp01((local - 0.7) / 0.3) * m.fade.get() * clamp01((m.tilt.get() - 0.6) / 0.4);
      if (label.on > 0) {
        v.set(anchor[0], anchor[1], anchor[2]);
        g.localToWorld(v);
        v.project(camera);
        label.ax = ((v.x + 1) / 2) * size.width;
        label.ay = ((1 - v.y) / 2) * size.height;
      }
    }
  });

  return <group ref={group}>{children}</group>;
}

/** One callout's live state: projected anchor (written by Layer3D) and its DOM nodes (written by CalloutLayout). */
export type CalloutRef = {
  ax: number;
  ay: number;
  on: number;
  label: RefObject<HTMLDivElement | null>;
  line: RefObject<SVGPolylineElement | null>;
};
export const makeCallouts = (n: number): CalloutRef[] =>
  Array.from({ length: n }, () => ({ ax: 0, ay: 0, on: 0, label: { current: null }, line: { current: null } }));

/** Label text + its leader line. Positioned by CalloutLayout. */
export function Callout({ part, c }: { part: Part; c: CalloutRef }) {
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible max-lg:hidden">
        <polyline ref={(el) => void (c.line.current = el)} fill="none" stroke="var(--text-tertiary)" strokeWidth="1" opacity="0" />
      </svg>
      <div
        ref={(el) => void (c.label.current = el)}
        className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap opacity-0 max-lg:hidden"
      >
        <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--accent)]" />
        <span className="leading-tight">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text)]">
            <span className="text-[var(--text-tertiary)]">{part.code}</span> {part.name}
          </span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{part.spec}</span>
        </span>
      </div>
    </>
  );
}

/** True from Tailwind's lg breakpoint up, where Callout labels render (they are `max-lg:hidden`). `matches` is live. */
let wideQuery: MediaQueryList | null = null;
export function calloutsShown() {
  if (typeof window === "undefined") return true;
  wideQuery ??= window.matchMedia("(min-width: 1024px)");
  return wideQuery.matches;
}

const ROW = 34; // min vertical distance between labels, px

/**
 * Engineering-drawing callouts: labels sit in one column right of the part in stacking order (callouts[0] is the
 * bottom layer, so it is the lowest label; anchors are chosen to project in the same order, so leaders never cross),
 * pushed apart to a minimum row spacing and kept inside the view; a leader line runs from each part to its label.
 * Mount after the model so it runs after every Layer3D has reported this frame.
 */
export function CalloutLayout({
  callouts,
  target,
  caption,
}: {
  callouts: CalloutRef[];
  target: RefObject<THREE.Group | null>;
  caption?: RefObject<HTMLDivElement | null>;
}) {
  const { size, camera } = useThree();
  const box = useMemo(() => new THREE.Box3(), []);
  const corner = useMemo(() => new THREE.Vector3(), []);
  const captionOp = useRef("");
  useFrame(() => {
    const live = callouts.filter((c) => c.on > 0.01 && c.label.current);
    for (const c of callouts) {
      if (c.on > 0.01) continue;
      if (c.label.current) c.label.current.style.opacity = "0";
      c.line.current?.setAttribute("opacity", "0");
    }
    // the disclaimer shows exactly while labels do, so specs never read as the candidate's own hardware
    const op = live.length ? Math.max(...live.map((c) => c.on)).toFixed(2) : "0";
    if (caption?.current && op !== captionOp.current) {
      captionOp.current = op;
      caption.current.style.opacity = op;
    }
    if (!live.length) return;
    // start the column right of the device's measured on-screen extent, so no part is ever drawn over a label
    let right = Math.max(...live.map((c) => c.ax));
    if (target.current) {
      box.setFromObject(target.current);
      for (let i = 0; i < 8; i++) {
        corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
        corner.project(camera);
        right = Math.max(right, ((corner.x + 1) / 2) * size.width);
      }
    }
    const colX = Math.min(right + 28, size.width - 200);
    const sorted = [...live].sort((a, b) => callouts.indexOf(b) - callouts.indexOf(a));
    const ys = sorted.map((c) => c.ay);
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + ROW);
    // if the column overflows the bottom, slide it up (never above the top margin)
    const overflow = ys[ys.length - 1] - (size.height - 24);
    if (overflow > 0) for (let i = 0; i < ys.length; i++) ys[i] = Math.max(24 + i * ROW, ys[i] - overflow);
    sorted.forEach((c, i) => {
      const el = c.label.current!;
      el.style.opacity = String(c.on);
      el.style.transform = `translate(${colX}px, ${ys[i] - 12}px)`;
      const line = c.line.current;
      if (line) {
        line.setAttribute("points", `${c.ax},${c.ay} ${colX - 18},${ys[i]} ${colX - 4},${ys[i]}`);
        line.setAttribute("opacity", String(c.on * 0.8));
      }
    });
  });
  return null;
}

/* ---------------------------------------------------------------- view + camera fit */

/**
 * Frames the subject: moves the camera so a `w` x `h` box fills `fill` of the view, whatever its aspect.
 * Replaces the CSS Fit wrapper; the 3D device always reads large without spilling under the nav.
 */
export function FitCamera({
  w,
  h,
  fill = 0.86,
  fov = 28,
  y = 0,
  lookY = 0,
  pose,
}: {
  w: number;
  h: number;
  fill?: number;
  fov?: number;
  y?: number;
  lookY?: number;
  /** optional per-frame camera height / aim (e.g. follow a laptop lid); distance still comes from the fit */
  pose?: () => { y: number; lookY: number };
}) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const fitted = useRef({ w: -1, h: -1, dist: 1, y: NaN, lookY: NaN });
  const { size } = useThree();
  useFrame(() => {
    const c = cam.current;
    if (!c) return;
    const f = fitted.current;
    const p = pose ? pose() : { y, lookY };
    // the framing only depends on the view's size, so skip the projection rebuild unless it changed
    if (f.w !== size.width || f.h !== size.height) {
      const aspect = size.width / Math.max(1, size.height);
      const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
      f.dist = Math.max(h / fill / 2 / t, w / fill / 2 / (t * aspect));
      f.w = size.width;
      f.h = size.height;
      f.y = NaN;
      c.aspect = aspect;
      c.fov = fov;
      c.updateProjectionMatrix();
    }
    if (p.y === f.y && p.lookY === f.lookY) return;
    f.y = p.y;
    f.lookY = p.lookY;
    c.position.set(0, p.y, f.dist);
    c.lookAt(0, p.lookY, 0);
  });
  return <PerspectiveCamera ref={cam} makeDefault near={0.05} far={100} />;
}

/* How many DeviceViews are on screen. ThreeRoot subscribes and stops the render loop at zero. */
let visibleViews = 0;
const viewListeners = new Set<() => void>();
export function subscribeDeviceViews(fn: () => void) {
  viewListeners.add(fn);
  return () => void viewListeners.delete(fn);
}
export const anyDeviceViewVisible = () => visibleViews > 0;
function countView(delta: number) {
  visibleViews += delta;
  viewListeners.forEach((fn) => fn());
}

/**
 * A device viewport: the shared canvas draws into this box; overlays (callouts) sit on top as DOM.
 * The canvas itself is invisible to assistive tech, so the box is an image with a spoken description.
 */
export function DeviceView({
  children,
  overlay,
  label,
  caption,
}: {
  children: ReactNode;
  overlay?: ReactNode;
  label: string;
  caption?: RefObject<HTMLDivElement | null>;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let on = false;
    // a margin so the loop is already running when the device's first pixels scroll in
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === on) return;
        on = entry.isIntersecting;
        countView(on ? 1 : -1);
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (on) countView(-1);
    };
  }, []);
  return (
    <div ref={box} role="img" aria-label={label} className="relative h-full min-h-0 w-full min-w-0">
      <View className="absolute inset-0">{children}</View>
      {overlay && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {overlay}
          {caption && (
            <div
              ref={caption}
              className="absolute bottom-3 right-3 text-[11px] text-[var(--text-tertiary)] opacity-0 max-lg:hidden"
            >
              Illustrative teardown of a generic device
            </div>
          )}
        </div>
      )}
    </div>
  );
}
