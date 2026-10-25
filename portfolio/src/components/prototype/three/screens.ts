import type { PortfolioItem } from "@/lib/portfolio";
import { clamp01, readTokens, wrapText } from "./core";

/**
 * Canvas drawings for the 3D devices' screens. Same content as the old CSS screens, drawn into textures so it
 * sits under real glass. Colours come from the CSS tokens; fonts are the page webfonts.
 */

const DISPLAY = "Archivo, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export const clockTime = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
export const weekday = () => new Date().toLocaleDateString([], { weekday: "long" }).toUpperCase();

/* ---------------------------------------------------------------- watch (360 x 440) */

export function drawWatch(ctx: CanvasRenderingContext2D, notif: number) {
  const t = readTokens();
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.globalAlpha = 1;
  ctx.fillStyle = t["--mat-black"];
  ctx.fillRect(0, 0, W, H);

  // face dims away before the notification card gets opaque, so they never print over each other
  ctx.globalAlpha = clamp01(1 - notif / 0.15);
  ctx.textAlign = "center";
  ctx.fillStyle = t["--text-tertiary"];
  ctx.font = `500 17px ${MONO}`;
  ctx.letterSpacing = "5px";
  ctx.fillText("LOUIS ZHANG", W / 2, 130);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = t["--text"];
  ctx.font = `600 104px ${DISPLAY}`;
  ctx.fillText(clockTime(), W / 2, 240);
  const rings: [string, string][] = [
    ["ME", t["--accent"]],
    ["HW", t["--mat-alu-mid"]],
    ["SW", t["--mat-alu-lo"]],
  ];
  rings.forEach(([label, color], i) => {
    const x = W / 2 + (i - 1) * 78;
    ctx.beginPath();
    ctx.arc(x, 312, 28, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = t["--text"];
    ctx.font = `700 17px ${MONO}`;
    ctx.fillText(label, x, 318);
  });

  // notification
  if (notif > 0.01) {
    ctx.globalAlpha = notif;
    const y = 52 - (1 - notif) * 24;
    rr(ctx, 22, y, W - 44, 168, 30);
    ctx.fillStyle = t["--surface-alt"];
    ctx.fill();
    ctx.textAlign = "left";
    ctx.font = `500 14px ${MONO}`;
    ctx.fillStyle = t["--text-tertiary"];
    ctx.fillText("LOUIS", 46, y + 40);
    ctx.textAlign = "right";
    ctx.fillText("NOW", W - 46, y + 40);
    ctx.textAlign = "left";
    ctx.fillStyle = t["--text"];
    ctx.font = `600 24px ${DISPLAY}`;
    wrapText(ctx, "Mechanical engineering student. Hardware + software.", W - 92).forEach((line, i) =>
      ctx.fillText(line, 46, y + 78 + i * 30)
    );
  }
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------- phone (540 x 1150) */

const APPS = [
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
];

const CODE: [string, string][] = [
  ["const", " risk = spread(fires, wind);"],
  ["if", " (risk.etaHours < 3) {"],
  ["  await", ' notify(home, "EVACUATE");'],
  ["}", ""],
  ["", ""],
  ["export", " function route(graph, t) {"],
  ["  return", " astar(graph, closed(t));"],
  ["}", ""],
];

function wallpaper(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const t = readTokens();
  ctx.fillStyle = t["--mat-ink"];
  ctx.fillRect(0, 0, W, H);
  const g1 = ctx.createRadialGradient(W * 0.78, H * 0.12, 0, W * 0.78, H * 0.12, W * 0.95);
  g1.addColorStop(0, `rgba(${t["--accent-rgb"]},0.42)`);
  g1.addColorStop(1, `rgba(${t["--accent-rgb"]},0)`);
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.1, H * 0.95, 0, W * 0.1, H * 0.95, W);
  g2.addColorStop(0, t["--mat-graphite-hi"]);
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
}

export function drawPhone(
  ctx: CanvasRenderingContext2D,
  s: { lock: number; home: number; code: number; progress: number }
) {
  const t = readTokens();
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.globalAlpha = 1;
  ctx.fillStyle = t["--mat-black"];
  ctx.fillRect(0, 0, W, H);
  // faint pixel grid so the panel reads as a display even when off
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

  if (s.home > 0.01) {
    ctx.globalAlpha = s.home;
    wallpaper(ctx, W, H);
    APPS.forEach(([name, mark], i) => {
      const start = 0.935 + i * 0.003;
      const a = clamp01((s.progress - start) / 0.012) * s.home;
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 44 + col * 118;
      const y = 150 + row * 150 + (1 - a) * 14;
      rr(ctx, x, y, 96, 96, 24);
      ctx.fillStyle = i === 0 ? t["--accent"] : t["--surface-hover"];
      ctx.fill();
      ctx.textAlign = "center";
      ctx.fillStyle = i === 0 ? t["--accent-ink"] : t["--text"];
      ctx.font = `700 30px ${MONO}`;
      ctx.fillText(mark, x + 48, y + 59);
      ctx.fillStyle = t["--text-secondary"];
      ctx.font = `500 18px ${DISPLAY}`;
      ctx.fillText(name.length > 11 ? name.slice(0, 10) + "…" : name, x + 48, y + 124);
    });
    // dock
    ctx.globalAlpha = s.home;
    rr(ctx, 30, H - 170, W - 60, 130, 44);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      rr(ctx, 62 + i * 112, H - 150, 90, 90, 22);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fill();
    }
  }

  if (s.lock > 0.01) {
    ctx.globalAlpha = s.lock;
    wallpaper(ctx, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = t["--text-secondary"];
    ctx.font = `500 22px ${MONO}`;
    ctx.letterSpacing = "6px";
    ctx.fillText(weekday(), W / 2, 200);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = t["--text"];
    ctx.font = `600 160px ${DISPLAY}`;
    ctx.fillText(clockTime(), W / 2, 360);
    // contact card
    const cy = H - 380;
    rr(ctx, 34, cy, W - 68, 250, 40);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(108, cy + 78, 42, 0, Math.PI * 2);
    ctx.fillStyle = t["--accent"];
    ctx.fill();
    ctx.fillStyle = t["--accent-ink"];
    ctx.font = `700 30px ${MONO}`;
    ctx.fillText("LZ", 108, cy + 89);
    ctx.textAlign = "left";
    ctx.fillStyle = t["--text"];
    ctx.font = `600 34px ${DISPLAY}`;
    ctx.fillText("Louis Zhang", 170, cy + 72);
    ctx.fillStyle = t["--text-secondary"];
    ctx.font = `400 22px ${DISPLAY}`;
    ctx.fillText("Mech. Eng. · Polytechnique Montréal", 170, cy + 106);
    ctx.fillStyle = t["--text"];
    ctx.font = `400 26px ${DISPLAY}`;
    ctx.fillText("Designs the enclosure.", 66, cy + 172);
    ctx.fillText("Writes what runs on it.", 66, cy + 208);
    rr(ctx, W / 2 - 90, H - 60, 180, 8, 4);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();
  }

  if (s.code > 0.01) {
    ctx.globalAlpha = s.code;
    ctx.fillStyle = t["--mat-ink"];
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "left";
    ["trace.ts", "route.ts"].forEach((f, i) => {
      rr(ctx, 40 + i * 150, 140, 136, 46, 10);
      ctx.fillStyle = i === 0 ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0)";
      ctx.fill();
      ctx.fillStyle = i === 0 ? t["--text"] : t["--text-tertiary"];
      ctx.font = `500 22px ${MONO}`;
      ctx.fillText(f, 58 + i * 150, 171);
    });
    CODE.forEach(([kw, rest], i) => {
      const y = 260 + i * 56;
      ctx.fillStyle = t["--text-tertiary"];
      ctx.font = `400 24px ${MONO}`;
      ctx.fillText(String(i + 1), 40, y);
      ctx.fillStyle = t["--accent"];
      ctx.fillText(kw, 84, y);
      const kwW = ctx.measureText(kw).width;
      ctx.fillStyle = t["--text-secondary"];
      ctx.fillText(rest, 84 + kwW, y);
    });
    ctx.fillStyle = t["--text"];
    ctx.fillRect(84, 260 + CODE.length * 56 - 22, 12, 28);
  }

  // dynamic island
  ctx.globalAlpha = 1;
  rr(ctx, W / 2 - 84, 36, 168, 48, 24);
  ctx.fillStyle = t["--mat-black"];
  ctx.fill();
}

