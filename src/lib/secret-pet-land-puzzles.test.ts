import { describe, expect, it } from 'vitest';

import { PETS } from './secret-pet-land-data';
import { dropItem, tap, type Target } from './secret-pet-land-puzzles';
import {
  allFound,
  clueFor,
  createWorld,
  eggVisible,
  hasPet,
  mushroomVisible,
  resetWorld,
  type PadSize,
  type World,
} from './secret-pet-land-world';

type Step = Target | [Target, PadSize];

/** Plays a list of taps 100 ms apart and returns the last world plus every pet found. */
function play(steps: Step[], start: World = createWorld()) {
  let world = start;
  const found: string[] = [];
  steps.forEach((step, i) => {
    const [target, pad] = Array.isArray(step) ? step : [step, undefined];
    const outcome = tap(world, target, { now: 1000 + i * 100, pad });
    world = outcome.world;
    if (outcome.found) found.push(outcome.found);
  });
  return { world, found };
}

const ROUTES: Record<string, Step[]> = {
  kitten: ['gift', 'gift', 'gift'],
  bunny: [
    'seeds',
    'soil',
    'water',
    'soil',
    'soil',
    'rock',
    'rock',
    'rock',
    'rock',
    'rock',
    'bunny',
  ],
  chick: ['hay', 'hay', 'hay', 'egg', 'egg', 'egg'],
  frog: [
    ['pad', 's'],
    ['pad', 'm'],
    ['pad', 'l'],
  ],
  fish: ['basket', 'bubbles'],
  owl: ['sun', 'hole'],
  hedgehog: ['bush', 'bush', 'bush', 'mushroom', 'log'],
};

describe('every secret pet can be found', () => {
  for (const pet of PETS) {
    it(`finds the ${pet.name}`, () => {
      const { world, found } = play(ROUTES[pet.id]);
      expect(found).toEqual([pet.id]);
      expect(hasPet(world, pet.id)).toBe(true);
      expect(world.hand).toBeNull();
    });
  }

  it('finds all seven in one run', () => {
    const { world } = play(Object.values(ROUTES).flat());
    expect(allFound(world)).toBe(true);
    expect(world.found).toHaveLength(7);
  });

  it('never finds the same pet twice', () => {
    const { found } = play([...ROUTES.owl, 'hole', 'sun', 'sun', 'hole']);
    expect(found).toEqual(['owl']);
  });
});

describe('the bunny under the rock', () => {
  it('opens only for 5 taps inside 2 seconds', () => {
    let world = createWorld();
    for (const now of [0, 600, 1200, 1800, 2400]) world = tap(world, 'rock', { now }).world;
    expect(world.puzzles.rockOpen).toBe(false);
    for (const now of [2500, 2600, 2700]) world = tap(world, 'rock', { now }).world;
    expect(world.puzzles.rockOpen).toBe(true);
  });

  it('wants cabbage, not seeds or empty hands', () => {
    const open = play(['rock', 'rock', 'rock', 'rock', 'rock']).world;
    expect(tap(open, 'bunny', { now: 0 }).found).toBeUndefined();
    const seeds = tap(open, 'seeds', { now: 0 }).world;
    expect(tap(seeds, 'bunny', { now: 0 }).found).toBeUndefined();
    expect(tap(open, 'rock', { now: 0 }).say).toBe('Just a rock now.');
  });

  it('grows cabbage only in order: seeds, water, pick', () => {
    expect(play(['water', 'soil']).world.puzzles.soil).toBe(0);
    expect(play(['seeds', 'soil', 'soil']).world.puzzles.soil).toBe(1);
    const grown = play(['seeds', 'soil', 'water', 'soil', 'soil']).world;
    expect(grown.hand).toBe('cabbage');
    expect(grown.puzzles.soil).toBe(0);
  });
});

describe('the frog lily pads', () => {
  it('resets on the wrong order and still works after', () => {
    const wrong = play([
      ['pad', 's'],
      ['pad', 'l'],
    ]).world;
    expect(wrong.puzzles.pads).toEqual([]);
    const { found } = play(ROUTES.frog, wrong);
    expect(found).toEqual(['frog']);
  });

  it('just says ribbit once the frog is found', () => {
    const { world } = play(ROUTES.frog);
    expect(tap(world, 'pad', { now: 0, pad: 'm' }).say).toBe('Ribbit!');
  });
});

describe('the forest', () => {
  it('owl sleeps in daylight', () => {
    expect(play(['hole']).found).toEqual([]);
    expect(play(['sun', 'sun', 'hole']).found).toEqual([]);
  });

  it('drops the mushroom without losing it', () => {
    let { world } = play(['bush', 'bush', 'bush', 'bush', 'mushroom']);
    expect(mushroomVisible(world)).toBe(false);
    world = dropItem(world).world;
    expect(mushroomVisible(world)).toBe(true);
    expect(play(['mushroom', 'log', 'log'], world).found).toEqual(['hedgehog']);
  });

  it('log needs the mushroom', () => {
    expect(play(['log']).found).toEqual([]);
    const done = play(ROUTES.hedgehog).world;
    expect(tap(done, 'log', { now: 0 }).say).toMatch(/happy/);
  });
});

describe('clues and reset', () => {
  it('egg shows after three rustles, until the chick is found', () => {
    expect(eggVisible(play(['hay', 'hay']).world)).toBe(false);
    expect(eggVisible(play(['hay', 'hay', 'hay', 'hay']).world)).toBe(true);
    expect(eggVisible(play(ROUTES.chick).world)).toBe(false);
  });

  it('gives the clue for the next pet in the place', () => {
    const world = createWorld();
    expect(clueFor(world, 'farm')).toMatch(/rock/);
    const afterBunny = play(ROUTES.bunny).world;
    expect(clueFor(afterBunny, 'farm')).toMatch(/hay/);
    expect(clueFor(play(ROUTES.kitten).world, 'home')).toMatch(/No more secrets/);
  });

  it('start over clears pets, puzzles, hand and look', () => {
    const { world } = play([...ROUTES.kitten, 'sun', 'basket']);
    expect(world.found).toHaveLength(1);
    const fresh = resetWorld();
    expect(fresh).toEqual(createWorld());
    expect(fresh.found).toEqual([]);
    expect(fresh.puzzles.night).toBe(false);
  });
});
