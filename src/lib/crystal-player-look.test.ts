import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_LOOK,
  HATS,
  loadLook,
  OUTFIT_COLORS,
  OUTFIT_STYLES,
  saveLook,
} from './crystal-player-look';

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

describe('loadLook', () => {
  it('returns the default when nothing is stored', () => {
    expect(loadLook()).toEqual(DEFAULT_LOOK);
  });

  it('round-trips a saved look', () => {
    const look = { outfit: OUTFIT_STYLES[2].id, color: OUTFIT_COLORS[2].color, hat: HATS[1].id };
    saveLook(look);
    expect(loadLook()).toEqual(look);
  });

  it('migrates the v1 shape where outfit held the color', () => {
    store.set('crystal-rooms-look', JSON.stringify({ outfit: OUTFIT_COLORS[1].color, hat: 'bow' }));
    expect(loadLook()).toEqual({
      outfit: DEFAULT_LOOK.outfit,
      color: OUTFIT_COLORS[1].color,
      hat: 'bow',
    });
  });

  it('falls back to defaults on unknown values or junk', () => {
    store.set('crystal-rooms-look', JSON.stringify({ outfit: 'tuxedo', color: '#000', hat: 'x' }));
    expect(loadLook()).toEqual(DEFAULT_LOOK);
    store.set('crystal-rooms-look', 'not json');
    expect(loadLook()).toEqual(DEFAULT_LOOK);
  });

  it('returns the default without a window (SSR)', () => {
    vi.unstubAllGlobals();
    expect(loadLook()).toEqual(DEFAULT_LOOK);
  });
});
