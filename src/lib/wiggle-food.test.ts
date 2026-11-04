import { describe, expect, it } from 'vitest';

import { eatFood, FOOD_COLORS, foodRadius, pelletAt, randomFood } from './wiggle-food';
import { createSnake } from './wiggle-snake';

const snake = () =>
  createSnake({ id: 1, name: 'T', skin: 0, isPlayer: true, mass: 20, angle: 0, x: 0, y: 0 });

describe('food', () => {
  it('spawns inside the arena with a valid color', () => {
    for (let i = 0; i < 200; i++) {
      const food = randomFood(Math.random, 500);
      expect(Math.hypot(food.x, food.y)).toBeLessThan(500);
      expect(FOOD_COLORS[food.color]).toBeDefined();
    }
  });

  it('makes juicier dots bigger', () => {
    expect(foodRadius(8)).toBeGreaterThan(foodRadius(1));
  });

  it('swallows a dot at the mouth and grows by its value', () => {
    const s = snake();
    const foods = [pelletAt(Math.random, 2, 0, 5)];
    expect(eatFood(s, foods, 1 / 60)).toBe(5);
    expect(foods).toHaveLength(0);
    expect(s.mass).toBe(25);
  });

  it('pulls nearby dots in and leaves far ones alone', () => {
    const s = snake();
    const near = pelletAt(Math.random, 60, 0, 1);
    const far = pelletAt(Math.random, 400, 0, 1);
    eatFood(s, [near, far], 1 / 60);
    expect(near.x).toBeLessThan(60);
    expect(far.x).toBe(400);
  });
});
