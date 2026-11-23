import type { LevelDef } from './tanky-town-level';

/** The two bottom rows are the same on every map: the cake in its brick wall, the home tiles. */
const BASE = ['....BBB....', '...PBCB....'];

/**
 * A map from its left half: eleven rows of six letters, top to bottom, split by spaces.
 * The sixth letter is the middle column; the right half is the mirror image.
 */
function mirrored(half: string): string[] {
  const rows = half.split(' ').map((row) => row + [...row.slice(0, 5)].reverse().join(''));
  return [...rows, ...BASE];
}

type Recipe = [name: string, roster: string, maxActive: number, half: string];

const RECIPES: Recipe[] = [
  [
    'Twin Towers',
    'bfbtbfbbtbfbtb',
    4,
    'E....E ...... .SB.B. .BB.B. .BB... ....SS .BB... .BB.B. .SB.B. ...... ..B...',
  ],
  [
    'Lily Pads',
    'fbbtbfbtbfbbtf',
    4,
    'E....E ..B... .WW.B. .WW.B. ...... B.BB.S ...... .WW.B. .WW.B. ...... .B....',
  ],
  [
    'Hedge Rows',
    'bfbtfbtbfbtbfbt',
    4,
    'E....E .GGGG. .B..B. .B..B. GG.GGG ...... .SS.BB ...... GG.GGG .B..B. ......',
  ],
  [
    'Checkers',
    'fbtbfbtbfbtfbtb',
    4,
    'E....E .B.B.B B.B.B. .B.B.B ...... S.B.S. ...... .B.B.B B.B.B. .B.B.B ......',
  ],
  [
    'Castle Wall',
    'btfbtfbtbfbtfbt',
    4,
    'E....E ...... SSB.BS ...... .BBBB. .B.... .B.SS. .B.... .BBBB. ...... ..B...',
  ],
  [
    'Zigzag River',
    'fbtfbtbfbtfbtbfb',
    4,
    'E....E ...... WWWW.. ...... ..WWWW ...... WWWW.B ...... .BB.B. .BB.B. ......',
  ],
  [
    'Deep Forest',
    'bftbftbfbtfbtfbt',
    4,
    'E....E GGG.GG GBG.GB GGG.GG ...... .GG.GS .GG.G. ...... GGB.BG GGB.BG ......',
  ],
  [
    'Steel Cross',
    'tfbtfbtbftbfbtfb',
    4,
    'E....E ...... .B.S.. .B.S.. .B.SSS ...... BB.B.B ...... .S.BB. .S.... ......',
  ],
  [
    'Brick Sea',
    'fbtfbtfbtbftbfbtf',
    4,
    'E....E BBBBB. BBBBB. ...... .BBBBB .BBBBB ...... BBBBB. BBBBB. ...... ..BB..',
  ],
  [
    'Islands',
    'tfbtfbftbtfbtfbtb',
    4,
    'E....E ...... .WW.SS .WW... ....B. BB..B. ....B. .WW... .WW.SS ...... .B....',
  ],
  [
    'Bunkers',
    'ftbftbtfbtftbfbtf',
    4,
    'E....E ...... .SBS.. .B.B.B .SBS.B ...... ..B.SB ..B... .SBS.. .B.B.. ......',
  ],
  [
    'Hide and Seek',
    'tfbtftbftbtfbtfbtf',
    4,
    'E....E .G.G.G .S.S.S .G.G.G ...... GGBBGG ...... .S.G.S .G.B.G ...... .B.B..',
  ],
  [
    'Moat',
    'ftbtfbtftbtfbtftbf',
    5,
    'E....E ...... .BBBBB .B.... .B.WWW .B.W.. .B.WWW .B.... .BBBBB ...... ......',
  ],
  [
    'Corridors',
    'tftbftbtftbftbtfbt',
    5,
    'E....E .S.S.. .S.S.B .S.S.B .B.B.. ...... B.S.S. B.S.S. ..B.B. .S...S ......',
  ],
  [
    'Diamond',
    'ftbtftbtfbtftbtfbtf',
    5,
    'E....E ...... ....BB ...BB. ..BB.. .BB..S ..BB.. ...BB. ....BB ...... .B....',
  ],
  [
    'Swamp',
    'tftbtftbftbtftbtfbt',
    5,
    'E....E .G.W.. .G.W.B ....GB WW..G. ....B. .BB.B. ....WW GG.... .B.GG. ......',
  ],
  [
    'Iron Gate',
    'ftbtftftbtftbtftbtf',
    5,
    'E....E ...... SSS.SS ...... .B.B.B .B.B.B ...... SS.SSS ...... .BB.B. ......',
  ],
  [
    'Honeycomb',
    'tftftbtftbtftftbtftb',
    5,
    'E....E .BB.BB B..B.. .BB.BB B..B.. .BB.BB ...... .SB.BS ...... B.BB.B ......',
  ],
  [
    'Crossfire',
    'ftftbtftftbtftbtftft',
    5,
    'E....E ...... .B.B.S ...... SB.B.B ...... .B.S.B ...... SB.B.B ...... .B..B.',
  ],
  [
    'Last Stand',
    'tftftftbtftftbtftftt',
    5,
    'E....E .S.B.S .B.B.B ...... WW.S.W ...... GGBBGG .S.... .B.SB. .B.... ......',
  ],
];

/** Levels 6 to 25, in play order. */
export const MORE_LEVELS: LevelDef[] = RECIPES.map(([name, roster, maxActive, half]) => ({
  name,
  roster,
  maxActive,
  map: mirrored(half),
}));
