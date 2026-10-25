"use client";
/* eslint-disable react-hooks/immutability -- the texture is re-uploaded from inside useFrame by design */

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Logical size of a drawing canvas. Screens are supersampled (backing store = size x scale), but draw code keeps
 * working in the logical units it was written for.
 */
export function logicalSize(ctx: CanvasRenderingContext2D) {
  const c = ctx.canvas;
  return { W: Number(c.dataset.w) || c.width, H: Number(c.dataset.h) || c.height };
}

/** `scale` > 1 supersamples: a screen shown large on a 2-3x display needs more pixels than its layout size. */
export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, scale = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.dataset.w = String(w);
  canvas.dataset.h = String(h);
  const ctx = canvas.getContext("2d")!;
  // logos and photos drawn into screens are downscaled; the default "low" quality aliases them
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, ctx, canvas };
}

/** A redrawable screen: `draw` runs only when `key` changes, then the texture is re-uploaded. */
export function useScreen(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  key: () => string,
  scale = 1
) {
  const screen = useMemo(() => canvasTexture(w, h, () => {}, scale), [w, h, scale]);
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
    screen.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawRef.current(screen.ctx);
    screen.tex.needsUpdate = true;
  });
  return screen.tex;
}
