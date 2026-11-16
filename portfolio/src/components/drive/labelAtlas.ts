/**
 * Every piece of text in the world is drawn once into a single canvas texture, then the
 * quads that show it are merged into one mesh: all signs and ground lettering cost one draw call.
 * No font files are fetched: the page's own web fonts are used once they are ready.
 */
import * as THREE from "three";

export type LabelSpec =
  | { style: "sign"; kicker: string; title: string; accent: string }
  | { style: "ground"; text: string; size: "lg" | "md" | "sm"; color: string };

const CELL_W = 1024;
const CELL_H = 200;
const COLS = 2;

export type AtlasCell = { u0: number; v0: number; u1: number; v1: number; aspect: number };

const DISPLAY = '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif';
const BODY = '"Plus Jakarta Sans", system-ui, sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, maxW: number) {
  let px = start;
  ctx.font = font(px);
  while (px > 18 && ctx.measureText(text).width > maxW) {
    px -= 2;
    ctx.font = font(px);
  }
  return px;
}

/** draws one cell and returns the used width (the quad is cropped to it) */
function drawCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, spec: LabelSpec) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.clearRect(0, 0, CELL_W, CELL_H);
  ctx.textBaseline = "alphabetic";
  if (spec.style === "sign") {
    const pad = 34;
    fit(ctx, spec.title, (px) => `700 ${px}px ${DISPLAY}`, 76, CELL_W - pad * 2 - 20);
    const titleW = ctx.measureText(spec.title).width;
    ctx.font = `600 32px ${BODY}`;
    const kicker = spec.kicker.toUpperCase();
    const kickerW = ctx.measureText(kicker).width + kicker.length * 2.5 + 54;
    const w = Math.min(CELL_W - 8, Math.max(titleW, kickerW) + pad * 2 + 14);
    // board
    ctx.fillStyle = "#fbfaf6";
    roundRect(ctx, 4, 4, w - 8, CELL_H - 8, 14);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(29,35,33,0.16)";
    ctx.stroke();
    // accent rule
    ctx.fillStyle = spec.accent;
    ctx.fillRect(pad, 40, 40, 8);
    // kicker
    ctx.fillStyle = "#5b625e";
    ctx.font = `600 32px ${BODY}`;
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
    ctx.fillText(kicker, pad + 54, 55);
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
    // title
    ctx.fillStyle = "#1d2321";
    fit(ctx, spec.title, (px) => `700 ${px}px ${DISPLAY}`, 76, CELL_W - pad * 2 - 20);
    ctx.fillText(spec.title, pad, 156);
    ctx.restore();
    return w;
  }
  const start = spec.size === "lg" ? 120 : spec.size === "md" ? 84 : 56;
  const weight = spec.size === "sm" ? 600 : 700;
  fit(ctx, spec.text, (px) => `${weight} ${px}px ${spec.size === "sm" ? BODY : DISPLAY}`, start, CELL_W - 20);
  const w = Math.min(CELL_W, ctx.measureText(spec.text).width + 24);
  ctx.fillStyle = spec.color;
  ctx.fillText(spec.text, 12, CELL_H * 0.66);
  ctx.restore();
  return w;
}

export function createAtlas(specs: LabelSpec[]) {
  const rows = Math.ceil(specs.length / COLS);
  const canvas = document.createElement("canvas");
  canvas.width = CELL_W * COLS;
  canvas.height = CELL_H * rows;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const cells: AtlasCell[] = [];

  const draw = () => {
    if (!ctx) return;
    cells.length = 0;
    specs.forEach((spec, i) => {
      const ox = (i % COLS) * CELL_W;
      const oy = Math.floor(i / COLS) * CELL_H;
      const w = drawCell(ctx, ox, oy, spec);
      // canvas y grows down, texture v grows up (flipY)
      cells.push({
        u0: ox / canvas.width,
        u1: (ox + w) / canvas.width,
        v0: 1 - (oy + CELL_H) / canvas.height,
        v1: 1 - oy / canvas.height,
        aspect: w / CELL_H,
      });
    });
    texture.needsUpdate = true;
  };
  draw();
  return { texture, cells, redraw: draw };
}
