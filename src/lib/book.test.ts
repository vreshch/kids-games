import { describe, expect, it } from 'vitest';

import { blurbFor, bookPages, imposeSheet, playUrl, type BookPage } from './book';
import { qrShape } from './book-qr';
import type { Game } from './games';

const game = (slug: string): Game => ({
  slug,
  title: slug.toUpperCase(),
  tagline: `${slug} tagline`,
  accent: '#000000',
  Icon: () => null,
});

const label = (page: BookPage) =>
  page.kind === 'game' ? page.game.slug : page.kind === 'draw' ? `draw${page.number}` : page.kind;

describe('bookPages', () => {
  it('puts six games on one sheet in reading order: cover, games, back', () => {
    const [sheet, ...rest] = bookPages(['a', 'b', 'c', 'd', 'e', 'f'].map(game));
    expect(rest).toEqual([]);
    expect(sheet.map(label)).toEqual(['cover', 'a', 'b', 'c', 'd', 'e', 'f', 'back']);
  });

  it('numbers game pages from 2, right after the cover', () => {
    const [sheet] = bookPages([game('a')]);
    expect(sheet[1]).toMatchObject({ kind: 'game', number: 2 });
  });

  it('starts a second book once the first is full, with draw-your-own pages to finish it', () => {
    const sheets = bookPages(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(game));
    expect(sheets).toHaveLength(2);
    const [cover] = sheets[1];
    expect(cover).toMatchObject({ kind: 'cover', sheet: 2, sheets: 2 });
    expect(cover.kind === 'cover' && cover.games.map((g) => g.slug)).toEqual(['g', 'h']);
    expect(sheets[1].map(label)).toEqual([
      'cover',
      'g',
      'h',
      'draw4',
      'draw5',
      'draw6',
      'draw7',
      'back',
    ]);
  });

  it('still prints one book with no games at all', () => {
    expect(bookPages([])).toHaveLength(1);
  });
});

describe('imposeSheet', () => {
  const [pages] = bookPages(['a', 'b', 'c', 'd', 'e', 'f'].map(game));
  const { front, back } = imposeSheet(pages);

  it('prints two copies per sheet, folded spreads 8|1 and 6|3 on the front', () => {
    expect(front.map(label)).toEqual(['back', 'cover', 'e', 'b', 'back', 'cover', 'e', 'b']);
  });

  it('backs each page with its neighbor in the book once the sheet is turned over', () => {
    expect(back.map(label)).toEqual(['c', 'd', 'a', 'f', 'c', 'd', 'a', 'f']);
    // Turned over sideways, slot i of a row sits behind slot 3 - i.
    const pairs = front.slice(0, 4).map((page, slot) => [label(page), label(back[3 - slot])]);
    expect(pairs).toEqual([
      ['back', 'f'],
      ['cover', 'a'],
      ['e', 'd'],
      ['b', 'c'],
    ]);
  });
});

describe('book copy', () => {
  it('has a kid-sized blurb per game and falls back to the tagline', () => {
    expect(blurbFor(game('wiggle-snakes'))).toContain('SUPER');
    expect(blurbFor(game('brand-new'))).toBe('brand-new tagline');
  });

  it('tags the links so a scan shows up in analytics', () => {
    expect(playUrl('perot')).toBe('https://games.vreshch.com/perot?utm_source=paper-book');
    expect(playUrl()).toBe('https://games.vreshch.com/?utm_source=paper-book');
  });
});

describe('qrShape', () => {
  it('draws a square code with its finder corner dark', () => {
    const { size, path } = qrShape(playUrl('crystal-rooms'));
    expect((size - 21) % 4).toBe(0);
    expect(size).toBeLessThanOrEqual(37);
    expect(path.startsWith('M0 0h1v1h-1z')).toBe(true);
    expect(path).not.toContain(`M${size}`);
  });
});
