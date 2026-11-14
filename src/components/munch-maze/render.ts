import { cellAt, DIRS, type Dir, type Level } from '@/lib/munch-maze-level';
import { canStep, type World } from '@/lib/munch-maze-world';

import { drawCloud, drawMunchy } from './characters';
import { drawEffects, type Effects } from './effects';

export type Board = { left: number; top: number; size: number };
export type Shown = { x: number; y: number };

const TAU = Math.PI * 2;

/** Largest square tiles that fit the canvas, centred. */
export function fitBoard(world: World, w: number, h: number): Board {
  const { cols, rows } = world.level;
  const size = Math.floor(Math.min(w / cols, h / rows));
  return { size, left: (w - size * cols) / 2, top: (h - size * rows) / 2 };
}

/** Glide the drawn spot toward the real tile; snap across the side tunnel. */
export function glide(shown: Shown, x: number, y: number, dt: number) {
  if (Math.abs(shown.x - x) > 2) shown.x = x;
  const k = Math.min(1, dt * 16);
  shown.x += (x - shown.x) * k;
  shown.y += (y - shown.y) * k;
}

const isWall = (level: Level, x: number, y: number) =>
  x >= 0 && x < level.cols && cellAt(level, x, y) === '#';

/** One pass of wall blocks: corners round only where both touching sides are open. */
function wallPass(g: CanvasRenderingContext2D, level: Level, s: number, inset: number) {
  for (let y = 0; y < level.rows; y++) {
    for (let x = 0; x < level.cols; x++) {
      if (!isWall(level, x, y)) continue;
      const up = !isWall(level, x, y - 1) && y > 0;
      const down = !isWall(level, x, y + 1) && y < level.rows - 1;
      const left = !isWall(level, x - 1, y) && x > 0;
      const right = !isWall(level, x + 1, y) && x < level.cols - 1;
      const l = x * s + (left ? inset : 0);
      const t = y * s + (up ? inset : 0);
      const w = (x + 1) * s - (right ? inset : 0) - l;
      const h = (y + 1) * s - (down ? inset : 0) - t;
      const round = s * 0.45 - inset * 0.5;
      g.beginPath();
      g.roundRect(l, t, w, h, [
        up && left ? round : 0,
        up && right ? round : 0,
        down && right ? round : 0,
        down && left ? round : 0,
      ]);
      g.fill();
    }
  }
}

let wallCache: { size: number; dpr: number; canvas: HTMLCanvasElement } | null = null;

/** Neon-edged walls, painted once per tile size and stamped every frame. */
function walls(level: Level, s: number, dpr: number) {
  if (wallCache?.size === s && wallCache.dpr === dpr) return wallCache.canvas;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(level.cols * s * dpr);
  canvas.height = Math.ceil(level.rows * s * dpr);
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  g.scale(dpr, dpr);
  g.shadowColor = '#a78bfa';
  g.shadowBlur = s * 0.5;
  g.fillStyle = '#8b5cf6';
  wallPass(g, level, s, s * 0.12);
  g.shadowBlur = 0;
  g.fillStyle = '#c4b5fd';
  wallPass(g, level, s, s * 0.16);
  const inner = g.createLinearGradient(0, 0, 0, level.rows * s);
  inner.addColorStop(0, '#2e1065');
  inner.addColorStop(1, '#1e1b4b');
  g.fillStyle = inner;
  wallPass(g, level, s, s * 0.24);
  wallCache = { size: s, dpr, canvas };
  return canvas;
}

function drawFood(ctx: CanvasRenderingContext2D, world: World, b: Board, now: number) {
  const { cols } = world.level;
  const at = (key: number) => ({
    x: b.left + ((key % cols) + 0.5) * b.size,
    y: b.top + (Math.floor(key / cols) + 0.5) * b.size,
  });
  for (const key of world.berries) {
    const c = at(key);
    const r = b.size * 0.13;
    const g = ctx.createRadialGradient(c.x - r * 0.3, c.y - r * 0.3, 0, c.x, c.y, r);
    g.addColorStop(0, '#fff1f2');
    g.addColorStop(0.4, '#fb7185');
    g.addColorStop(1, '#be123c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, TAU);
    ctx.fill();
  }
  for (const key of world.stars) {
    const c = at(key);
    const pulse = 1 + Math.sin(now / 160 + key) * 0.15;
    star(ctx, c.x, c.y, b.size * 0.42 * pulse, now / 900);
  }
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, turn: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5 + turn;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, '#fffbeb');
  g.addColorStop(0.5, '#fde047');
  g.addColorStop(1, '#f59e0b');
  ctx.fillStyle = g;
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = r * 1.2;
  ctx.fill();
  ctx.shadowBlur = 0;
}

/** Pulsing rings on the tiles the player can step to next. */
function drawHints(ctx: CanvasRenderingContext2D, world: World, b: Board, now: number) {
  if (world.phase !== 'walk') return;
  ctx.lineWidth = b.size * 0.08;
  ctx.strokeStyle = `rgba(110, 231, 183, ${0.55 + Math.sin(now / 180) * 0.3})`;
  ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
  for (const dir of [0, 1, 2, 3] as Dir[]) {
    if (!canStep(world, dir)) continue;
    const d = DIRS[dir];
    const x = b.left + (world.player.x + d.x + 0.5) * b.size;
    const y = b.top + (world.player.y + d.y + 0.5) * b.size;
    ctx.beginPath();
    ctx.arc(x, y, b.size * (0.4 + Math.sin(now / 180) * 0.04), 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}

type Scene = { b: Board; dpr: number; now: number; fx: Effects; spot: (k: string) => Shown };

export function drawScene(ctx: CanvasRenderingContext2D, world: World, scene: Scene) {
  const { b, now, fx } = scene;
  const shake = fx.shake > 0 ? (Math.random() - 0.5) * b.size * 0.4 * fx.shake * 3 : 0;
  ctx.save();
  ctx.translate(shake, shake * 0.6);
  ctx.drawImage(
    walls(world.level, b.size, scene.dpr),
    b.left,
    b.top,
    world.level.cols * b.size,
    world.level.rows * b.size
  );
  const gate = world.level.exit;
  ctx.fillStyle = '#f9a8d4';
  ctx.fillRect(b.left + gate.x * b.size, b.top + (gate.y + 1.42) * b.size, b.size, b.size * 0.16);
  drawHints(ctx, world, b, now);
  drawFood(ctx, world, b, now);
  const px = (s: Shown) => ({ x: b.left + (s.x + 0.5) * b.size, y: b.top + (s.y + 0.5) * b.size });
  for (const cloud of world.clouds) {
    const scared = world.power > 0 && cloud.mode === 'chase';
    const flash = scared && world.power === 1 && Math.floor(now / 220) % 2 === 0;
    const p = px(scene.spot(`c${cloud.id}`));
    drawCloud(ctx, p.x, p.y, b.size, { cloud, scared, flash }, now);
  }
  const p = px(scene.spot('p'));
  if (world.power > 0) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.18)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, b.size * (0.75 + Math.sin(now / 120) * 0.08), 0, TAU);
    ctx.fill();
  }
  drawMunchy(ctx, p.x, p.y, b.size, world.player.dir, now);
  drawEffects(ctx, fx, b);
  ctx.restore();
}
