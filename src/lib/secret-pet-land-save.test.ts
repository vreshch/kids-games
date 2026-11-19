import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyKid,
  cleanLook,
  DEFAULT_LOOK,
  kidOf,
  optionCount,
  randomLook,
  setPart,
} from './secret-pet-land-look';
import { loadWorld, saveWorld } from './secret-pet-land-save';
import { createWorld } from './secret-pet-land-world';

function stubStorage(initial: string | null, fail = false) {
  const store = new Map<string, string>();
  if (initial !== null) store.set('secret-pet-land', initial);
  const boom = () => {
    throw new Error('blocked');
  };
  vi.stubGlobal('window', {
    localStorage: {
      getItem: fail ? boom : (key: string) => store.get(key) ?? null,
      setItem: fail ? boom : (key: string, value: string) => store.set(key, value),
    },
  });
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe('save and load', () => {
  it('round-trips the look and the pets', () => {
    const store = stubStorage(null);
    const world = { ...createWorld(), found: ['owl' as const], hand: 'bread' as const };
    saveWorld({ ...world, look: { ...DEFAULT_LOOK, hat: 2 } });
    expect(JSON.parse(store.get('secret-pet-land')!)).not.toHaveProperty('hand');
    const loaded = loadWorld();
    expect(loaded.found).toEqual(['owl']);
    expect(loaded.look.hat).toBe(2);
    expect(loaded.hand).toBeNull();
  });

  it('starts fresh with nothing saved, broken JSON, or blocked storage', () => {
    stubStorage(null);
    expect(loadWorld()).toEqual(createWorld());
    stubStorage('{oops');
    expect(loadWorld()).toEqual(createWorld());
    stubStorage(null, true);
    expect(loadWorld()).toEqual(createWorld());
    expect(() => saveWorld(createWorld())).not.toThrow();
  });

  it('drops unknown pets, duplicates and bad look values', () => {
    stubStorage(JSON.stringify({ found: ['owl', 'dragon', 'owl'], look: { hat: 99, skin: 2 } }));
    const loaded = loadWorld();
    expect(loaded.found).toEqual(['owl']);
    expect(loaded.look).toEqual({ ...DEFAULT_LOOK, skin: 2 });
  });
});

describe('look', () => {
  it('ignores out-of-range picks', () => {
    expect(setPart(DEFAULT_LOOK, 'hat', 1).hat).toBe(1);
    expect(setPart(DEFAULT_LOOK, 'hat', 42)).toBe(DEFAULT_LOOK);
    expect(cleanLook('nope')).toEqual(DEFAULT_LOOK);
  });

  it('switches girl and boy without touching colors', () => {
    const colored = { ...DEFAULT_LOOK, topColor: 3 };
    const boy = applyKid(colored, 'boy');
    expect(kidOf(boy)).toBe('boy');
    expect(boy.topColor).toBe(3);
    expect(kidOf(applyKid(boy, 'girl'))).toBe('girl');
    expect(kidOf({ ...boy, hair: 4 })).toBeNull();
  });

  it('rolls a random look inside every option list', () => {
    expect(randomLook(() => 0)).toEqual(
      Object.fromEntries(Object.keys(DEFAULT_LOOK).map((k) => [k, 0]))
    );
    const top = randomLook(() => 0.999);
    expect(top.hair).toBe(optionCount('hair') - 1);
    expect(top.skin).toBe(optionCount('skin') - 1);
  });
});
