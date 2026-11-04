import { radiusFor, type Snake } from './wiggle-snake';

export type Food = { x: number; y: number; r: number; value: number; color: number; phase: number };

export const FOOD_COLORS = [
  '#f472b6',
  '#38bdf8',
  '#4ade80',
  '#facc15',
  '#c084fc',
  '#fb923c',
  '#f87171',
  '#2dd4bf',
];

const MAGNET_REACH = 70;
const MAGNET_SPEED = 320;

export const foodRadius = (value: number) => 3 + Math.sqrt(value) * 2.2;

export function pelletAt(rand: () => number, x: number, y: number, value: number): Food {
  return {
    x,
    y,
    r: foodRadius(value),
    value,
    color: Math.floor(rand() * FOOD_COLORS.length),
    phase: rand() * Math.PI * 2,
  };
}

/** A fresh dot anywhere in the arena, spread evenly over the disc. */
export function randomFood(rand: () => number, arenaRadius: number): Food {
  const dist = Math.sqrt(rand()) * (arenaRadius - 30);
  const angle = rand() * Math.PI * 2;
  return pelletAt(rand, Math.cos(angle) * dist, Math.sin(angle) * dist, rand() < 0.15 ? 3 : 1);
}

/** Pull nearby dots into the mouth and swallow the ones that arrive; returns mass gained. */
export function eatFood(snake: Snake, foods: Food[], dt: number) {
  const head = snake.body[0];
  const r = radiusFor(snake.mass);
  const reach = r + MAGNET_REACH;
  let gained = 0;
  for (let i = foods.length - 1; i >= 0; i--) {
    const food = foods[i];
    const dx = head.x - food.x;
    const dy = head.y - food.y;
    if (Math.abs(dx) > reach || Math.abs(dy) > reach) continue;
    const d = Math.hypot(dx, dy);
    if (d < r + food.r * 0.3) {
      gained += food.value;
      foods[i] = foods[foods.length - 1];
      foods.pop();
    } else if (d < reach) {
      const step = Math.min(d, MAGNET_SPEED * dt) / d;
      food.x += dx * step;
      food.y += dy * step;
    }
  }
  snake.mass += gained;
  return gained;
}
