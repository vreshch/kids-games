import { describe, expect, it } from 'vitest';

import { CAST, FRUITS, characterById, fruitById, voiceOf } from './frankie-cast';

describe('Frankie cast', () => {
  it('has unique ids and well-formed one-bar loops', () => {
    expect(new Set(CAST.map((character) => character.id)).size).toBe(CAST.length);
    for (const character of CAST) {
      expect(character.pattern, character.id).toHaveLength(16);
      expect(character.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(character.frequency).toBeGreaterThan(0);
    }
  });

  it('has unique fruits whose extra steps land inside the bar', () => {
    expect(new Set(FRUITS.map((fruit) => fruit.id)).size).toBe(FRUITS.length);
    for (const fruit of FRUITS) {
      expect(fruit.extra.length, fruit.id).toBeGreaterThan(0);
      for (const step of fruit.extra) expect(step).toBeGreaterThanOrEqual(0);
      for (const step of fruit.extra) expect(step).toBeLessThan(16);
    }
  });

  it('looks up characters and fruits, and shrugs at unknown ids', () => {
    expect(characterById('bam')?.name).toBe('Bam');
    expect(fruitById('mango')?.name).toBe('Mango');
    expect(characterById(null)).toBeNull();
    expect(fruitById('no-such-fruit')).toBeNull();
  });
});

describe('voiceOf', () => {
  const bam = CAST[0];
  const mango = FRUITS[0];
  const lime = FRUITS.find((fruit) => fruit.id === 'lime')!;

  it('sings the plain loop before eating', () => {
    expect(voiceOf(bam, null)).toEqual({
      kind: bam.kind,
      frequency: bam.frequency,
      pattern: bam.pattern,
    });
  });

  it('adds the fruit steps without dropping the original hits', () => {
    const fed = voiceOf(bam, mango);
    for (const [i, step] of bam.pattern.entries()) if (step) expect(fed.pattern[i]).toBe(step);
    for (const step of mango.extra) expect(fed.pattern[step]).toBeGreaterThan(0);
  });

  it('detunes up for sweet fruit and down for sour', () => {
    expect(voiceOf(bam, mango).frequency).toBeGreaterThan(bam.frequency);
    expect(voiceOf(bam, lime).frequency).toBeLessThan(bam.frequency);
  });

  it('lets a fruit change the voice shape', () => {
    expect(voiceOf(bam, lime).kind).toBe('note');
    expect(
      voiceOf(
        bam,
        FRUITS.find((fruit) => fruit.id === 'cherry')!
      ).kind
    ).toBe(bam.kind);
  });
});
