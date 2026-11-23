import { describe, expect, it } from 'vitest';

import { damage, fire, stepBullets, stepPickup } from './tanky-town-bullets';
import { ALL_DIRS, DX, DY, LEVEL_COUNT, LEVEL_DEFS, parseLevel } from './tanky-town-level';
import {
  addTank,
  enemiesOf,
  heroOf,
  setTile,
  tankPos,
  tileAt,
  type Input,
  type World,
} from './tanky-town-state';
import { canEnter, chooseDir, drive, respawnHero, spawnEnemies } from './tanky-town-tanks';
import { createWorld, enemiesLeft, step } from './tanky-town-world';

const fixed = (value: number) => () => value;
const IDLE: Input = { dir: null, fire: false };
const run = (world: World, seconds: number, input: Input = IDLE) => {
  for (let t = 0; t < seconds; t += 0.02) step(world, 0.02, input);
};
/** A calm world: the hero at home, one enemy that never leaves its gate. */
const quiet = (level = 0) => {
  const world = createWorld(fixed(0.5), level);
  world.queue = ['basic'];
  world.spawnIn = 999;
  return world;
};
const beaten = (level = 0) => Object.assign(quiet(level), { queue: [] });
const types = (world: World) => world.events.map((event) => event.type);

describe('levels', () => {
  it('has five maps of 11 by 13 with one cake, one home and three gates', () => {
    expect(LEVEL_COUNT).toBe(5);
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const level = parseLevel(i);
      expect(LEVEL_DEFS[i].map.every((row) => row.length === 11)).toBe(true);
      expect(level.rows).toBe(13);
      expect(level.tiles.filter((tile) => tile === 'cake')).toHaveLength(1);
      expect(level.spawns).toHaveLength(3);
      expect(level.player).toBeDefined();
      expect(level.roster.every(Boolean)).toBe(true);
    }
  });

  it('lets every gate and the hero reach the cake wall', () => {
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const world = createWorld(fixed(0.5), i);
      const { cols, cake } = world.level;
      const seen = new Set<number>();
      const todo = [cake];
      while (todo.length > 0) {
        const at = todo.pop()!;
        for (const dir of ALL_DIRS) {
          const next = { x: at.x + DX[dir], y: at.y + DY[dir] };
          const tile = tileAt(world, next.x, next.y);
          if (tile === 'steel' || tile === 'water' || seen.has(next.y * cols + next.x)) continue;
          seen.add(next.y * cols + next.x);
          todo.push(next);
        }
      }
      for (const start of [...world.level.spawns, world.level.player]) {
        expect(seen.has(start.y * cols + start.x)).toBe(true);
      }
    }
  });

  it('gets harder: more enemies on every level', () => {
    const sizes = LEVEL_DEFS.map((def) => def.roster.length);
    expect([...sizes].sort((a, b) => a - b)).toEqual(sizes);
    expect(new Set(sizes).size).toBe(LEVEL_COUNT);
  });
});

describe('driving', () => {
  it('hops one tile at a time and stops at walls', () => {
    const world = quiet();
    const hero = heroOf(world)!;
    run(world, 0.1, { dir: 2, fire: false });
    expect(hero.x).toBe(2);
    expect(tankPos(hero).x).toBeGreaterThan(2);
    run(world, 3, { dir: 2, fire: false });
    expect(hero.x).toBe(0);
    expect(hero.off).toBe(0);
  });

  it('turns in place when a brick is in the way', () => {
    const world = quiet();
    const hero = heroOf(world)!;
    run(world, 0.5, { dir: 0, fire: false });
    expect(hero.dir).toBe(0);
    expect(hero.x).toBe(3);
  });

  it('keeps tanks out of each other, water and steel, but lets them hide in bushes', () => {
    const world = quiet();
    const hero = heroOf(world)!;
    const other = addTank(world, 'basic', { x: 3, y: 11 }, 1);
    expect(canEnter(world, hero, 3, 11)).toBe(false);
    expect(canEnter(world, other, 3, 10)).toBe(false);
    setTile(world, 3, 10, 'empty');
    expect(canEnter(world, other, 3, 10)).toBe(true);
    setTile(world, 3, 10, 'water');
    expect(canEnter(world, other, 3, 10)).toBe(false);
    setTile(world, 3, 10, 'bush');
    expect(canEnter(world, other, 3, 10)).toBe(true);
    expect(canEnter(world, other, -1, 11)).toBe(false);
  });

  it('holds the tile a tank is leaving until the hop is done', () => {
    const world = quiet();
    const hero = heroOf(world)!;
    drive(world, hero, 0.05, () => 3);
    const other = addTank(world, 'basic', { x: 2, y: 12 }, 0);
    expect(hero.y).toBe(11);
    expect(canEnter(world, other, 3, 12)).toBe(false);
  });
});

