import type { Cloud } from '@/lib/munch-maze-clouds';
import { DIRS, type Dir } from '@/lib/munch-maze-level';

const TAU = Math.PI * 2;
type Ctx = CanvasRenderingContext2D;

function shadow(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.75, r * 0.2, 0, 0, TAU);
  ctx.fill();
}

function shade(ctx: Ctx, x: number, y: number, r: number, stops: string[]) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r * 1.15);
  stops.forEach((color, i) => g.addColorStop(i / (stops.length - 1), color));
  return g;
}

type EyeOpts = { look: Dir; scared?: boolean; outline: string };

/** Big cartoon eyes with a dark rim, pupils that look where they are going and a glint. */
function eyes(ctx: Ctx, x: number, y: number, r: number, o: EyeOpts) {
  const d = DIRS[o.look] ?? { x: 0, y: 0 };
  for (const side of [-1, 1]) {
    const ex = x + side * r * 0.34 + d.x * r * 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = o.outline;
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.ellipse(ex, y, r * 0.24, r * 0.3, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    const pr = o.scared ? r * 0.08 : r * 0.13;
    const px = ex + d.x * r * 0.09;
    const py = y + d.y * r * 0.1 + (o.scared ? 0 : r * 0.04);
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.38, 0, TAU);
    ctx.fill();
  }
}

/** Munchy: a round green monster with glowing antennae, rosy cheeks and a chomping grin. */
export function drawMunchy(ctx: Ctx, cx: number, cy: number, size: number, dir: Dir, now: number) {
  const r = size * 0.44;
  const bob = Math.sin(now / 160) * r * 0.05;
  const x = cx;
  const y = cy + bob;
  shadow(ctx, cx, cy + r * 0.95, r);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const tip = { x: x + side * r * 0.62, y: y - r * 1.15 + Math.sin(now / 200 + side) * r * 0.06 };
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = r * 0.13;
    ctx.beginPath();
    ctx.moveTo(x + side * r * 0.3, y - r * 0.75);
    ctx.quadraticCurveTo(x + side * r * 0.35, y - r * 1.05, tip.x, tip.y);
    ctx.stroke();
    ctx.fillStyle = shade(ctx, tip.x, tip.y, r * 0.2, ['#fef9c3', '#facc15', '#ca8a04']);
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = r * 0.5;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, r * 0.18, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.ellipse(x + side * r * 0.42, y + r * 0.9, r * 0.28, r * 0.16, 0, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = shade(ctx, x, y, r, ['#a7f3d0', '#34d399', '#059669', '#065f46']);
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = r * 0.08;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.95, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.4, y - r * 0.5, r * 0.22, r * 0.12, -0.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(251, 113, 133, 0.55)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + side * r * 0.62, y + r * 0.18, r * 0.14, r * 0.09, 0, 0, TAU);
    ctx.fill();
  }
  eyes(ctx, x, y - r * 0.22, r, { look: dir, outline: '#064e3b' });
  mouth(ctx, x, y + r * 0.35, r, now);
}

function mouth(ctx: Ctx, x: number, y: number, r: number, now: number) {
  const open = 0.08 + Math.abs(Math.sin(now / 130)) * 0.2;
  ctx.fillStyle = '#7f1d1d';
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.38, y - r * 0.04);
  ctx.quadraticCurveTo(x, y + r * 0.05, x + r * 0.38, y - r * 0.04);
  ctx.quadraticCurveTo(x, y + r * (0.1 + open * 2), x - r * 0.38, y - r * 0.04);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.ellipse(x, y + r * (0.05 + open), r * 0.14, r * open * 0.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (const side of [-1, 1]) ctx.fillRect(x + side * r * 0.12 - r * 0.05, y, r * 0.1, r * 0.09);
}

/** The cloud outline: five puffs on top, a scalloped belly underneath. */
function puffs(ctx: Ctx, x: number, y: number, r: number, grow: number) {
  ctx.beginPath();
  const bumps: [number, number, number][] = [
    [-0.55, 0.15, 0.45],
    [-0.3, -0.25, 0.5],
    [0.15, -0.38, 0.55],
    [0.55, -0.02, 0.45],
    [0, 0.2, 0.6],
    [-0.35, 0.45, 0.32],
    [0.35, 0.45, 0.32],
  ];
  for (const [bx, by, br] of bumps) {
    ctx.moveTo(x + bx * r + br * r + grow, y + by * r);
    ctx.arc(x + bx * r, y + by * r, br * r + grow, 0, TAU);
  }
}

type CloudLook = { cloud: Cloud; scared: boolean; flash: boolean };

/** Grumpy rain cloud; scared clouds turn pale blue with a wobbly mouth and a sweat drop. */
export function drawCloud(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  look: CloudLook,
  now: number
) {
  const { cloud, scared, flash } = look;
  const r = size * 0.5;
  const y = cy + Math.sin(now / 280 + cloud.id * 1.7) * r * 0.08;
  shadow(ctx, cx, cy + r * 0.95, r);
  const base = scared ? (flash ? '#f8fafc' : '#93c5fd') : cloud.color;
  if (!scared) rain(ctx, cx, y, r, base, now + cloud.id * 170);
  puffs(ctx, cx, y, r, r * 0.08);
  ctx.fillStyle = scared ? '#1e3a8a' : '#1f2937';
  ctx.fill();
  puffs(ctx, cx, y, r, 0);
  ctx.fillStyle = shade(ctx, cx, y, r, ['#ffffff', base, base, 'rgba(15, 23, 42, 0.55)']);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.35, y - r * 0.45, r * 0.2, r * 0.1, -0.5, 0, TAU);
  ctx.fill();
  eyes(ctx, cx, y - r * 0.02, r * 0.95, {
    look: scared ? -1 : cloud.dir,
    scared,
    outline: '#1f2937',
  });
  face(ctx, cx, y, r, scared);
}

function face(ctx: Ctx, x: number, y: number, r: number, scared: boolean) {
  ctx.strokeStyle = '#1f2937';
  ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.1;
  ctx.beginPath();
  if (scared) {
    for (let i = 0; i <= 6; i++) {
      ctx.lineTo(x - r * 0.3 + i * r * 0.1, y + r * (0.38 + (i % 2) * 0.08));
    }
    ctx.stroke();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(x + r * 0.62, y - r * 0.32, r * 0.08, r * 0.13, 0, 0, TAU);
    ctx.fill();
    return;
  }
  for (const side of [-1, 1]) {
    ctx.moveTo(x + side * r * 0.58, y - r * 0.42);
    ctx.lineTo(x + side * r * 0.14, y - r * 0.26);
  }
  ctx.moveTo(x - r * 0.2, y + r * 0.45);
  ctx.quadraticCurveTo(x, y + r * 0.3, x + r * 0.2, y + r * 0.45);
  ctx.stroke();
}

function rain(ctx: Ctx, x: number, y: number, r: number, color: string, now: number) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = r * 0.08;
  ctx.lineCap = 'round';
  for (const [i, dx] of [-0.35, 0, 0.35].entries()) {
    const fall = ((now / 600 + i * 0.33) % 1) * r * 0.5;
    ctx.beginPath();
    ctx.moveTo(x + dx * r, y + r * 0.75 + fall);
    ctx.lineTo(x + dx * r - r * 0.05, y + r * 0.88 + fall);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
