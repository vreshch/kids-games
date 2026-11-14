const TAU = Math.PI * 2;
const CONFETTI = ['#f472b6', '#fde047', '#34d399', '#60a5fa', '#fb923c', '#c084fc'];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  text?: string;
  spin?: number;
};

/** Sparkles, confetti and floating "+10"s, in tile units so they survive a resize. */
export type Effects = { parts: Particle[]; shake: number };

export const createEffects = (): Effects => ({ parts: [], shake: 0 });

export function sparkle(fx: Effects, x: number, y: number, color: string, count = 8) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + Math.random() * 0.5;
    const speed = 2 + Math.random() * 2.5;
    fx.parts.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.45,
      max: 0.45,
      color,
      size: 0.08 + Math.random() * 0.06,
    });
  }
}

export function popup(fx: Effects, x: number, y: number, text: string, color = '#fde047') {
  fx.parts.push({ x, y, vx: 0, vy: -1.6, life: 0.9, max: 0.9, color, size: 0.55, text });
}

export function confetti(fx: Effects, x: number, y: number, count = 40) {
  for (let i = 0; i < count; i++) {
    fx.parts.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 14,
      vy: -4 - Math.random() * 8,
      life: 1.6,
      max: 1.6,
      color: CONFETTI[i % CONFETTI.length],
      size: 0.18 + Math.random() * 0.12,
      spin: Math.random() * TAU,
    });
  }
}

export function stepEffects(fx: Effects, dt: number) {
  fx.shake = Math.max(0, fx.shake - dt);
  for (const p of fx.parts) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.spin !== undefined) {
      p.vy += 14 * dt;
      p.spin += dt * 8;
    }
  }
  fx.parts = fx.parts.filter((p) => p.life > 0);
}

type Board = { left: number; top: number; size: number };

export function drawEffects(ctx: CanvasRenderingContext2D, fx: Effects, b: Board) {
  for (const p of fx.parts) {
    const x = b.left + p.x * b.size;
    const y = b.top + p.y * b.size;
    ctx.globalAlpha = Math.min(1, (p.life / p.max) * 1.5);
    ctx.fillStyle = p.color;
    if (p.text) {
      ctx.font = `800 ${Math.round(b.size * p.size)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = b.size * 0.08;
      ctx.strokeStyle = '#1e1b4b';
      ctx.strokeText(p.text, x, y);
      ctx.fillText(p.text, x, y);
    } else if (p.spin !== undefined) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.spin);
      ctx.fillRect(
        -p.size * b.size * 0.5,
        -p.size * b.size * 0.25,
        p.size * b.size,
        p.size * b.size * 0.5
      );
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, p.size * b.size, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
