import { describe, expect, it } from 'vitest';

import { asTarget, canDrop, dragItem, dropDragged, type DragSource } from './secret-pet-land-drag';
import { tap, type Target } from './secret-pet-land-puzzles';
import { createWorld, hasPet, type World } from './secret-pet-land-world';

type Drag = [DragSource, Target | null];

function drags(steps: (Drag | Target)[], start: World = createWorld()) {
  let world = start;
  const said: string[] = [];
  steps.forEach((step, i) => {
    const outcome = Array.isArray(step)
      ? dropDragged(world, step[0], step[1], 1000 + i * 100)
      : tap(world, step, { now: 1000 + i * 100 });
    world = outcome.world;
    if (outcome.say) said.push(outcome.say);
  });
  return { world, said };
}

const ROCK: Target[] = ['rock', 'rock', 'rock', 'rock', 'rock'];

describe('drag and drop', () => {
  it('grows cabbage and feeds the bunny by drag only', () => {
    const { world } = drags([['seeds', 'soil'], ['water', 'soil'], ...ROCK, ['soil', 'bunny']]);
    expect(hasPet(world, 'bunny')).toBe(true);
    expect(world.puzzles.soil).toBe(0);
  });

  it('finds the fish and the hedgehog by drag', () => {
    const fish = drags([['basket', 'bubbles']]).world;
    expect(hasPet(fish, 'fish')).toBe(true);
    const hedgehog = drags(['bush', 'bush', 'bush', ['mushroom', 'log']]).world;
    expect(hasPet(hedgehog, 'hedgehog')).toBe(true);
  });

  it('a drag from the scene keeps what is in hand', () => {
    const { world } = drags(['basket', ['seeds', 'soil']]);
    expect(world.hand).toBe('bread');
    expect(world.puzzles.soil).toBe(1);
  });

  it('drops the item in hand on its target', () => {
    const { world } = drags(['basket', ['hand', 'bubbles']]);
    expect(hasPet(world, 'fish')).toBe(true);
    expect(world.hand).toBeNull();
  });

  it('sends a wrong or empty drop back with a hint and changes nothing', () => {
    const start = drags(['bush', 'bush', 'bush']).world;
    for (const drop of [
      ['mushroom', null],
      ['mushroom', 'soil'],
      ['water', 'soil'],
      ['basket', 'log'],
    ] as Drag[]) {
      const outcome = dropDragged(start, drop[0], drop[1], 0);
      expect(outcome.world).toBe(start);
      expect(outcome.say).toBeTruthy();
      expect(outcome.tone?.freq).toBe(180);
    }
  });

  it('cabbage cannot go to the bunny while the rock is shut', () => {
    const grown = drags([
      ['seeds', 'soil'],
      ['water', 'soil'],
    ]).world;
    expect(canDrop(grown, 'cabbage', 'bunny')).toBe(false);
    expect(dragItem(grown, 'soil')).toBe('cabbage');
    expect(dragItem(createWorld(), 'soil')).toBeNull();
    expect(dragItem(createWorld(), 'hand')).toBeNull();
    expect(dropDragged(createWorld(), 'hand', 'log', 0).say).toBeUndefined();
  });

  it('reads drop targets from the DOM attribute', () => {
    expect(asTarget('log')).toBe('log');
    expect(asTarget('rock')).toBeNull();
    expect(asTarget(null)).toBeNull();
  });
});
