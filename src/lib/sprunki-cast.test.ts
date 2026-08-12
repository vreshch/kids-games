import { describe, expect, it } from 'vitest';

import { CAST } from './sprunki-cast';

describe('CAST', () => {
  it('has unique ids and well-formed one-bar loops', () => {
    expect(new Set(CAST.map((character) => character.id)).size).toBe(CAST.length);
    for (const character of CAST) {
      expect(character.pattern, character.id).toHaveLength(16);
      expect(character.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(character.frequency).toBeGreaterThan(0);
    }
  });
});
