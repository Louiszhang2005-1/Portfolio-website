import type { PortfolioItem } from "@/lib/portfolio";
import { logicalSize } from "./canvas";
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

/** Set `weight size family`, shrinking the size until `text` fits `maxWidth` (never below `min`). */
function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, weight: number, size: number, family: string, min = 12) {
  let px = size;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > min && ctx.measureText(text).width > maxWidth) {
    px -= 1;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

export const clockTime = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
export const weekday = () => new Date().toLocaleDateString([], { weekday: "long" }).toUpperCase();

/* ---------------------------------------------------------------- watch (360 x 440) */

export function drawWatch(ctx: CanvasRenderingContext2D, notif: number) {
  const t = readTokens();
  const { W, H } = logicalSize(ctx);
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

/** Nine apps in three columns: at phone sizes the texture shows at ~1/4 scale, so labels need ~34px to stay legible. */
const APPS = [
  ["SolidWorks", "SW"],
  ["CATIA", "CA"],
  ["AutoCAD", "AC"],
  ["Ansys", "An"],
  ["Python", "Py"],
  ["TypeScript", "TS"],
  ["ROS 2", "R2"],
  ["Arduino", "Ar"],
  ["Raspberry Pi", "Pi"],
];

/** Short lines: at 26px mono, ~26 characters fit between the gutter and the screen's right edge. */
const CODE: [string, string][] = [
  ["const", " risk = spread(f, w);"],
  ["if", " (risk.eta < 3) {"],
  ["  await", " notify(home);"],
  ["}", ""],
  ["", ""],
  ["function", " route(g, t) {"],
  ["  return", " astar(g, t);"],
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
  s: { lock: number; home: number; code: number }
) {
  const t = readTokens();
  const { W, H } = logicalSize(ctx);
  ctx.globalAlpha = 1;
  ctx.fillStyle = t["--mat-black"];
  ctx.fillRect(0, 0, W, H);
  // the panel is on (wallpaper) whenever no other screen is: a reassembled phone never shows a dead black screen
  wallpaper(ctx, W, H);

  if (s.home > 0.01) {
    APPS.forEach(([name, mark], i) => {
      const a = clamp01((s.home - i * 0.04) / 0.68);
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = 90 + col * 180;
      const y = 150 + row * 220 + (1 - a) * 14;
      rr(ctx, cx - 64, y, 128, 128, 32);
      ctx.fillStyle = i === 0 ? t["--accent"] : t["--surface-hover"];
      ctx.fill();
      ctx.textAlign = "center";
      ctx.fillStyle = i === 0 ? t["--accent-ink"] : t["--text"];
      ctx.font = `700 44px ${MONO}`;
      ctx.fillText(mark, cx, y + 80);
      ctx.fillStyle = t["--text"];
      fitFont(ctx, name, 170, 600, 34, DISPLAY, 24);
      ctx.fillText(name, cx, y + 172);
    });
    // dock: editor, mail, files, terminal as simple glyphs
    ctx.globalAlpha = s.home;
    rr(ctx, 30, H - 170, W - 60, 130, 44);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();
    const dock: [string, string, string][] = [
      [t["--mat-alu-lo"], "#ffffff", "{}"],
      [t["--accent"], t["--accent-ink"], "@"],
      [t["--mat-alu-hi"], t["--mat-ink"], "files"],
      [t["--mat-black"], "#3fb950", ">_"],
    ];
    dock.forEach(([bg, fg, glyph], i) => {
      const x = 62 + i * 112;
      const y = H - 150;
      rr(ctx, x, y, 90, 90, 22);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = fg;
      if (glyph === "files") {
        rr(ctx, x + 22, y + 30, 46, 34, 6);
        ctx.fill();
        rr(ctx, x + 22, y + 24, 20, 10, 4);
        ctx.fill();
      } else {
        ctx.textAlign = "center";
        ctx.font = `700 40px ${MONO}`;
        ctx.fillText(glyph, x + 45, y + 59);
      }
    });
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
    fitFont(ctx, "Polytechnique Montréal", W - 68 - 170 - 24, 400, 24, DISPLAY, 16);
    ctx.fillText("Polytechnique Montréal", 170, cy + 106);
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
    // one size for every line, shrunk if the longest would cross the screen's right edge (rounded corner margin)
    const longest = CODE.reduce((m, [kw, rest]) => (kw + rest).length > m.length ? kw + rest : m, "");
    const px = fitFont(ctx, longest, W - 84 - 40, 400, 26, MONO, 16);
    CODE.forEach(([kw, rest], i) => {
      const y = 260 + i * 56;
      ctx.font = `400 ${px}px ${MONO}`;
      ctx.fillStyle = t["--text-tertiary"];
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

const company = (job: PortfolioItem) => job.title.split(" ")[0];

export function drawLaptop(
  ctx: CanvasRenderingContext2D,
  s: { screen: number; track: number },
  jobs: PortfolioItem[],
  logos: Record<string, HTMLImageElement>
) {
  const t = readTokens();
  const { W, H } = logicalSize(ctx);
  ctx.globalAlpha = 1;
  ctx.fillStyle = t["--mat-black"];
  ctx.fillRect(0, 0, W, H);
  if (s.screen < 0.01) return;
  ctx.globalAlpha = s.screen;
  wallpaper(ctx, W, H);

  // menu bar with the internship timeline. Type is sized for the texture's ~1/4 on-page scale.
  const MB = 64;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, W, MB);
  ctx.textAlign = "left";
  ctx.fillStyle = t["--text"];
  ctx.font = `600 30px ${DISPLAY}`;
  ctx.fillText("Experience", 28, 42);
  const x0 = 240;
  const x1 = W - 180;
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x0, 31, x1 - x0, 3);
  ctx.fillStyle = t["--text-secondary"];
  jobs.forEach((j, i) => {
    fitFont(ctx, company(j), (x1 - x0) / jobs.length - 24, 500, 26, DISPLAY, 16);
    ctx.fillText(company(j), x0 + (i / jobs.length) * (x1 - x0) + 16, 42);
  });
  const mx = x0 + (Math.min(s.track, jobs.length - 0.001) / jobs.length) * (x1 - x0);
  ctx.beginPath();
  ctx.arc(mx, 32, 10, 0, Math.PI * 2);
  ctx.fillStyle = t["--accent"];
  ctx.fill();
  ctx.textAlign = "right";
  ctx.fillStyle = t["--text-secondary"];
  ctx.font = `500 26px ${DISPLAY}`;
  ctx.fillText(`${jobs.length} roles`, W - 28, 42);

  // windows, back to front: one big, simple card per role (logo, company, role, three tools, dates)
  const WW = 1080;
  const WH = 590;
  const order = jobs
    .map((job, i) => ({ job, rel: i + 0.5 - s.track }))
    .sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
  for (const { job, rel } of order) {
    const x = rel > 0 ? rel * 80 : rel * 380;
    const y = rel > 0 ? -rel * 30 : 0;
    const sc = 1 - Math.abs(rel) * 0.06;
    const op = rel < -0.5 ? clamp01(1 + (rel + 0.5) * 2.2) : clamp01(1 - (rel - 0.5) * 0.3);
    const content = clamp01(1 - (Math.abs(rel) - 0.5) * 4);
    if (op <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = s.screen * op;
    ctx.translate(W / 2 + x, MB + (H - MB) / 2 + 10 + y);
    ctx.scale(sc, sc);
    ctx.translate(-WW / 2, -WH / 2);
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 24;
    rr(ctx, 0, 0, WW, WH, 22);
    ctx.fillStyle = t["--surface-alt"];
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // title bar
    ctx.fillStyle = t["--surface-hover"];
    rr(ctx, 0, 0, WW, 64, [22, 22, 0, 0]);
    ctx.fill();
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(34 + d * 32, 32, 10, 0, Math.PI * 2);
      ctx.fillStyle = t["--mat-alu-lo"];
      ctx.fill();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = t["--text-secondary"];
    ctx.font = `500 26px ${DISPLAY}`;
    ctx.fillText(company(job), 150, 41);

    ctx.globalAlpha = s.screen * op * content;
    const logo = job.image ? logos[job.image] : undefined;
    const L = 132;
    rr(ctx, 44, 104, L, L, 22);
    ctx.fillStyle = t["--surface-light"];
    ctx.fill();
    if (logo?.complete && logo.naturalWidth) {
      ctx.save();
      rr(ctx, 44, 104, L, L, 22);
      ctx.clip();
      const r = Math.min(L / logo.naturalWidth, L / logo.naturalHeight);
      const lw = logo.naturalWidth * r;
      const lh = logo.naturalHeight * r;
      ctx.drawImage(logo, 44 + (L - lw) / 2, 104 + (L - lh) / 2, lw, lh);
      ctx.restore();
    }
    const tx0 = 44 + L + 32;
    ctx.fillStyle = t["--text"];
    fitFont(ctx, job.title, WW - tx0 - 44, 600, 64, DISPLAY, 36);
    ctx.fillText(job.title, tx0, 170);
    ctx.fillStyle = t["--text-secondary"];
    ctx.font = `400 34px ${DISPLAY}`;
    wrapText(ctx, job.subtitle, WW - tx0 - 44)
      .slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, tx0, 220 + i * 42));
    let cx = 44;
    ctx.font = `500 30px ${DISPLAY}`;
    for (const skill of job.skills.slice(0, 3)) {
      const w = ctx.measureText(skill).width + 40;
      if (cx + w > WW - 44) break;
      rr(ctx, cx, 346, w, 56, 28);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();
      ctx.fillStyle = t["--text-secondary"];
      ctx.fillText(skill, cx + 20, 384);
      cx += w + 14;
    }
    ctx.textAlign = "left";
    ctx.fillStyle = t["--text-tertiary"];
    ctx.font = `500 30px ${MONO}`;
    ctx.fillText(job.date, 44, WH - 48);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------- static textures */

export function drawKeyboard(ctx: CanvasRenderingContext2D) {
  const t = readTokens();
  const { W, H } = logicalSize(ctx);
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
  const { W, H } = logicalSize(ctx);
  ctx.fillStyle = t["--mat-graphite"];
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = t["--text-secondary"];
  ctx.font = `500 30px ${MONO}`;
  ctx.textAlign = "left";
  lines.forEach((l, i) => ctx.fillText(l.toUpperCase(), 48, H / 2 - ((lines.length - 1) * 44) / 2 + i * 44));
}