/* ---------------------------------------------------------------- laptop (1280 x 800) */

const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0];
const company = (job: PortfolioItem) => job.title.split(" ")[0];

export function drawLaptop(
  ctx: CanvasRenderingContext2D,
  s: { screen: number; track: number },
  jobs: PortfolioItem[],
  logos: Record<string, HTMLImageElement>
) {
  const t = readTokens();
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.globalAlpha = 1;
  ctx.fillStyle = t["--mat-black"];
  ctx.fillRect(0, 0, W, H);
  if (s.screen < 0.01) return;
  ctx.globalAlpha = s.screen;
  wallpaper(ctx, W, H);

  // menu bar with the internship timeline
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, W, 44);
  ctx.textAlign = "left";
  ctx.fillStyle = t["--text"];
  ctx.font = `600 20px ${DISPLAY}`;
  ctx.fillText("Experience", 24, 29);
  const x0 = 200;
  const x1 = W - 160;
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x0, 22, x1 - x0, 2);
  ctx.fillStyle = t["--text-secondary"];
  ctx.font = `500 17px ${DISPLAY}`;
  jobs.forEach((j, i) => ctx.fillText(company(j), x0 + (i / jobs.length) * (x1 - x0) + 12, 29));
  const mx = x0 + (Math.min(s.track, jobs.length - 0.001) / jobs.length) * (x1 - x0);
  ctx.beginPath();
  ctx.arc(mx, 23, 7, 0, Math.PI * 2);
  ctx.fillStyle = t["--accent"];
  ctx.fill();
  ctx.textAlign = "right";
  ctx.fillStyle = t["--text-secondary"];
  ctx.fillText(`${jobs.length} roles`, W - 24, 29);

  // windows, back to front
  const WW = 720;
  const WH = 430;
  const order = jobs
    .map((job, i) => ({ job, rel: i + 0.5 - s.track }))
    .sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
  for (const { job, rel } of order) {
    const x = rel > 0 ? rel * 70 : rel * 260;
    const y = rel > 0 ? -rel * 26 : 0;
    const sc = 1 - Math.abs(rel) * 0.07;
    const op = rel < -0.5 ? clamp01(1 + (rel + 0.5) * 2.2) : clamp01(1 - (rel - 0.5) * 0.3);
    const content = clamp01(1 - (Math.abs(rel) - 0.5) * 4);
    if (op <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = s.screen * op;
    ctx.translate(W / 2 + x, H / 2 + 22 + y);
    ctx.scale(sc, sc);
    ctx.translate(-WW / 2, -WH / 2);
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    rr(ctx, 0, 0, WW, WH, 16);
    ctx.fillStyle = t["--surface-alt"];
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // title bar
    ctx.fillStyle = t["--surface-hover"];
    rr(ctx, 0, 0, WW, 46, [16, 16, 0, 0]);
    ctx.fill();
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(26 + d * 24, 23, 7, 0, Math.PI * 2);
      ctx.fillStyle = t["--mat-alu-lo"];
      ctx.fill();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = t["--text-secondary"];
    ctx.font = `500 17px ${DISPLAY}`;
    ctx.fillText(company(job), 112, 29);

    ctx.globalAlpha = s.screen * op * content;
    const logo = job.image ? logos[job.image] : undefined;
    rr(ctx, 30, 76, 76, 76, 14);
    ctx.fillStyle = t["--surface-light"];
    ctx.fill();
    if (logo?.complete && logo.naturalWidth) {
      ctx.save();
      rr(ctx, 30, 76, 76, 76, 14);
      ctx.clip();
      const r = Math.min(76 / logo.naturalWidth, 76 / logo.naturalHeight);
      const lw = logo.naturalWidth * r;
      const lh = logo.naturalHeight * r;
      ctx.drawImage(logo, 30 + (76 - lw) / 2, 76 + (76 - lh) / 2, lw, lh);
      ctx.restore();
    }
    ctx.fillStyle = t["--text"];
    ctx.font = `600 32px ${DISPLAY}`;
    ctx.fillText(job.title, 128, 108);
    ctx.fillStyle = t["--text-secondary"];
    ctx.font = `400 19px ${DISPLAY}`;
    ctx.fillText(job.subtitle, 128, 140);
    ctx.font = `400 20px ${DISPLAY}`;
    wrapText(ctx, firstSentence(job.details), WW - 60)
      .slice(0, 3)
      .forEach((line, i) => ctx.fillText(line, 30, 204 + i * 30));
    let tx = 30;
    ctx.font = `500 16px ${DISPLAY}`;
    for (const skill of job.skills.slice(0, 4)) {
      const w = ctx.measureText(skill).width + 26;
      if (tx + w > WW - 30) break;
      rr(ctx, tx, 312, w, 34, 17);
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.stroke();
      ctx.fillStyle = t["--text-secondary"];
      ctx.fillText(skill, tx + 13, 335);
      tx += w + 10;
    }
    ctx.textAlign = "right";
    ctx.fillStyle = t["--text-tertiary"];
    ctx.font = `400 16px ${MONO}`;
    ctx.fillText(job.date, WW - 26, WH - 24);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------- static textures */

export function drawKeyboard(ctx: CanvasRenderingContext2D) {
  const t = readTokens();
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = t["--mat-graphite"];
  ctx.fillRect(0, 0, W, H);
  const rows = 6;
  const kh = (H - 40) / rows;
  for (let r = 0; r < rows; r++) {
    const cols = r === 0 ? 14 : 13;
    const kw = (W - 40) / cols;
    for (let c = 0; c < cols; c++) {
      rr(ctx, 20 + c * kw + 4, 20 + r * kh + 4, kw - 8, kh - 8, 8);
      ctx.fillStyle = t["--mat-ink"];
      ctx.fill();
    }
  }
}

export function drawCellLabel(ctx: CanvasRenderingContext2D, lines: string[]) {
  const t = readTokens();
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = t["--mat-graphite"];
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = t["--text-secondary"];
  ctx.font = `500 30px ${MONO}`;
  ctx.textAlign = "left";
  lines.forEach((l, i) => ctx.fillText(l.toUpperCase(), 48, H / 2 - ((lines.length - 1) * 44) / 2 + i * 44));
}
