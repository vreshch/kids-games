/** # wall, = gate (clouds only), . berry, o star, P player start, G cloud home, space = open path. */
export const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '####.#       #.####',
  '####.# ##=## #.####',
  '.....  #GGG#  .....',
  '####.# ##### #.####',
  '####.#       #.####',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
];

export type Tile = { x: number; y: number };

export type Level = {
  cols: number;
  rows: number;
  cells: string[];
  start: Tile;
  homes: Tile[];
  /** First open tile above the gate: where a cloud counts as "out". */
  exit: Tile;
  berries: Set<number>;
  stars: Set<number>;
};

export function parseLevel(rows: string[] = MAZE): Level {
  const cols = rows[0].length;
  const level: Level = {
    cols,
    rows: rows.length,
    cells: rows,
    start: { x: 0, y: 0 },
    homes: [],
    exit: { x: 0, y: 0 },
    berries: new Set(),
    stars: new Set(),
  };
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') level.berries.add(y * cols + x);
      else if (ch === 'o') level.stars.add(y * cols + x);
      else if (ch === 'P') level.start = { x, y };
      else if (ch === 'G') level.homes.push({ x, y });
      else if (ch === '=') level.exit = { x, y: y - 1 };
    })
  );
  return level;
}

export function cellAt(level: Level, x: number, y: number): string {
  const wx = (x + level.cols) % level.cols;
  return level.cells[y]?.[wx] ?? '#';
}

/** 0 right, 1 down, 2 left, 3 up, -1 none. */
export type Dir = -1 | 0 | 1 | 2 | 3;
export const DIRS: Tile[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

export const opposite = (dir: Dir): Dir => (dir < 0 ? -1 : (((dir + 2) % 4) as Dir));

/** One step along `dir`; the side tunnel wraps around. */
export function stepFrom(level: Level, tile: Tile, dir: Dir): Tile {
  const d = DIRS[dir] ?? { x: 0, y: 0 };
  return { x: (tile.x + d.x + level.cols) % level.cols, y: tile.y + d.y };
}

export const keyOf = (level: Level, tile: Tile) => tile.y * level.cols + tile.x;
