import type { Tile } from '@/lib/tanky-town-level';
import { tankPos, type World } from '@/lib/tanky-town-state';

import { drawEffects, type Effects } from '../munch-maze/effects';
import { drawBullet, drawCake, drawHeart, drawTank } from './sprites';

export type Board = { left: number; top: number; size: number };
type Ctx = CanvasRenderingContext2D;

const TAU = Math.PI * 2;

/** Largest square tiles that fit the canvas, centred. */
export function fitBoard(world: World, w: number, h: number): Board {
  const { cols, rows } = world.level;
  const size = Math.max(1, Math.floor(Math.min(w / cols, h / rows)));
  return { size, left: (w - size * cols) / 2, top: (h - size * rows) / 2 };
}

function block(ctx: Ctx, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x + s * 0.04, y + s * 0.04, s * 0.92, s * 0.92, s * 0.14);
  ctx.fill();
}

/** Each segment is x1, y1, x2, y2 in tile fractions. */
function lines(ctx: Ctx, x: number, y: number, s: number, segments: number[][]) {
  ctx.beginPath();
  for (const [x1, y1, x2, y2] of segments) {
    ctx.moveTo(x + x1 * s, y + y1 * s);
    ctx.lineTo(x + x2 * s, y + y2 * s);
  }
  ctx.stroke();
}

const MORTAR = [
  [0.06, 0.5, 0.94, 0.5],
  [0.5, 0.06, 0.5, 0.5],
  [0.27, 0.5, 0.27, 0.94],
  [0.73, 0.5, 0.73, 0.94],
];
const CRACKS = [
  [0.2, 0.1, 0.45, 0.4],
  [0.45, 0.4, 0.33, 0.62],
  [0.33, 0.62, 0.7, 0.92],
  [0.45, 0.4, 0.85, 0.3],
];

function brick(ctx: Ctx, x: number, y: number, s: number, cracked: boolean) {
  block(ctx, x, y, s, cracked ? '#b4602f' : '#e8823f');
  ctx.lineWidth = s * 0.05;
  ctx.strokeStyle = '#8a3a17';
  lines(ctx, x, y, s, MORTAR);
  if (!cracked) return;
  ctx.strokeStyle = '#2b1205';
  lines(ctx, x, y, s, CRACKS);
}

function steel(ctx: Ctx, x: number, y: number, s: number) {
  block(ctx, x, y, s, '#94a3b8');
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(x + s * 0.14, y + s * 0.14, s * 0.72, s * 0.3, s * 0.08);
  ctx.fill();
  ctx.fillStyle = '#475569';
  for (const [cx, cy] of [
    [0.2, 0.2],
    [0.8, 0.2],
    [0.2, 0.8],
    [0.8, 0.8],
  ]) {
    ctx.beginPath();
    ctx.arc(x + cx * s, y + cy * s, s * 0.05, 0, TAU);
    ctx.fill();
  }
}

function water(ctx: Ctx, x: number, y: number, s: number, now: number) {
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = s * 0.05;
  const drift = (now / 900) % 1;
  for (const row of [0.3, 0.7]) {
    const cx = x + (((row + drift) % 1) * 0.6 + 0.2) * s;
    ctx.beginPath();
    ctx.arc(cx, y + row * s, s * 0.14, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
}

function bush(ctx: Ctx, x: number, y: number, s: number) {
  const leaves: [number, number, string][] = [
    [0.3, 0.32, '#15803d'],
    [0.7, 0.3, '#16a34a'],
    [0.28, 0.7, '#16a34a'],
    [0.72, 0.7, '#15803d'],
    [0.5, 0.5, '#22c55e'],
  ];
  for (const [cx, cy, color] of leaves) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + cx * s, y + cy * s, s * 0.3, 0, TAU);
    ctx.fill();
  }
}

function ground(ctx: Ctx, world: World, s: number) {
  const { cols, rows } = world.level;
  ctx.fillStyle = '#13241c';
  ctx.beginPath();
  ctx.roundRect(-s * 0.1, -s * 0.1, (cols + 0.2) * s, (rows + 0.2) * s, s * 0.3);
  ctx.fill();
  ctx.fillStyle = '#172b21';
  for (let i = 0; i < cols * rows; i++) {
    const x = i % cols;
    const y = Math.floor(i / cols);
    if ((x + y) % 2 === 0) ctx.fillRect(x * s, y * s, s, s);
  }
}

/** Bushes are skipped here and painted last, so tanks can hide under them. */
function drawTiles(ctx: Ctx, world: World, s: number, now: number, only: 'bush' | 'rest') {
  const { cols } = world.level;
  world.tiles.forEach((tile: Tile, i) => {
    const x = (i % cols) * s;
    const y = Math.floor(i / cols) * s;
    if ((tile === 'bush') !== (only === 'bush')) return;
    if (tile === 'bush') bush(ctx, x, y, s);
    else if (tile === 'brick' || tile === 'cracked') brick(ctx, x, y, s, tile === 'cracked');
    else if (tile === 'steel') steel(ctx, x, y, s);
    else if (tile === 'water') water(ctx, x, y, s, now);
    else if (tile === 'cake') drawCake(ctx, x, y, s, now);
  });
}

type Scene = { b: Board; now: number; fx: Effects };

export function drawScene(ctx: Ctx, world: World, { b, now, fx }: Scene) {
  const s = b.size;
  const shake = fx.shake > 0 ? (Math.random() - 0.5) * s * 0.4 * fx.shake * 3 : 0;
  ctx.save();
  ctx.translate(b.left + shake, b.top + shake * 0.6);
  ground(ctx, world, s);
  drawTiles(ctx, world, s, now, 'rest');
  const mid = (v: number) => (v + 0.5) * s;
  if (world.pickup) drawHeart(ctx, mid(world.pickup.x), mid(world.pickup.y), s, now);
  for (const tank of world.tanks) {
    const pos = tankPos(tank);
    drawTank(ctx, tank, mid(pos.x), mid(pos.y), s, now);
  }
  for (const bullet of world.bullets) drawBullet(ctx, bullet, mid(bullet.x), mid(bullet.y), s);
  ctx.globalAlpha = 0.93;
  drawTiles(ctx, world, s, now, 'bush');
  ctx.globalAlpha = 1;
  ctx.restore();
  drawEffects(ctx, fx, b);
}
