import { describe, expect, it } from 'vitest';

import { blurbFor, bookSheets, playUrl, type BookPage } from './book';
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

describe('bookSheets', () => {
  it('lays six games out so the folded sheet reads cover, 1-6, back', () => {
    const [sheet, ...rest] = bookSheets(['a', 'b', 'c', 'd', 'e', 'f'].map(game));
    expect(rest).toEqual([]);
    expect(sheet.top.map(label)).toEqual(['d', 'c', 'b', 'a']);
    expect(sheet.bottom.map(label)).toEqual(['e', 'f', 'back', 'cover']);
  });

  it('numbers game pages from 2, right after the cover', () => {
    const [sheet] = bookSheets([game('a')]);
    expect(sheet.top.at(-1)).toMatchObject({ kind: 'game', number: 2 });
  });

  it('starts a second book once the first is full, with draw-your-own pages to finish it', () => {
    const sheets = bookSheets(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(game));
    expect(sheets).toHaveLength(2);
    expect(sheets[1].bottom.at(-1)).toMatchObject({ kind: 'cover', sheet: 2, sheets: 2 });
    const cover = sheets[1].bottom.at(-1);
    expect(cover?.kind === 'cover' && cover.games.map((g) => g.slug)).toEqual(['g', 'h']);
    expect(sheets[1].top.map(label)).toEqual(['draw5', 'draw4', 'h', 'g']);
    expect(sheets[1].bottom.map(label)).toEqual(['draw6', 'draw7', 'back', 'cover']);
  });

  it('still prints one book with no games at all', () => {
    expect(bookSheets([])).toHaveLength(1);
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
