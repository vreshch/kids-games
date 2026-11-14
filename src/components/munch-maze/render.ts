import { cellAt, DIRS, type Dir } from '@/lib/munch-maze-level';
import type { Cloud } from '@/lib/munch-maze-clouds';
import { canStep, type World } from '@/lib/munch-maze-world';

export type Board = { left: number; top: number; size: number };
export type Shown = { x: number; y: number };

const TAU = Math.PI * 2;
const WALL = '#3b1d8f';
const WALL_EDGE = '#a78bfa';

/** Largest square tiles that fit the canvas, centred. */
export function fitBoard(world: World, w: number, h: number): Board {
  const { cols, rows } = world.level;
  const size = Math.floor(Math.min(w / cols, h / rows));
  return { size, left: (w - size * cols) / 2, top: (h - size * rows) / 2 };
}

/** Glide the drawn spot toward the real tile; snap across the side tunnel. */
export function glide(shown: Shown, x: number, y: number, dt: number) {
  if (Math.abs(shown.x - x) > 2) shown.x = x;
  const k = Math.min(1, dt * 14);
  shown.x += (x - shown.x) * k;
  shown.y += (y - shown.y) * k;
}

function drawWalls(ctx: CanvasRenderingContext2D, world: World, b: Board) {
  const { level } = world;
  const s = b.size;
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.strokeStyle = WALL_EDGE;
  for (let y = 0; y < level.rows; y++) {
    for (let x = 0; x < level.cols; x++) {
      const ch = cellAt(level, x, y);
      const px = b.left + x * s;
      const py = b.top + y * s;
      if (ch === '=') {
        ctx.fillStyle = '#f9a8d4';
        ctx.fillRect(px, py + s * 0.4, s, s * 0.2);
      }
      if (ch !== '#') continue;
      ctx.fillStyle = WALL;
      ctx.fillRect(px, py, s, s);
      ctx.beginPath();
      const open = (dx: number, dy: number) => {
        const n = cellAt(level, x + dx, y + dy);
        return n !== '#' && !(x + dx < 0 || x + dx >= level.cols);
      };
      const edge = (dx: number, dy: number, x1: number, y1: number, x2: number, y2: number) => {
        if (!open(dx, dy)) return;
        ctx.moveTo(px + x1 * s, py + y1 * s);
        ctx.lineTo(px + x2 * s, py + y2 * s);
      };
      edge(0, -1, 0, 0, 1, 0);
      edge(0, 1, 0, 1, 1, 1);
      edge(-1, 0, 0, 0, 0, 1);
      edge(1, 0, 1, 0, 1, 1);
      ctx.stroke();
    }
  }
}

function drawFood(ctx: CanvasRenderingContext2D, world: World, b: Board, now: number) {
  const { cols } = world.level;
  const centre = (key: number) => ({
    x: b.left + ((key % cols) + 0.5) * b.size,
    y: b.top + (Math.floor(key / cols) + 0.5) * b.size,
  });
  ctx.fillStyle = '#fda4af';
  for (const key of world.berries) {
    const c = centre(key);
    ctx.beginPath();
    ctx.arc(c.x, c.y, b.size * 0.12, 0, TAU);
    ctx.fill();
  }
  const pulse = 1 + Math.sin(now / 180) * 0.15;
  for (const key of world.stars) {
    const c = centre(key);
    star(ctx, c.x, c.y, b.size * 0.38 * pulse, '#fde047');
  }
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = r;
  ctx.fill();
  ctx.shadowBlur = 0;
}

/** Glowing arrows on the tiles the player can step to next. */
function drawHints(ctx: CanvasRenderingContext2D, world: World, b: Board, now: number) {
  if (world.phase !== 'walk') return;
  const alpha = 0.35 + Math.sin(now / 200) * 0.2;
  ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
  for (const dir of [0, 1, 2, 3] as Dir[]) {
    if (!canStep(world, dir)) continue;
    const d = DIRS[dir];
    const x = b.left + (world.player.x + d.x + 0.5) * b.size;
    const y = b.top + (world.player.y + d.y + 0.5) * b.size;
    ctx.beginPath();
    ctx.arc(x, y, b.size * 0.42, 0, TAU);
    ctx.fill();
  }
}

function eyes(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, dir: Dir) {
  const look = DIRS[dir] ?? { x: 0, y: 0 };
  for (const side of [-1, 1]) {
    const ex = x + side * r * 0.38;
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(ex, y, r * 0.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(ex + look.x * r * 0.12, y + look.y * r * 0.12, r * 0.14, 0, TAU);
    ctx.fill();
  }
}

/** Munchy: a round green monster with antennae and a chomping smile. */
export function drawMunchy(
  ctx: CanvasRenderingContext2D,
  world: World,
  b: Board,
  at: Shown,
  now: number
) {
  const r = b.size * 0.46;
  const x = b.left + (at.x + 0.5) * b.size;
  const y = b.top + (at.y + 0.5) * b.size;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = r * 0.14;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * r * 0.35, y - r * 0.7);
    ctx.lineTo(x + side * r * 0.6, y - r * 1.1);
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x + side * r * 0.6, y - r * 1.1, r * 0.16, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  eyes(ctx, x, y - r * 0.2, r, world.player.dir);
  const chomp = 0.12 + Math.abs(Math.sin(now / 140)) * 0.18;
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.4, r * 0.4, r * chomp, 0, 0, TAU);
  ctx.fill();
}

/** A puffy cloud; scared clouds go pale and wobbly, flashing on their last turn. */
export function drawCloud(
  ctx: CanvasRenderingContext2D,
  world: World,
  cloud: Cloud,
  b: Board,
  at: Shown,
  now: number
) {
  const r = b.size * 0.44;
  const x = b.left + (at.x + 0.5) * b.size;
  const y = b.top + (at.y + 0.5) * b.size + Math.sin(now / 300 + cloud.id) * r * 0.08;
  const scared = world.power > 0 && cloud.mode === 'chase';
  const flash = scared && world.power === 1 && Math.floor(now / 250) % 2 === 0;
  ctx.fillStyle = scared ? (flash ? '#f8fafc' : '#93c5fd') : cloud.color;
  ctx.beginPath();
  ctx.arc(x - r * 0.45, y + r * 0.15, r * 0.55, 0, TAU);
  ctx.arc(x + r * 0.45, y + r * 0.15, r * 0.55, 0, TAU);
  ctx.arc(x, y - r * 0.2, r * 0.7, 0, TAU);
  ctx.fill();
  eyes(ctx, x, y - r * 0.1, r * 0.9, scared ? -1 : cloud.dir);
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = r * 0.1;
  ctx.beginPath();
  if (scared) {
    for (let i = 0; i <= 4; i++)
      ctx.lineTo(x - r * 0.4 + i * r * 0.2, y + r * (0.45 + (i % 2) * 0.1));
  } else {
    ctx.moveTo(x - r * 0.55, y - r * 0.55);
    ctx.lineTo(x - r * 0.15, y - r * 0.38);
    ctx.moveTo(x + r * 0.55, y - r * 0.55);
    ctx.lineTo(x + r * 0.15, y - r * 0.38);
  }
  ctx.stroke();
}

export function drawBoard(ctx: CanvasRenderingContext2D, world: World, b: Board, now: number) {
  drawWalls(ctx, world, b);
  drawHints(ctx, world, b, now);
  drawFood(ctx, world, b, now);
}