describe('shooting', () => {
  it('cracks a brick, then removes it, one bullet at a time', () => {
    const world = quiet();
    const input = { dir: 0 as const, fire: true };
    run(world, 0.2, input);
    expect(world.bullets.length).toBeLessThanOrEqual(1);
    expect(tileAt(world, 4, 12)).toBe('cracked');
    run(world, 0.6, input);
    expect(tileAt(world, 4, 12)).toBe('empty');
    expect(types(world)).toContain('brick');
  });

  it('never lets the hero ruin the cake', () => {
    const world = quiet();
    setTile(world, 4, 12, 'empty');
    run(world, 1, { dir: 0, fire: true });
    expect(world.phase).toBe('play');
    expect(heroOf(world)!.x).toBe(4);
  });

  it('bounces off steel and leaves the field at the edge', () => {
    const world = quiet();
    setTile(world, 3, 10, 'steel');
    run(world, 0.5, { dir: 3, fire: true });
    expect(types(world)).toContain('clang');
    expect(tileAt(world, 3, 10)).toBe('steel');
    world.bullets = [{ x: 0, y: 5, dir: 2, owner: 'player', tankId: 99 }];
    stepBullets(world, 0.2);
    expect(world.bullets).toHaveLength(0);
  });

  it('destroys an enemy, scores, and needs three hits for a tough one', () => {
    const world = quiet();
    const hero = heroOf(world)!;
    hero.dir = 3;
    addTank(world, 'basic', { x: 3, y: 9 }, 1).reload = 99;
    fire(world, hero);
    stepBullets(world, 0.3);
    expect(enemiesOf(world)).toHaveLength(0);
    expect(world.score).toBe(100);
    const tough = addTank(world, 'tough', { x: 3, y: 9 }, 1);
    damage(world, tough);
    damage(world, tough);
    expect(tough.hp).toBe(1);
    expect(types(world)).toContain('hurt');
    damage(world, tough);
    expect(world.score).toBe(400);
  });

  it('pops two bullets that meet head on', () => {
    const world = quiet();
    world.bullets = [
      { x: 5, y: 5, dir: 0, owner: 'player', tankId: 1 },
      { x: 5.2, y: 5, dir: 2, owner: 'enemy', tankId: 2 },
    ];
    stepBullets(world, 0.01);
    expect(world.bullets).toHaveLength(0);
  });
});

