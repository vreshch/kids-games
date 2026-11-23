import type { Bullet, Tank, TankKind } from '@/lib/tanky-town-state';

const TAU = Math.PI * 2;
type Ctx = CanvasRenderingContext2D;

const LOOKS: Record<TankKind, { hull: string; top: string; scale: number }> = {
  hero: { hull: '#f59e0b', top: '#fde68a', scale: 1 },
  basic: { hull: '#8b5cf6', top: '#c4b5fd', scale: 0.95 },
  fast: { hull: '#f43f5e', top: '#fecdd3', scale: 0.85 },
  tough: { hull: '#0ea5e9', top: '#bae6fd', scale: 1.08 },
};

function treads(ctx: Ctx, s: number, roll: number) {
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.roundRect(-s * 0.42, side * s * 0.3 - s * 0.11, s * 0.84, s * 0.22, s * 0.08);
    ctx.fill();
    ctx.fillStyle = '#4b5563';
    for (let i = 0; i < 4; i++) {
      const x = -s * 0.36 + ((i + roll) % 4) * s * 0.2;
      ctx.fillRect(x, side * s * 0.3 - s * 0.08, s * 0.05, s * 0.16);
    }
  }
}

/** Heroes smile; enemies frown under slanted brows. */
function face(ctx: Ctx, s: number, grumpy: boolean) {
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(s * 0.04, side * s * 0.08, s * 0.055, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(s * 0.06, side * s * 0.08, s * 0.028, 0, TAU);
    ctx.fill();
    if (!grumpy) continue;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(s * 0.13, side * s * 0.03);
    ctx.lineTo(s * 0.09, side * s * 0.15);
    ctx.stroke();
  }
}

const FRIEND = { hull: '#14b8a6', top: '#99f6e4', scale: 1 };

/** Drawn facing right, then turned; (x, y) is the tank centre in pixels. */
export function drawTank(ctx: Ctx, tank: Tank, x: number, y: number, s: number, now: number) {
  const look = tank.seat === 1 ? FRIEND : LOOKS[tank.kind];
  const size = s * look.scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tank.dir * Math.PI) / 2);
  treads(ctx, size, tank.off * 4);
  ctx.fillStyle = look.hull;
  ctx.beginPath();
  ctx.roundRect(-size * 0.34, -size * 0.26, size * 0.68, size * 0.52, size * 0.14);
  ctx.fill();
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.roundRect(size * 0.1, -size * 0.055, size * 0.4, size * 0.11, size * 0.04);
  ctx.fill();
  ctx.fillStyle = tank.kind === 'tough' && tank.hp < 3 ? '#e0f2fe' : look.top;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.19, 0, TAU);
  ctx.fill();
  face(ctx, size, tank.owner === 'enemy');
  ctx.restore();
  if (tank.shield > 0) shield(ctx, x, y, s, now);
}

function shield(ctx: Ctx, x: number, y: number, s: number, now: number) {
  ctx.strokeStyle = `rgba(125, 211, 252, ${0.6 + Math.sin(now / 90) * 0.3})`;
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.arc(x, y, s * (0.52 + Math.sin(now / 140) * 0.03), 0, TAU);
  ctx.stroke();
}

export function drawBullet(ctx: Ctx, bullet: Bullet, x: number, y: number, s: number) {
  ctx.shadowColor = bullet.owner === 'player' ? '#fde047' : '#fb7185';
  ctx.shadowBlur = s * 0.4;
  ctx.fillStyle = bullet.owner === 'player' ? '#fffbeb' : '#fecdd3';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.11, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/** The birthday cake everyone is fighting over. (x, y) is the tile's top-left corner. */
export function drawCake(ctx: Ctx, x: number, y: number, s: number, now: number) {
  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.roundRect(x + s * 0.12, y + s * 0.45, s * 0.76, s * 0.45, s * 0.1);
  ctx.fill();
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.roundRect(x + s * 0.08, y + s * 0.38, s * 0.84, s * 0.2, s * 0.1);
  ctx.fill();
  ctx.fillStyle = '#be185d';
  ctx.fillRect(x + s * 0.12, y + s * 0.7, s * 0.76, s * 0.06);
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(x + s * 0.47, y + s * 0.2, s * 0.06, s * 0.2);
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.ellipse(
    x + s * 0.5,
    y + s * 0.13,
    s * 0.05,
    s * (0.08 + Math.sin(now / 90) * 0.015),
    0,
    0,
    TAU
  );
  ctx.fill();
}

export function drawHeart(ctx: Ctx, x: number, y: number, s: number, now: number) {
  ctx.font = `${Math.round(s * (0.62 + Math.sin(now / 160) * 0.06))}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💛', x, y);
  ctx.textBaseline = 'alphabetic';
}
