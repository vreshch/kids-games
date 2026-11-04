import { FOOD_COLORS } from '@/lib/wiggle-food';
import { radiusFor, type Snake } from '@/lib/wiggle-snake';
import { SKINS } from '@/lib/wiggle-skins';
import type { World } from '@/lib/wiggle-world';

import { dot, drawSnake } from './draw-snake';

export type Camera = { x: number; y: number; zoom: number };
export type Screen = { w: number; h: number; dpr: number };
export type Assets = { dots: HTMLCanvasElement[]; floor: CanvasPattern | null };
type View = { left: number; top: number; right: number; bottom: number };

const TAU = Math.PI * 2;

function sprite(size: number, paint: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  paint(canvas.getContext('2d') as CanvasRenderingContext2D);
  return canvas;
}

/** Glow dots and the polka-dot floor tile are painted once, then stamped every frame. */
export function createAssets(ctx: CanvasRenderingContext2D): Assets {
  const dots = FOOD_COLORS.map((color) =>
    sprite(64, (g) => {
      const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.2, color);
      glow.addColorStop(0.45, `${color}77`);
      glow.addColorStop(1, `${color}00`);
      g.fillStyle = glow;
      g.fillRect(0, 0, 64, 64);
    })
  );
  const tile = sprite(120, (g) => {
    g.fillStyle = '#121a3d';
    g.fillRect(0, 0, 120, 120);
    g.fillStyle = 'rgba(165, 180, 252, 0.1)';
    for (const [x, y, r] of [
      [30, 30, 5],
      [90, 90, 5],
      [90, 30, 2],
      [30, 90, 2],
    ]) {
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
  });
  return { dots, floor: ctx.createPattern(tile, 'repeat') };
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  { w, h, dpr }: Screen,
  assets: Assets
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#07091a';
  ctx.fillRect(0, 0, w, h);

  const s = cam.zoom;
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w / 2 - cam.x * s), dpr * (h / 2 - cam.y * s));
  const view = {
    left: cam.x - w / 2 / s,
    top: cam.y - h / 2 / s,
    right: cam.x + w / 2 / s,
    bottom: cam.y + h / 2 / s,
  };
  drawFloor(ctx, world.arenaRadius, view, assets);
  drawFood(ctx, world, view, assets);
  const order = [...world.snakes].sort((a, b) => Number(a.isPlayer) - Number(b.isPlayer));
  for (const snake of order) {
    if (snake.alive && onScreen(snake, view)) drawSnake(ctx, world, snake, s);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawMinimap(ctx, world, Math.min(w, h) < 500 ? 64 : 84);
}

function drawFloor(ctx: CanvasRenderingContext2D, radius: number, view: View, assets: Assets) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.clip();
  ctx.fillStyle = assets.floor ?? '#121a3d';
  ctx.fillRect(view.left, view.top, view.right - view.left, view.bottom - view.top);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.lineWidth = 22;
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#f9a8d4';
  ctx.stroke();
}

function drawFood(ctx: CanvasRenderingContext2D, world: World, view: View, assets: Assets) {
  for (const food of world.foods) {
    if (food.x < view.left - 40 || food.x > view.right + 40) continue;
    if (food.y < view.top - 40 || food.y > view.bottom + 40) continue;
    const size = food.r * 5 * (1 + 0.14 * Math.sin(world.time * 4 + food.phase));
    ctx.drawImage(assets.dots[food.color], food.x - size / 2, food.y - size / 2, size, size);
  }
}

function onScreen(snake: Snake, view: View) {
  const pad = radiusFor(snake.mass) + 40;
  return snake.body.some(
    (p, i) =>
      i % 8 === 0 &&
      p.x > view.left - pad &&
      p.x < view.right + pad &&
      p.y > view.top - pad &&
      p.y < view.bottom + pad
  );
}

function drawMinimap(ctx: CanvasRenderingContext2D, world: World, size: number) {
  const half = size / 2;
  const cx = 12 + half;
  const cy = 12 + half;
  dot(ctx, cx, cy, half, 'rgba(15, 23, 42, 0.65)');
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(249, 168, 212, 0.5)';
  ctx.stroke();
  const k = (half - 4) / world.arenaRadius;
  for (const snake of world.snakes) {
    if (!snake.alive) continue;
    const head = snake.body[0];
    const color = snake.isPlayer ? '#ffffff' : `${SKINS[snake.skin]?.colors[0] ?? '#ffffff'}bb`;
    const r = snake.isPlayer ? 3.5 : 1.2 + radiusFor(snake.mass) / 16;
    dot(ctx, cx + head.x * k, cy + head.y * k, r, color);
  }
}
