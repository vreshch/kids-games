import type { Game } from './games';
import { SITE_URL } from './site';

/** A book has 8 pages: the cover, six games, the back. */
export const GAMES_PER_SHEET = 6;

/**
 * Page numbers at each slot of one book's row, left to right, for a sheet printed on both sides
 * and flipped on the short edge. The row cuts into two cards: the cover card (back | cover outside,
 * 2 | 7 inside) wraps the middle card (6 | 3 outside, 4 | 5 inside), and one fold makes the book.
 */
const FRONT_ROW = [8, 1, 6, 3];
const BACK_ROW = [4, 5, 2, 7];

export type SheetSides = { front: BookPage[]; back: BookPage[] };

export type BookPage =
  | { kind: 'cover'; sheet: number; sheets: number; games: Game[] }
  | { kind: 'game'; game: Game; number: number }
  | { kind: 'draw'; number: number }
  | { kind: 'back' };

/** Read aloud by a grown-up, so short and concrete; the tagline covers any game added later. */
const BLURBS: Record<string, string> = {
  'scary-smile': 'Tap the smile again and again. Careful, it turns into a monster!',
  perot: 'Say something to Perot the parrot and it squawks it right back.',
  spranki: 'Drag the funny singers up on stage and build your own beat.',
  frankie: 'Feed the singers fruit and hear what silly song comes out.',
  'crystal-rooms': 'Walk the glowing caves, find the letter keys, spell the secret word.',
  'wiggle-snakes': 'Eat glowing dots, grow huge, then press SUPER and gobble every snake!',
};

export function blurbFor(game: Game): string {
  return BLURBS[game.slug] ?? game.tagline;
}

/** Tagged so the analytics can tell a scan of the paper book from a tap on the site. */
export function playUrl(slug = ''): string {
  return `${SITE_URL}/${slug}?utm_source=paper-book`;
}

/** Each book's pages in reading order. */
export function bookPages(games: Game[]): BookPage[][] {
  const sheets = Math.max(1, Math.ceil(games.length / GAMES_PER_SHEET));
  return Array.from({ length: sheets }, (_, index) => {
    const inside = games.slice(index * GAMES_PER_SHEET, (index + 1) * GAMES_PER_SHEET);
    const pages: BookPage[] = [{ kind: 'cover', sheet: index + 1, sheets, games: inside }];
    for (let slot = 0; slot < GAMES_PER_SHEET; slot++) {
      const game = inside[slot];
      const number = slot + 2;
      pages.push(game ? { kind: 'game', game, number } : { kind: 'draw', number });
    }
    pages.push({ kind: 'back' });
    return pages;
  });
}

/** Two books per sheet, one per row; an odd book out is printed twice so no half-sheet goes blank. */
export function imposeSheets(books: BookPage[][]): SheetSides[] {
  const sheets: SheetSides[] = [];
  for (let i = 0; i < books.length; i += 2) {
    const rows = [books[i], books[i + 1] ?? books[i]];
    const side = (layout: number[]) => rows.flatMap((pages) => layout.map((n) => pages[n - 1]));
    sheets.push({ front: side(FRONT_ROW), back: side(BACK_ROW) });
  }
  return sheets;
}
