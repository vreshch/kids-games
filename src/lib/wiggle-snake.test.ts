import { describe, expect, it } from 'vitest';

import {
  angleDelta,
  BASE_SPEED,
  BOOST_SPEED,
  createSnake,
  MIN_BOOST_MASS,
  moveSnake,
  radiusFor,
  SEGMENT_SPACING,
  segmentsFor,
  turnRateFor,
} from './wiggle-snake';

const make = (mass = 20, x = 0, y = 0, angle = 0) =>
  createSnake({ id: 1, name: 'T', skin: 0, isPlayer: true, mass, angle, x, y });

describe('sizing', () => {
  it('grows fatter and longer with mass, up to a cap', () => {
    expect(radiusFor(100)).toBeGreaterThan(radiusFor(10));
    expect(segmentsFor(100)).toBeGreaterThan(segmentsFor(10));
    expect(radiusFor(1e6)).toBe(40);
    expect(segmentsFor(1e6)).toBe(500);
  });

  it('turns big snakes slower than small ones', () => {
    expect(turnRateFor(2000)).toBeLessThan(turnRateFor(10));
  });
});

describe('angleDelta', () => {
  it('takes the short way round', () => {
    expect(angleDelta(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2);
    expect(angleDelta(3, -3)).toBeCloseTo(Math.PI * 2 - 6);
    expect(angleDelta(-3, 3)).toBeCloseTo(6 - Math.PI * 2);
  });
});

describe('moveSnake', () => {
  it('lays a straight trail behind a fresh snake', () => {
    const snake = make();
    expect(snake.body).toHaveLength(segmentsFor(20) + 1);
    expect(snake.body[1].x).toBeCloseTo(-SEGMENT_SPACING);
  });

  it('moves the head at base speed and keeps samples evenly spaced', () => {
    const snake = make();
    for (let i = 0; i < 30; i++) moveSnake(snake, 1 / 60, 3000);
    expect(snake.body[0].x).toBeCloseTo(BASE_SPEED * 0.5);
    for (let i = 2; i < snake.body.length; i++) {
      const a = snake.body[i - 1];
      const b = snake.body[i];
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeCloseTo(SEGMENT_SPACING);
    }
    expect(snake.body).toHaveLength(segmentsFor(20) + 1);
  });

  it('boosts only when it has mass to spare', () => {
    const big = make(100);
    big.boosting = true;
    moveSnake(big, 0.1, 3000);
    expect(big.body[0].x).toBeCloseTo(BOOST_SPEED * 0.1);

    const tiny = make(MIN_BOOST_MASS);
    tiny.boosting = true;
    moveSnake(tiny, 0.1, 3000);
    expect(tiny.body[0].x).toBeCloseTo(BASE_SPEED * 0.1);
  });

  it('turns no faster than its turn rate', () => {
    const snake = make();
    snake.targetAngle = Math.PI;
    moveSnake(snake, 0.1, 3000);
    expect(snake.angle).toBeCloseTo(turnRateFor(20) * 0.1);
  });

  it('slides along the wall instead of leaving the arena', () => {
    const snake = make(20, 990, 0);
    for (let i = 0; i < 20; i++) moveSnake(snake, 0.05, 1000);
    expect(Math.hypot(snake.body[0].x, snake.body[0].y)).toBeLessThanOrEqual(1000);
  });

  it('grows a longer tail after eating', () => {
    const snake = make();
    snake.mass = 200;
    moveSnake(snake, 0.01, 3000);
    expect(snake.body).toHaveLength(segmentsFor(200) + 1);
  });
});
