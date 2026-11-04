import { describe, expect, it } from 'vitest';

import { nearestDanger, thinkBot, type BotSurroundings } from './wiggle-bots';
import { pelletAt } from './wiggle-food';
import { createSnake } from './wiggle-snake';

let nextId = 1;
const snake = (mass: number, x: number, y: number, isPlayer = false) =>
  createSnake({ id: nextId++, name: 'S', skin: 0, isPlayer, mass, angle: 0, x, y });

const around = (over: Partial<BotSurroundings>): BotSurroundings => ({
  snakes: [],
  foods: [],
  arenaRadius: 3000,
  superSnake: null,
  rand: () => 0.5,
  ...over,
});

describe('thinkBot', () => {
  it('turns back toward the middle near the wall', () => {
    const bot = snake(30, 2900, 0);
    thinkBot(bot, around({ snakes: [bot] }), 1);
    expect(Math.abs(bot.targetAngle)).toBeCloseTo(Math.PI);
  });

  it('runs and zooms away from the super player', () => {
    const bot = snake(80, 200, 0);
    const hero = snake(20, 0, 0, true);
    thinkBot(bot, around({ snakes: [bot, hero], superSnake: hero }), 1);
    expect(bot.targetAngle).toBeCloseTo(0);
    expect(bot.boosting).toBe(true);
  });

  it('steers away from a bigger snake right next to it', () => {
    const bot = snake(20, 0, 60);
    const giant = snake(500, 0, 0);
    thinkBot(bot, around({ snakes: [bot, giant] }), 1);
    expect(bot.targetAngle).toBeGreaterThan(0);
    expect(nearestDanger(bot, [bot, giant])).not.toBeNull();
  });

  it('hunts smaller snakes when bold', () => {
    const bot = snake(200, 0, 0);
    bot.bold = true;
    const snack = snake(20, 0, 300);
    thinkBot(bot, around({ snakes: [bot, snack] }), 1);
    expect(bot.targetAngle).toBeCloseTo(Math.PI / 2, 1);
  });

  it('heads for the juiciest nearby dot', () => {
    const bot = snake(30, 0, 0);
    const foods = [pelletAt(() => 0.5, 0, -200, 1), pelletAt(() => 0.5, -250, 0, 9)];
    thinkBot(bot, around({ snakes: [bot], foods }), 1);
    expect(Math.abs(bot.targetAngle)).toBeCloseTo(Math.PI);
  });

  it('wanders when there is nothing around', () => {
    const bot = snake(30, 0, 0);
    thinkBot(bot, around({ snakes: [bot], rand: () => 1 }), 1);
    expect(bot.targetAngle).toBeCloseTo(0.45);
  });

  it('only re-plans a few times a second', () => {
    const bot = snake(30, 2900, 0);
    bot.thinkIn = 0.1;
    thinkBot(bot, around({ snakes: [bot] }), 0.01);
    expect(bot.targetAngle).toBe(0);
  });
});
