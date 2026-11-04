import { describe, expect, it } from 'vitest';

import {
  activateSuper,
  gobble,
  headTouches,
  loserOf,
  SUPER_DURATION,
  superState,
} from './wiggle-rules';
import { createSnake, radiusFor, START_MASS } from './wiggle-snake';
import {
  BOT_COUNT,
  createWorld,
  FOOD_TARGET,
  spawnPlayer,
  standings,
  stepWorld,
  type World,
} from './wiggle-world';

/** mulberry32: same seed, same game - keeps the physics tests deterministic. */
function seeded(seed = 7) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function emptyWorld(): World {
  const world = createWorld(8, seeded());
  world.snakes = [];
  world.foods = [];
  return world;
}

let nextId = 100;
const snake = (mass: number, x: number, y: number, angle = 0, isPlayer = false) =>
  createSnake({ id: nextId++, name: `S${nextId}`, skin: 0, isPlayer, mass, angle, x, y });

describe('createWorld', () => {
  it('fills the arena with bots and dots, each bot with its own name', () => {
    const world = createWorld(8, seeded());
    expect(world.snakes).toHaveLength(BOT_COUNT);
    expect(world.foods).toHaveLength(FOOD_TARGET);
    expect(new Set(world.snakes.map((s) => s.name)).size).toBe(BOT_COUNT);
  });

  it('spawns exactly one player, ready to press super', () => {
    const world = createWorld(8, seeded());
    spawnPlayer(world, 2);
    const player = spawnPlayer(world, 3);
    expect(world.snakes.filter((s) => s.isPlayer)).toEqual([player]);
    expect(player.mass).toBe(START_MASS);
    expect(player.skin).toBe(3);
    expect(superState(world).ready).toBe(true);
  });
});

describe("Alisa's rule", () => {
  it('lets the bigger snake gobble the smaller one, whoever bumps', () => {
    const world = emptyWorld();
    const big = snake(300, 0, 0);
    const small = snake(20, 0, 0);
    expect(loserOf(world, small, big)).toBe(small);
    expect(loserOf(world, big, small)).toBe(small);
  });

  it('sees a head touching a body but not a body far away', () => {
    const body = snake(100, 0, 0);
    expect(headTouches({ x: -40, y: 5 }, 12, body)).toBe(true);
    expect(headTouches({ x: -40, y: 400 }, 12, body)).toBe(false);
  });

  it('turns a gobbled snake into dots worth most of its mass', () => {
    const world = emptyWorld();
    const eater = snake(300, 0, 500);
    const victim = snake(100, 0, 0);
    world.snakes = [eater, victim];
    gobble(world, eater, victim);
    expect(victim.alive).toBe(false);
    const total = world.foods.reduce((sum, f) => sum + f.value, 0);
    expect(total).toBeCloseTo(100 * 0.8 + 4);
    expect(world.events).toEqual([{ type: 'gobble', eater, victim }]);
  });

  it('plays out in the world: a little bot bumping a big player gets gobbled', () => {
    const world = emptyWorld();
    const player = snake(300, 0, 0, 0, true);
    world.player = player;
    const bot = snake(20, player.body[25].x, player.body[25].y + 5, Math.PI / 2);
    world.snakes = [player, bot];
    stepWorld(world, 1 / 60);
    expect(bot.alive).toBe(false);
    expect(player.alive).toBe(true);
    expect(world.events.some((e) => e.type === 'gobble' && e.eater === player)).toBe(true);
  });

  it('brings a gobbled bot back after a short wait', () => {
    const world = emptyWorld();
    const a = snake(50, 0, 0);
    const b = snake(50, 0, 2000);
    world.snakes = [a, b];
    gobble(world, b, a);
    for (let t = 0; t < 2.2; t += 0.1) stepWorld(world, 0.1);
    expect(world.snakes.filter((s) => s.alive)).toHaveLength(2);
  });
});

describe('super button', () => {
  function duel() {
    const world = emptyWorld();
    const player = snake(20, -20, -60, 0, true);
    const giant = snake(400, 0, 0, Math.PI / 2);
    world.snakes = [player, giant];
    world.player = player;
    return { world, player, giant };
  }

  it('without super, the little player loses to the giant', () => {
    const { world, player, giant } = duel();
    expect(loserOf(world, player, giant)).toBe(player);
  });

  it('with super, the little player gobbles the giant', () => {
    const { world, player, giant } = duel();
    expect(activateSuper(world)).toBe(true);
    expect(loserOf(world, player, giant)).toBe(giant);
    expect(loserOf(world, giant, player)).toBe(giant);
    stepWorld(world, 1 / 60);
    expect(giant.alive).toBe(false);
    expect(player.alive).toBe(true);
  });

  it('lasts a few seconds, then fills back up before it can fire again', () => {
    const { world } = duel();
    activateSuper(world);
    expect(superState(world)).toMatchObject({ active: true, ready: false });
    expect(activateSuper(world)).toBe(false);
    world.time += SUPER_DURATION + 1;
    const charging = superState(world);
    expect(charging.active).toBe(false);
    expect(charging.ready).toBe(false);
    expect(charging.charge).toBeGreaterThan(0);
    expect(charging.charge).toBeLessThan(1);
    world.time = world.superReadyAt;
    expect(superState(world)).toMatchObject({ ready: true, charge: 1 });
  });

  it('does nothing without a living player', () => {
    const world = emptyWorld();
    expect(activateSuper(world)).toBe(false);
  });
});

describe('stepWorld', () => {
  it('burns mass while boosting and leaves a trail of dots', () => {
    const world = emptyWorld();
    world.arenaRadius = 100_000;
    const player = snake(100, 0, 0, 0, true);
    player.boosting = true;
    world.snakes = [player];
    world.player = player;
    for (let i = 0; i < 30; i++) stepWorld(world, 1 / 60);
    expect(player.mass).toBeLessThan(100);
    expect(world.foods.some((f) => Math.abs(f.value - 0.72) < 1e-9)).toBe(true);
  });

  it('runs a whole minute of play without breaking', () => {
    const world = createWorld(8, seeded(3));
    spawnPlayer(world, 0);
    for (let i = 0; i < 1800; i++) stepWorld(world, 1 / 30);
    const alive = world.snakes.filter((s) => s.alive);
    expect(alive.length).toBeGreaterThan(BOT_COUNT / 2);
    for (const s of alive) {
      expect(Number.isFinite(s.body[0].x + s.body[0].y)).toBe(true);
      expect(Math.hypot(s.body[0].x, s.body[0].y)).toBeLessThanOrEqual(world.arenaRadius);
      expect(radiusFor(s.mass)).toBeGreaterThan(0);
    }
  });

  it('ranks the biggest snakes first', () => {
    const world = createWorld(8, seeded());
    const board = standings(world);
    expect(board.map((s) => s.rank)).toEqual(board.map((_, i) => i + 1));
    for (let i = 1; i < board.length; i++) {
      expect(board[i - 1].length).toBeGreaterThanOrEqual(board[i].length);
    }
  });
});
