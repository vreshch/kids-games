import { describe, expect, it } from 'vitest';

import { blurbFor, bookPages, imposeSheets, playUrl, type BookPage } from './book';
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

describe('imposeSheets', () => {
  const pageNumber = (page: BookPage) =>
    page.kind === 'cover' ? 1 : page.kind === 'back' ? 8 : page.number;

  it('backs each page with its neighbour when the sheet flips on the short edge', () => {
    const [{ front, back }] = imposeSheets(bookPages(['a', 'b', 'c', 'd', 'e', 'f'].map(game)));
    // Flipping on the short edge mirrors columns: front slot i sits on back slot (row end - i).
    const behind = (slot: number) => back[Math.floor(slot / 4) * 4 + (3 - (slot % 4))];
    const pairs = front.map((page, slot) => [pageNumber(page), pageNumber(behind(slot))].sort());
    // Real paper: 1|2, 3|4, 5|6, 7|8 are the two sides of one leaf.
    expect(pairs.slice(0, 4)).toEqual([
      [7, 8],
      [1, 2],
      [5, 6],
      [3, 4],
    ]);
  });

  it('reads cover, 2-7, back once the second card nests in the cover card', () => {
    const [{ front, back }] = imposeSheets(bookPages(['a', 'b', 'c', 'd', 'e', 'f'].map(game)));
    // Outer card outside: back | cover, inside: 2 | 7; inner card outside: 6 | 3, inside: 4 | 5.
    expect(front.slice(0, 4).map(label)).toEqual(['back', 'cover', 'e', 'b']);
    expect(back.slice(0, 4).map(label)).toEqual(['c', 'd', 'a', 'f']);
  });

  it('fits two books on a sheet and repeats an odd one out', () => {
    const books = bookPages('abcdefghijklm'.split('').map(game));
    expect(books).toHaveLength(3);
    const sheets = imposeSheets(books);
    expect(sheets).toHaveLength(2);
    expect(sheets[0].front[1]).toMatchObject({ kind: 'cover', sheet: 1 });
    expect(sheets[0].front[5]).toMatchObject({ kind: 'cover', sheet: 2 });
    expect(sheets[1].front[1]).toMatchObject({ kind: 'cover', sheet: 3 });
    expect(sheets[1].front[5]).toMatchObject({ kind: 'cover', sheet: 3 });
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
