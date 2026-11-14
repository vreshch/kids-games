import { describe, expect, it } from 'vitest';

import { chooseCloudDir, makeClouds, moveCloud } from './munch-maze-clouds';
import { cellAt, keyOf, MAZE, parseLevel, stepFrom, type Dir } from './munch-maze-level';
import {
  canStep,
  cloudSteps,
  createWorld,
  LIVES,
  nextTurn,
  POWER_TURNS,
  rollDie,
  stepClouds,
  stepPlayer,
  type World,
} from './munch-maze-world';

const fixed = (value: number) => () => value;
const openDir = (world: World) => ([0, 1, 2, 3] as Dir[]).find((d) => canStep(world, d)) ?? -1;

describe('maze', () => {
  it('has equal-width rows, one start, three homes, a gate and four stars', () => {
    const level = parseLevel();
    expect(new Set(MAZE.map((row) => row.length)).size).toBe(1);
    expect(level.homes).toHaveLength(3);
    expect(level.stars.size).toBe(4);
    expect(cellAt(level, level.exit.x, level.exit.y + 1)).toBe('=');
  });

  it('lets the player reach every berry and star from the start', () => {
    const level = parseLevel();
    const seen = new Set([keyOf(level, level.start)]);
    const todo = [level.start];
    while (todo.length > 0) {
      const tile = todo.pop()!;
      for (const dir of [0, 1, 2, 3] as Dir[]) {
        const next = stepFrom(level, tile, dir);
        const ch = cellAt(level, next.x, next.y);
        if (ch === '#' || ch === '=' || seen.has(keyOf(level, next))) continue;
        seen.add(keyOf(level, next));
        todo.push(next);
      }
    }
    for (const key of [...level.berries, ...level.stars]) expect(seen.has(key)).toBe(true);
  });

  it('wraps through the side tunnel', () => {
    const level = parseLevel();
    expect(stepFrom(level, { x: 0, y: 9 }, 2)).toEqual({ x: level.cols - 1, y: 9 });
  });
});

describe('turns', () => {
  it('rolls 1 to 6 and only while waiting for a roll', () => {
    expect(rollDie(createWorld(fixed(0)))).toBe(1);
    const world = createWorld(fixed(0.99));
    expect(rollDie(world)).toBe(6);
    expect(rollDie(world)).toBe(0);
  });

  it('walks exactly the rolled steps, counting each one, then hands over to the clouds', () => {
    const world = createWorld(fixed(0.4));
    expect(stepPlayer(world, 2)).toBe(false);
    const die = rollDie(world);
    for (let i = 1; i <= die; i++) {
      expect(stepPlayer(world, openDir(world))).toBe(true);
      expect(world.events.at(-1)?.type === 'clouds' || world.stepsLeft === die - i).toBe(true);
    }
    expect(world.phase).toBe('clouds');
    expect(world.events.filter((e) => e.type === 'step')).toHaveLength(die);
    expect(world.score).toBeGreaterThan(0);
  });

  it('refuses walls', () => {
    const world = createWorld(fixed(0));
    rollDie(world);
    expect(stepPlayer(world, 1)).toBe(false);
    expect(world.stepsLeft).toBe(1);
  });

  it('runs the cloud queue then gives the die back', () => {
    const world = createWorld(fixed(0));
    rollDie(world);
    stepPlayer(world, openDir(world));
    expect(world.queue).toHaveLength(cloudSteps(1) * 4);
    for (let i = 0; i < 20 && world.phase === 'clouds'; i++) stepClouds(world);
    expect(world.phase).toBe('roll');
  });

  it('speeds the clouds up slowly with the round', () => {
    expect(cloudSteps(1)).toBe(2);
    expect(cloudSteps(3)).toBe(3);
    expect(cloudSteps(99)).toBe(4);
  });
});

describe('clouds', () => {
  it('float out through the gate and start chasing', () => {
    const level = parseLevel();
    const [cloud] = makeClouds(level);
    cloud.mode = 'leave';
    for (let i = 0; i < 6 && cloud.mode === 'leave'; i++) {
      moveCloud(level, cloud, { target: level.start, scared: false, rng: fixed(0.9) });
    }
    expect(cloud.mode).toBe('chase');
    expect(cloud).toMatchObject(level.exit);
  });

  it('never step back down through the gate while chasing', () => {
    const level = parseLevel();
    const [cloud] = makeClouds(level);
    Object.assign(cloud, level.exit, { mode: 'chase', dir: 0 });
    const dir = chooseCloudDir(level, cloud, {
      target: level.homes[0],
      scared: false,
      rng: fixed(0.9),
    });
    expect(dir).not.toBe(1);
  });

  it('catch the player and cost a life', () => {
    const world = createWorld(fixed(0));
    const cloud = world.clouds[0];
    rollDie(world);
    const dir = openDir(world);
    Object.assign(cloud, stepFrom(world.level, world.player, dir), { mode: 'chase' });
    stepPlayer(world, dir);
    expect(world.lives).toBe(LIVES - 1);
    expect(world.phase).toBe('caught');
    nextTurn(world);
    expect(world.phase).toBe('roll');
    expect(world.player).toMatchObject(world.level.start);
  });

  it('get gobbled after a star and fly home', () => {
    const world = createWorld(fixed(0));
    world.power = POWER_TURNS;
    const cloud = world.clouds[0];
    rollDie(world);
    const dir = openDir(world);
    Object.assign(cloud, stepFrom(world.level, world.player, dir), { mode: 'chase' });
    stepPlayer(world, dir);
    expect(world.lives).toBe(LIVES);
    expect(cloud.mode).toBe('wait');
    expect(world.events.some((e) => e.type === 'gobble')).toBe(true);
  });

  it('end the game on the last life', () => {
    const world = createWorld(fixed(0));
    world.lives = 1;
    rollDie(world);
    const dir = openDir(world);
    Object.assign(world.clouds[0], stepFrom(world.level, world.player, dir), { mode: 'chase' });
    stepPlayer(world, dir);
    expect(world.phase).toBe('over');
  });
});

describe('stars and rounds', () => {
  it('a star scares the clouds; clearing the maze starts a new round', () => {
    const world = createWorld(fixed(0));
    const [star] = world.stars;
    world.berries.clear();
    world.stars = new Set([star]);
    const tile = { x: star % world.level.cols, y: Math.floor(star / world.level.cols) };
    const dir = ([0, 1, 2, 3] as Dir[]).find((d) => {
      const from = stepFrom(world.level, tile, d);
      return cellAt(world.level, from.x, from.y) !== '#';
    }) as Dir;
    Object.assign(world.player, stepFrom(world.level, tile, dir));
    rollDie(world);
    stepPlayer(world, ((dir + 2) % 4) as Dir);
    expect(world.power).toBe(POWER_TURNS);
    expect(world.phase).toBe('clear');
    nextTurn(world);
    expect(world.round).toBe(2);
    expect(world.berries.size).toBe(world.level.berries.size);
  });
});
