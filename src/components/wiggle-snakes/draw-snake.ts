import { isSuper } from '@/lib/wiggle-rules';
import { radiusFor, type Snake, type Vec } from '@/lib/wiggle-snake';
import { SKINS } from '@/lib/wiggle-skins';
import type { World } from '@/lib/wiggle-world';

const TAU = Math.PI * 2;
const BAND = 4;

function trace(ctx: CanvasRenderingContext2D, body: Vec[], from: number, to: number, step = 1) {
  ctx.beginPath();
  ctx.moveTo(body[from].x, body[from].y);
  for (let i = from + step; i < to; i += step) ctx.lineTo(body[i].x, body[i].y);
  ctx.lineTo(body[to].x + 0.01, body[to].y);
}

export function drawSnake(ctx: CanvasRenderingContext2D, world: World, snake: Snake, zoom: number) {
  const { body } = snake;
  const r = radiusFor(snake.mass);
  const last = body.length - 1;
  const glowing = isSuper(world, snake);
  const colors = SKINS[snake.skin]?.colors ?? SKINS[0].colors;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  trace(ctx, body, 0, last, 2);
  if (glowing) {
    ctx.lineWidth = r * 2 + 10 + Math.sin(world.time * 10) * 4;
    ctx.strokeStyle = '#fef08a';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.lineWidth = r * 2 + 4;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.stroke();

  // tail first, so each bead's round cap overlaps the one behind it
  for (let start = Math.floor(last / BAND) * BAND; start >= 0; start -= BAND) {
    trace(ctx, body, start, Math.min(start + BAND, last));
    ctx.strokeStyle = glowing
      ? `hsl(${(world.time * 300 + start * 7) % 360} 95% 62%)`
      : colors[(start / BAND) % colors.length];
    ctx.lineWidth = r * 2;
    ctx.stroke();
  }
  trace(ctx, body, 0, last, 2);
  ctx.lineWidth = r * 0.55;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.stroke();

  drawFace(ctx, snake, r);
  if (!snake.isPlayer) {
    ctx.font = `600 ${13 / zoom}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(snake.name, body[0].x, body[0].y + r + 18 / zoom);
  }
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawFace(ctx: CanvasRenderingContext2D, snake: Snake, r: number) {
  const head = snake.body[0];
  const a = snake.angle;
  for (const side of [-1, 1]) {
    const at = (turn: number, dist: number) => ({
      x: head.x + Math.cos(a + side * turn) * dist,
      y: head.y + Math.sin(a + side * turn) * dist,
    });
    const cheek = at(1.7, r * 0.62);
    dot(ctx, cheek.x, cheek.y, r * 0.2, 'rgba(251, 113, 133, 0.6)');
    const eye = at(0.75, r * 0.55);
    dot(ctx, eye.x, eye.y, r * 0.42, '#ffffff');
    const px = eye.x + Math.cos(snake.targetAngle) * r * 0.16;
    const py = eye.y + Math.sin(snake.targetAngle) * r * 0.16;
    dot(ctx, px, py, r * 0.22, '#111827');
    dot(ctx, px - r * 0.07, py - r * 0.08, r * 0.07, '#ffffff');
  }
}
