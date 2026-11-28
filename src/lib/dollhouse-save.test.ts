import { describe, expect, it } from 'vitest';

import { reduce } from './dollhouse-reducer';
import { loadSave, parseSave, writeSave } from './dollhouse-save';
import { createState } from './dollhouse-state';

const openPresent = (s: ReturnType<typeof createState>) =>
  (['present', 'present', 'present', 'nextPresent'] as const).reduce(
    (state, type) => reduce(state, { type }),
    s
  );

describe('save', () => {
  it('cleans bad data', () => {
    expect(parseSave(null)).toBeUndefined();
    expect(parseSave('{oops')).toBeUndefined();
    const saved = parseSave(
      JSON.stringify({
        house: 1,
        progress: [{ items: [1, 2, 3, 4], secrets: ['hole', 'x', 'hole'] }],
      })
    );
    expect(saved?.house).toBe(0);
    expect(saved?.progress[0].items).toEqual(['key', 'flashlight', 'teddy']);
    expect(saved?.progress[0].secrets).toEqual(['hole']);
  });

  it('unlocks the second house when all three secrets are saved', () => {
    const secrets = ['picture', 'cupboard', 'hole'];
    const saved = parseSave(JSON.stringify({ house: 1, progress: [{ secrets }] }));
    expect(saved).toMatchObject({ unlocked: true, house: 1 });
  });

  it('writes and loads through localStorage, and survives blocked storage', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    const g = globalThis as { window?: unknown };
    g.window = { localStorage: storage };
    writeSave(openPresent(createState()));
    expect(loadSave()?.progress[0].items).toEqual(['key']);
    g.window = {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    };
    expect(loadSave()).toBeUndefined();
    expect(() => writeSave(createState())).not.toThrow();
    delete g.window;
  });
});
