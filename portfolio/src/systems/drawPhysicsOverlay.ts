import { missions, hazardZones } from "@/data/missions";
import type { Vec2 } from "@/systems/GravitySystem";

/* Canvas overlay renderer for the /game physics layer: island force fields,
   hazard zones, predicted trajectory and impact flash. Pure drawing — no state. */

/* Pre-computed mission colour cache (computed once at module load) */
const missionColorCache: Record<string, { r: number; g: number; b: number }> = {};
for (const m of missions) {
  const hex = m.color.length === 7 ? m.color : "#00ccff";
  missionColorCache[m.id] = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export interface OverlayFrame {
  camera: Vec2;
  shipPos: Vec2;
  frame: number;
  trajectory: Vec2[];
  impactFlash: number;
}

export function drawPhysicsOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  { camera, shipPos, frame, trajectory, impactFlash }: OverlayFrame,
) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2 - camera.x;
  const cy = h / 2 - camera.y;

  const colorCache = missionColorCache;

  // Draw force fields: proximity-sensor activated
  const time = frame * 0.03;
  const FIELD_ACTIVATE_DIST = 900;
  const FIELD_FULL_DIST = 460;

  for (const m of missions) {
    if (m.status === "locked") continue;

    const screenX = m.position.x + cx;
    const screenY = m.position.y + cy;
    const fieldR = (m.fieldRadius ?? 250) * 1.65;

    if (screenX < -fieldR - 50 || screenX > w + fieldR + 50 || screenY < -fieldR - 50 || screenY > h + fieldR + 50) continue;

    const dx = m.position.x - shipPos.x;
    const dy = m.position.y - shipPos.y;
    const distToShip = Math.sqrt(dx * dx + dy * dy);
    const col = colorCache[m.id] ?? { r: 0, g: 200, b: 255 };

    // Far away: single cheap ring
    if (distToShip > FIELD_ACTIVATE_DIST) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, fieldR * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, 0.08)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }

    // Proximity: 0 at 700px, 1 at 350px
    const proxFactor = Math.max(0, Math.min(1, (FIELD_ACTIVATE_DIST - distToShip) / (FIELD_ACTIVATE_DIST - FIELD_FULL_DIST)));

    if (m.fieldType === "typhoon") {
      const particleCount = Math.floor(12 + proxFactor * 20);
      const baseAlpha = proxFactor * (0.3 + proxFactor * 0.25);
      ctx.lineWidth = 2 + proxFactor * 1.5;
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 137.508 + m.gravityMass;
        const spiralAngle = (seed % (Math.PI * 2)) + time * (0.8 + (i % 3) * 0.3);
        const radiusFraction = ((i * 0.618 + time * 0.08) % 1);
        const r = radiusFraction * fieldR;
        const px = screenX + Math.cos(spiralAngle + radiusFraction * 5) * r;
        const py = screenY + Math.sin(spiralAngle + radiusFraction * 5) * r;
        const trailAngle = spiralAngle - 0.2;
        const trailR = r + 10;
        const tx = screenX + Math.cos(trailAngle + radiusFraction * 5) * trailR;
        const ty = screenY + Math.sin(trailAngle + radiusFraction * 5) * trailR;
        const alpha = baseAlpha * (1 - radiusFraction * 0.6);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
        ctx.stroke();
      }
      if (proxFactor > 0.2) {
        for (let ring = 0; ring < 2; ring++) {
          const ringR = fieldR * (0.6 + ring * 0.25);
          const ringAlpha = proxFactor * 0.15 * (1 - ring * 0.3);
          ctx.beginPath();
          for (let s = 0; s <= 20; s++) {
            const a = (s / 20) * Math.PI * 2;
            const wobble = Math.sin(a * 5 + time * 2 + ring) * (6 + proxFactor * 10);
            const rx = screenX + Math.cos(a) * (ringR + wobble);
            const ry = screenY + Math.sin(a) * (ringR + wobble);
            if (s === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      if (proxFactor > 0.15) {
        const coreAlpha = proxFactor * 0.2;
        const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, fieldR * 0.45);
        grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${coreAlpha})`);
        grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, fieldR * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const streamCount = Math.floor(8 + proxFactor * 10);
      const baseAlpha = proxFactor * (0.25 + proxFactor * 0.2);
      ctx.lineWidth = 1.5 + proxFactor * 1;
      for (let i = 0; i < streamCount; i++) {
        const angle = (i / streamCount) * Math.PI * 2 + time * 0.35;
        const startR = fieldR * (0.88 + Math.sin(i * 2.3 + time) * 0.08);
        const endR = 12 + Math.sin(i * 1.7 + time * 1.5) * 6;
        ctx.beginPath();
        for (let s = 0; s <= 6; s++) {
          const t = s / 6;
          const r = startR + (endR - startR) * t * t;
          const a = angle + t * 2;
          ctx.lineTo(screenX + Math.cos(a) * r, screenY + Math.sin(a) * r);
        }
        ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${baseAlpha * (0.5 + Math.sin(i * 3.1 + time * 2) * 0.3)})`;
        ctx.stroke();
      }
      const dotCount = Math.floor(6 + proxFactor * 10);
      for (let i = 0; i < dotCount; i++) {
        const seed = i * 0.618 * Math.PI * 2;
        const orbitSpeed = 0.4 + (i % 4) * 0.25;
        const radiusFraction = ((i * 0.382 + time * 0.06 * orbitSpeed) % 1);
        const r = radiusFraction * fieldR;
        const a = seed + time * orbitSpeed + (1 - radiusFraction) * 3;
        const dotSize = (2 + proxFactor * 2) * (1 - radiusFraction * 0.5);
        ctx.beginPath();
        ctx.arc(screenX + Math.cos(a) * r, screenY + Math.sin(a) * r, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${baseAlpha * (1 - radiusFraction) * 1.3})`;
        ctx.fill();
      }
      if (proxFactor > 0.2) {
        const hAlpha = proxFactor * 0.2;
        const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, fieldR * 0.35);
        grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${hAlpha})`);
        grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, fieldR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      if (proxFactor > 0.1) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, fieldR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${proxFactor * 0.15})`;
        ctx.lineWidth = 1.5 + proxFactor;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // Draw hazard zones
  for (const zone of hazardZones) {
    const zx = zone.position.x + cx;
    const zy = zone.position.y + cy;
    if (zx < -zone.radius || zx > w + zone.radius || zy < -zone.radius || zy > h + zone.radius) continue;

    const grad = ctx.createRadialGradient(zx, zy, 0, zx, zy, zone.radius);
    if (zone.type === "thermal") {
      grad.addColorStop(0, `rgba(255, 100, 20, ${zone.intensity * 0.2})`);
      grad.addColorStop(0.6, `rgba(255, 60, 0, ${zone.intensity * 0.1})`);
      grad.addColorStop(1, "rgba(255, 60, 0, 0)");
    } else {
      grad.addColorStop(0, `rgba(80, 50, 200, ${zone.intensity * 0.15})`);
      grad.addColorStop(0.6, `rgba(100, 60, 220, ${zone.intensity * 0.08})`);
      grad.addColorStop(1, "rgba(100, 60, 220, 0)");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(zx, zy, zone.radius, 0, Math.PI * 2);
    ctx.fill();

    // Zone boundary ring
    ctx.beginPath();
    ctx.arc(zx, zy, zone.radius, 0, Math.PI * 2);
    ctx.strokeStyle = zone.type === "thermal"
      ? `rgba(255, 120, 40, ${zone.intensity * 0.3})`
      : `rgba(120, 80, 255, ${zone.intensity * 0.25})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw trajectory path
  const traj = trajectory;
  if (traj.length > 2) {
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2); // starts at ship
    for (const pt of traj) {
      ctx.lineTo(pt.x + cx, pt.y + cy);
    }
    ctx.strokeStyle = "rgba(0, 220, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw stress flash on ship
  if (impactFlash > 0) {
    const flashAlpha = impactFlash / 30;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 50, 20, ${flashAlpha * 0.4})`;
    ctx.fill();
  }
}
