"use client";

import type { CSSProperties } from "react";
import styles from "./landing-hero.module.css";

type ActivePanel = "portfolio" | "game" | null;

interface VoyageBackdropProps {
  activePanel: ActivePanel;
  mousePos: { x: number; y: number };
}

const stars = Array.from({ length: 52 }, (_, i) => ({
  x: (i * 19.7 + 6) % 100,
  y: (i * 11.3 + 4) % 58,
  size: 1 + (i % 4) * 0.45,
  alpha: 0.28 + (i % 6) * 0.08,
  duration: 2.6 + (i % 5) * 0.7,
  delay: (i % 9) * -0.36,
}));

const routes = Array.from({ length: 8 }, (_, i) => ({
  left: -8 + i * 15,
  top: 24 + (i % 5) * 9,
  width: 34 + (i % 4) * 11,
  rotate: -16 + (i % 4) * 10,
  delay: i * -0.65,
}));

export function VoyageBackdrop({ activePanel, mousePos }: VoyageBackdropProps) {
  const sweepColor =
    activePanel === "portfolio"
      ? "rgba(255, 213, 145, 0.2)"
      : activePanel === "game"
        ? "rgba(89, 234, 251, 0.2)"
        : "rgba(255, 246, 221, 0.12)";

  const sweepStyle = {
    "--sweep-x": `${mousePos.x * 100}%`,
    "--sweep-y": `${mousePos.y * 100}%`,
    "--sweep-color": sweepColor,
  } as CSSProperties;

  const chartStyle = {
    "--chart-x": `${(mousePos.x - 0.5) * -18}px`,
    "--chart-y": `${(mousePos.y - 0.5) * -10}px`,
  } as CSSProperties;

  return (
    <>
      <div className={styles.backdropBase} />
      <div className={styles.horizon} />
      <div className={styles.chartSea} style={chartStyle} />
      <div className={styles.reactiveSweep} style={sweepStyle} />

      <div
        className={styles.starField}
        style={{
          transform: `translate3d(${(mousePos.x - 0.5) * -12}px, ${(mousePos.y - 0.5) * -10}px, 0)`,
        }}
      >
        {stars.map((star, i) => (
          <span
            key={i}
            className={styles.star}
            style={
              {
                left: `${star.x}%`,
                top: `${star.y}%`,
                "--star-size": `${star.size}px`,
                "--star-alpha": star.alpha,
                "--star-duration": `${star.duration}s`,
                "--star-delay": `${star.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.routeField}>
        {routes.map((route, i) => (
          <span
            key={i}
            className={styles.routeLine}
            style={{
              left: `${route.left}%`,
              top: `${route.top}%`,
              width: `${route.width}%`,
              transform: `rotate(${route.rotate}deg)`,
              animationDelay: `${route.delay}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.noise} />
      <div className={styles.vignette} />
    </>
  );
}