describe('enemies', () => {
  it('come out of the gates up to the level limit', () => {
    const world = createWorld(fixed(0.5));
    run(world, 12);
    expect(enemiesOf(world).length).toBeLessThanOrEqual(world.level.maxActive);
    expect(enemiesOf(world).length).toBeGreaterThan(0);
    expect(enemiesLeft(world)).toBe(world.level.roster.length);
  });

  it('wait when every gate is blocked', () => {
    const world = createWorld(fixed(0.5));
    for (const gate of world.level.spawns) addTank(world, 'hero', gate, 1);
    spawnEnemies(world, 5);
    expect(enemiesOf(world)).toHaveLength(0);
  });

  it('pick a direction they can use, toward the cake when the dice say so', () => {
    const world = quiet();
    const tank = addTank(world, 'basic', { x: 0, y: 1 }, 3);
    const rolls = [0.9, 0.1];
    world.rng = () => rolls.shift() ?? 0;
    expect(chooseDir(world, tank)).toBe(1);
    world.rng = fixed(0.1);
    tank.dir = 0;
    expect(chooseDir(world, tank)).toBe(0);
    const boxed = addTank(world, 'basic', { x: 5, y: 5 }, 0);
    for (const dir of ALL_DIRS) setTile(world, 5 + DX[dir], 5 + DY[dir], 'steel');
    expect(ALL_DIRS).toContain(chooseDir(world, boxed));
  });

  it('end the game when a shot reaches the cake', () => {
    const world = quiet();
    world.bullets = [{ x: 5, y: 11.6, dir: 1, owner: 'enemy', tankId: 9 }];
    setTile(world, 5, 11, 'empty');
    stepBullets(world, 0.05);
    expect(world.phase).toBe('over');
    expect(types(world)).toEqual(expect.arrayContaining(['cake', 'over']));
    step(world, 0.02, IDLE);
  });
});

describe('lives', () => {
  it('shields a fresh hero, then a hit costs a life and the hero comes back', () => {
    const world = quiet();
    const hero = heroOf(world)!;
    damage(world, hero);
    expect(world.lives).toBe(3);
    hero.shield = 0;
    damage(world, hero);
    expect(world.lives).toBe(2);
    expect(heroOf(world)).toBeUndefined();
    addTank(world, 'basic', world.level.player, 1);
    respawnHero(world, 5);
    expect(heroOf(world)).toBeUndefined();
    world.tanks = [];
    run(world, 1.5);
    expect(heroOf(world)?.shield).toBeGreaterThan(0);
  });

  it('is game over when the last life is gone', () => {
    const world = quiet();
    world.lives = 1;
    const hero = heroOf(world)!;
    hero.shield = 0;
    damage(world, hero);
    expect(world.phase).toBe('over');
  });

  it('drops a heart on the third kill; grabbing it adds a life, waiting loses it', () => {
    const world = quiet();
    for (let i = 0; i < 3; i++) damage(world, addTank(world, 'basic', { x: 0, y: 4 }, 1));
    expect(world.pickup).not.toBeNull();
    world.pickup = { x: 3, y: 12, ttl: 5 };
    stepPickup(world, 0.1, heroOf(world));
    expect(world.lives).toBe(4);
    expect(world.pickup).toBeNull();
    world.pickup = { x: 0, y: 0, ttl: 0.05 };
    stepPickup(world, 0.1);
    expect(world.pickup).toBeNull();
    stepPickup(world, 0.1);
  });
});

describe('progress', () => {
  it('clears a level when every enemy is beaten, then loads the next map', () => {
    const world = beaten();
    world.score = 100;
    step(world, 0.02, IDLE);
    expect(world.phase).toBe('clear');
    expect(world.score).toBe(600);
    run(world, 1);
    expect(world.levelIndex).toBe(0);
    run(world, 2);
    expect(world.levelIndex).toBe(1);
    expect(world.phase).toBe('play');
    expect(world.score).toBe(600);
    expect(heroOf(world)).toBeDefined();
    expect(types(world)).toContain('level');
  });

  it('is won after the fifth level and then stays frozen', () => {
    const world = beaten(LEVEL_COUNT - 1);
    step(world, 0.02, IDLE);
    expect(world.phase).toBe('won');
    expect(types(world)).toContain('won');
    run(world, 5);
    expect(world.levelIndex).toBe(LEVEL_COUNT - 1);
  });

  it('plays from level one to the win through step alone', () => {
    const world = createWorld(fixed(0.5));
    for (let t = 0; t < 60 && world.phase !== 'won'; t += 0.02) {
      world.queue = [];
      world.tanks = world.tanks.filter((tank) => tank.owner === 'player');
      step(world, 0.02, IDLE);
    }
    expect(world.phase).toBe('won');
    expect(world.score).toBe(2500);
  });
});
