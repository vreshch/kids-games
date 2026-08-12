import { existsSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { GAMES, gameMetadata } from './games';

describe('GAMES registry', () => {
  it('has unique kebab-case slugs, hex accents, and taglines', () => {
    expect(new Set(GAMES.map((game) => game.slug)).size).toBe(GAMES.length);
    for (const game of GAMES) {
      expect(game.slug).toMatch(/^[a-z0-9-]+$/);
      expect(game.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(game.tagline.length).toBeGreaterThan(0);
    }
  });

  it('has a page route for every game', () => {
    for (const game of GAMES) {
      const pagePath = path.join(import.meta.dirname, '..', 'app', game.slug, 'page.tsx');
      expect(existsSync(pagePath), `missing src/app/${game.slug}/page.tsx`).toBe(true);
    }
  });
});

describe('gameMetadata', () => {
  it('derives title, description, and canonical from the registry', () => {
    const meta = gameMetadata('crystal-rooms');
    expect(meta.title).toBe('Crystal Rooms');
    expect(meta.description).toBeTruthy();
    expect(meta.alternates?.canonical).toBe('/crystal-rooms');
  });

  it('returns empty metadata for an unknown slug', () => {
    expect(gameMetadata('no-such-game')).toEqual({});
  });
});
