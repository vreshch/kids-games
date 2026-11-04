import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadBest, loadSkin, recordBest, saveSkin, SKINS } from './wiggle-skins';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('skins', () => {
  it('have unique ids and at least two colors for stripes', () => {
    expect(new Set(SKINS.map((s) => s.id)).size).toBe(SKINS.length);
    for (const skin of SKINS) expect(skin.colors.length).toBeGreaterThanOrEqual(2);
  });

  it('defaults to the first skin and round-trips a pick', () => {
    expect(loadSkin()).toBe(0);
    saveSkin(3);
    expect(loadSkin()).toBe(3);
  });

  it('ignores an unknown stored skin', () => {
    store.set('wiggle-snakes-skin', 'nope');
    expect(loadSkin()).toBe(0);
  });
});

describe('best length', () => {
  it('only ever goes up', () => {
    expect(loadBest()).toBe(0);
    expect(recordBest(120.4)).toBe(120);
    expect(recordBest(80)).toBe(120);
    expect(loadBest()).toBe(120);
  });

  it('survives storage that throws', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    });
    expect(loadSkin()).toBe(0);
    expect(recordBest(50)).toBe(50);
  });
});
