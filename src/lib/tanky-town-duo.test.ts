import { describe, expect, it } from 'vitest';

import { damage } from './tanky-town-bullets';
import { LEVEL_COUNT, parseLevel } from './tanky-town-level';
import { applySnapshot, coast, sameInput, snapshot, type Snapshot } from './tanky-town-net';
import { addTank, playerTank, tankPos, type Input, type World } from './tanky-town-state';
import { createWorld, step } from './tanky-town-world';

const fixed = (value: number) => () => value;
const IDLE: Input = { dir: null, fire: false };
const run = (world: World, seconds: number, inputs: Input[]) => {
  for (let t = 0; t < seconds; t += 0.02) step(world, 0.02, inputs);
};
/** Two players, one enemy that never leaves its gate. */
const duo = () => {
  const world = createWorld(fixed(0.5), 0, 2);
  world.queue = ['basic'];
  world.spawnIn = 999;
  return world;
};
const overTheWire = (snap: Snapshot) => JSON.parse(JSON.stringify(snap)) as Snapshot;

describe('two players', () => {
  it('gives each seat a free home tile on every level', () => {
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const level = parseLevel(i);
      for (const home of level.homes) {
        expect(level.tiles[home.y * level.cols + home.x]).toBe('empty');
      }
      expect(level.homes[1]).toEqual({ x: 7, y: 12 });
    }
  });

  it('starts with two tanks and two extra lives; one player is unchanged', () => {
    const world = duo();
    expect(playerTank(world, 0)).toMatchObject({ x: 3, y: 12, seat: 0 });
    expect(playerTank(world, 1)).toMatchObject({ x: 7, y: 12, seat: 1 });
    expect(world.lives).toBe(5);
    const solo = createWorld(fixed(0.5));
    expect(solo.lives).toBe(3);
    expect(playerTank(solo, 1)).toBeUndefined();
  });

  it('drives each tank from its own input', () => {
    const world = duo();
    run(world, 0.4, [{ dir: 3, fire: false }, IDLE]);
    expect(playerTank(world, 0)!.y).toBeLessThan(12);
    expect(playerTank(world, 1)).toMatchObject({ x: 7, y: 12 });
    run(world, 0.4, [IDLE, { dir: 0, fire: false }]);
    expect(playerTank(world, 1)!.x).toBeGreaterThan(7);
    run(world, 0.2, [IDLE]);
  });

  it('never lets friends hurt each other', () => {
    const world = duo();
    const friend = playerTank(world, 1)!;
    friend.shield = 0;
    world.bullets = [{ x: 6.8, y: 12, dir: 0, owner: 'player', tankId: 1 }];
    run(world, 0.2, [IDLE, IDLE]);
    expect(playerTank(world, 1)).toBeDefined();
    expect(world.lives).toBe(5);
  });

  it('brings back only the player who was hit, at their own home', () => {
    const world = duo();
    const friend = playerTank(world, 1)!;
    friend.shield = 0;
    damage(world, friend);
    expect(world.lives).toBe(4);
    expect(playerTank(world, 0)).toBeDefined();
    run(world, 1.5, [IDLE, IDLE]);
    expect(playerTank(world, 1)).toMatchObject({ x: 7, y: 12 });
    expect(world.tanks.filter((tank) => tank.seat === 0)).toHaveLength(1);
  });

  it('keeps both tanks when the next level loads', () => {
    const world = duo();
    world.queue = [];
    run(world, 3, [IDLE, IDLE]);
    expect(world.levelIndex).toBe(1);
    expect(world.tanks.map((tank) => tank.seat)).toEqual([0, 1]);
  });
});

describe('snapshots', () => {
  it('rebuild the same game on the other side', () => {
    const host = duo();
    addTank(host, 'tough', { x: 0, y: 4 }, 1);
    run(host, 0.6, [
      { dir: 3, fire: true },
      { dir: 2, fire: true },
    ]);
    host.pickup = { x: 1, y: 1, ttl: 5 };
    const guest = createWorld(fixed(0), 0, 2);
    applySnapshot(guest, overTheWire(snapshot(host, [{ type: 'boom', x: 1, y: 2 }])));
    for (const key of ['tiles', 'tanks', 'bullets', 'pickup', 'queue', 'lives', 'score'] as const) {
      expect(guest[key]).toEqual(host[key]);
    }
    expect(guest.events).toEqual([{ type: 'boom', x: 1, y: 2 }]);
    expect(guest.level).toEqual(host.level);
  });

  it('swap the map when the host is on another level', () => {
    const host = createWorld(fixed(0.5), 3, 2);
    const guest = createWorld(fixed(0), 0, 2);
    applySnapshot(guest, overTheWire(snapshot(host, [])));
    expect(guest.level.name).toBe('Stone Fort');
    expect(guest.tiles).toEqual(host.tiles);
  });

  it('stay small enough to send many times a second', () => {
    const world = createWorld(fixed(0.5), 4, 2);
    run(world, 10, [
      { dir: 3, fire: true },
      { dir: 3, fire: true },
    ]);
    expect(JSON.stringify(snapshot(world, [])).length).toBeLessThan(4000);
  });

  it('coast tanks and bullets forward between snapshots without deciding anything', () => {
    const world = duo();
    run(world, 0.1, [{ dir: 3, fire: false }, IDLE]);
    const tank = playerTank(world, 0)!;
    const before = tankPos(tank).y;
    world.bullets = [{ x: 5, y: 5, dir: 0, owner: 'enemy', tankId: 9 }];
    coast(world, 0.05);
    expect(tankPos(tank).y).toBeLessThan(before);
    expect(world.bullets[0].x).toBeCloseTo(5.25);
    coast(world, 5);
    expect(tank.off).toBe(0);
    expect(world.events).toHaveLength(0);
    world.phase = 'over';
    coast(world, 1);
    expect(world.bullets[0].x).toBeCloseTo(30.25);
  });
});

describe('input', () => {
  it('tells when the input changed', () => {
    expect(sameInput(IDLE, { dir: null, fire: false })).toBe(true);
    expect(sameInput(IDLE, { dir: 1, fire: false })).toBe(false);
    expect(sameInput(IDLE, { dir: null, fire: true })).toBe(false);
  });
});
