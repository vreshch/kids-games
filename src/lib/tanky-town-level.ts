import { MORE_LEVELS } from './tanky-town-more-levels';

/** 0 right, 1 down, 2 left, 3 up. */
export type Dir = 0 | 1 | 2 | 3;
export const DX = [1, 0, -1, 0] as const;
export const DY = [0, 1, 0, -1] as const;
export const ALL_DIRS: Dir[] = [0, 1, 2, 3];

export type Tile = 'empty' | 'brick' | 'cracked' | 'steel' | 'water' | 'bush' | 'cake';
export type EnemyKind = 'basic' | 'fast' | 'tough';
export type Point = { x: number; y: number };

export type Level = {
  name: string;
  cols: number;
  rows: number;
  tiles: Tile[];
  /** Where each player seat starts and comes back; seat 1 mirrors seat 0. */
  homes: Point[];
  spawns: Point[];
  cake: Point;
  roster: EnemyKind[];
  maxActive: number;
};

export type LevelDef = { name: string; roster: string; maxActive: number; map: string[] };

const TILES: Record<string, Tile> = { B: 'brick', S: 'steel', W: 'water', G: 'bush', C: 'cake' };
const KINDS: Record<string, EnemyKind> = { b: 'basic', f: 'fast', t: 'tough' };

/** Map letters: B brick, S steel, W water, G bush, C cake, P player, E enemy gate. */
const FIRST_LEVELS: LevelDef[] = [
  {
    name: 'Brick Garden',
    roster: 'bbbbbb',
    maxActive: 2,
    map: [
      'E....E....E',
      '...........',
      '.BB.BBB.BB.',
      '.BB.BBB.BB.',
      '...........',
      'GG.BB.BB.GG',
      '...........',
      '.BB.SSS.BB.',
      '.BB.....BB.',
      '...........',
      '..BB...BB..',
      '....BBB....',
      '...PBCB....',
    ],
  },
  {
    name: 'Duck Pond',
    roster: 'bbfbbfbb',
    maxActive: 3,
    map: [
      'E....E....E',
      '.B.B...B.B.',
      '.B.B.S.B.B.',
      '...........',
      'BB.WWWWW.BB',
      '...WWWWW...',
      '.G.......G.',
      '.GBB.S.BBG.',
      '...........',
      'SB.BB.BB.BS',
      '...........',
      '.B..BBB..B.',
      '...PBCB....',
    ],
  },
  {
    name: 'Bush Maze',
    roster: 'bfbbtbfbbf',
    maxActive: 3,
    map: [
      'E....E....E',
      '.GG.BBB.GG.',
      '.GG.....GG.',
      'BB.SS.SS.BB',
      '...........',
      '.BBB.G.BBB.',
      '...GGGGG...',
      '.S.B.G.B.S.',
      '...B...B...',
      'GG.BB.BB.GG',
      'GG.......GG',
      '....BBB....',
      '...PBCB....',
    ],
  },
  {
    name: 'Stone Fort',
    roster: 'bfbtbfbtbfbb',
    maxActive: 4,
    map: [
      'E....E....E',
      '...........',
      'SS.BBBBB.SS',
      '...B...B...',
      '.B.B.S.B.B.',
      '.B.......B.',
      'WW.SBBBS.WW',
      '...........',
      '.BB.B.B.BB.',
      '.S..B.B..S.',
      '....B.B....',
      '.B..BBB..B.',
      '...PBCB....',
    ],
  },
  {
    name: 'River Crossing',
    roster: 'fbtbfbtfbtbfbt',
    maxActive: 4,
    map: [
      'E....E....E',
      '.B.S...S.B.',
      '.B.......B.',
      'GGG.BBB.GGG',
      '...........',
      'WWW.WWW.WWW',
      '...........',
      '.BS.GGG.SB.',
      '.B..GGG..B.',
      '....B.B....',
      'SB.......BS',
      '.B..BBB..B.',
      '...PBCB....',
    ],
  },
];

/** Every level in play order: the five starters, then twenty more. */
export const LEVEL_DEFS: LevelDef[] = [...FIRST_LEVELS, ...MORE_LEVELS];

export const LEVEL_COUNT = LEVEL_DEFS.length;

export function parseLevel(index: number): Level {
  const def = LEVEL_DEFS[index];
  const cols = def.map[0].length;
  const cells = def.map.join('').split('');
  const at = (i: number): Point => ({ x: i % cols, y: Math.floor(i / cols) });
  const find = (letter: string) => cells.flatMap((c, i) => (c === letter ? [at(i)] : []));
  return {
    name: def.name,
    cols,
    rows: def.map.length,
    tiles: cells.map((c) => TILES[c] ?? 'empty'),
    homes: find('P').flatMap((p) => [p, { x: cols - 1 - p.x, y: p.y }]),
    spawns: find('E'),
    cake: find('C')[0],
    roster: def.roster.split('').map((c) => KINDS[c]),
    maxActive: def.maxActive,
  };
}
