export type Vec2 = [number, number];

/** Axis-aligned box on the XZ plane, center + half extents. */
export type WallBox = { x: number; z: number; hw: number; hd: number };

export type Door = { id: number; x: number; z: number; axis: 'x' | 'z'; letter: string };

export type Room = {
  id: number;
  center: Vec2;
  color: string;
  letter: string;
  keyPos: Vec2;
};

export type Level = {
  word: string;
  rooms: Room[];
  doors: Door[];
  walls: WallBox[];
  pillars: WallBox[];
  start: Vec2;
};

export const ROOM = 12.6; // wall-centerline pitch between adjacent rooms
export const HALF = ROOM / 2;
export const WALL_T = 0.6;
export const WALL_H = 3;
export const DOOR_W = 3;
export const PLAYER_R = 0.45;

/** One is picked at random per run - any length works, rooms are generated. */
export const WORDS = [
  'ALYSA',
  'CAT',
  'DOG',
  'SUN',
  'MOON',
  'STAR',
  'FISH',
  'BIRD',
  'APPLE',
  'FLOWER',
];

export const PALETTE = [
  '#38bdf8',
  '#4ade80',
  '#c084fc',
  '#fbbf24',
  '#f472b6',
  '#2dd4bf',
  '#fb923c',
];

const KEY_SPOTS: Vec2[] = [
  [2.8, -2.8],
  [-3.4, -3],
  [3.4, 2.6],
  [-3.4, -3.2],
  [-2, 0.5],
  [2.6, 1.8],
  [0, -3.4],
];

/** North, East, North, West - repeating gives a weaving path that never overlaps. */
const MOVES: Vec2[] = [
  [0, -1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

type Side = 'n' | 's' | 'e' | 'w';

function dirBetween(a: Vec2, b: Vec2): Side {
  if (b[1] < a[1]) return 'n';
  if (b[1] > a[1]) return 's';
  return b[0] > a[0] ? 'e' : 'w';
}

function side(cx: number, cz: number, dir: Side, gap: boolean): WallBox[] {
  const along = HALF + WALL_T / 2; // overlap corners so no pinholes
  const seg = (ROOM + WALL_T - DOOR_W) / 2 / 2; // half-width of each segment beside a door
  const off = DOOR_W / 2 + seg;
  const horizontal = dir === 'n' || dir === 's';
  const wx = dir === 'e' ? cx + HALF : dir === 'w' ? cx - HALF : cx;
  const wz = dir === 'n' ? cz - HALF : dir === 's' ? cz + HALF : cz;
  if (!gap) {
    return horizontal
      ? [{ x: wx, z: wz, hw: along, hd: WALL_T / 2 }]
      : [{ x: wx, z: wz, hw: WALL_T / 2, hd: along }];
  }
  return horizontal
    ? [
        { x: wx - off, z: wz, hw: seg, hd: WALL_T / 2 },
        { x: wx + off, z: wz, hw: seg, hd: WALL_T / 2 },
      ]
    : [
        { x: wx, z: wz - off, hw: WALL_T / 2, hd: seg },
        { x: wx, z: wz + off, hw: WALL_T / 2, hd: seg },
      ];
}

/** Build the whole cave for a word: one room per letter, doors between neighbors. */
export function buildLevel(word: string): Level {
  const letters = word.toUpperCase().split('');
  const cells: Vec2[] = [[0, 0]];
  for (let i = 1; i < letters.length; i++) {
    const [mx, mz] = MOVES[(i - 1) % MOVES.length];
    cells.push([cells[i - 1][0] + mx, cells[i - 1][1] + mz]);
  }

  const rooms: Room[] = letters.map((letter, i) => ({
    id: i,
    center: [cells[i][0] * ROOM, cells[i][1] * ROOM],
    color: PALETTE[i % PALETTE.length],
    letter,
    keyPos: KEY_SPOTS[i % KEY_SPOTS.length],
  }));

  const doors: Door[] = rooms.slice(0, -1).map((room, i) => {
    const next = rooms[i + 1];
    return {
      id: i,
      x: (room.center[0] + next.center[0]) / 2,
      z: (room.center[1] + next.center[1]) / 2,
      axis: room.center[1] === next.center[1] ? 'z' : 'x',
      letter: room.letter,
    };
  });

  const walls: WallBox[] = [];
  const pillars: WallBox[] = [];
  rooms.forEach((room, i) => {
    const toNext = i < rooms.length - 1 ? dirBetween(cells[i], cells[i + 1]) : null;
    const toPrev = i > 0 ? dirBetween(cells[i], cells[i - 1]) : null;
    for (const dir of ['n', 's', 'e', 'w'] as Side[]) {
      if (dir === toPrev) continue; // that side was built by the previous room, with its door
      walls.push(...side(room.center[0], room.center[1], dir, dir === toNext));
    }
    if (i > 0 && i < rooms.length - 1 && i % 2 === 1) {
      pillars.push({ x: room.center[0] - 1.6, z: room.center[1] - 1.4, hw: 0.55, hd: 0.55 });
    }
  });

  return { word: letters.join(''), rooms, doors, walls, pillars, start: [0, 3.2] };
}

export function doorBox(door: Door): WallBox {
  return door.axis === 'x'
    ? { x: door.x, z: door.z, hw: DOOR_W / 2, hd: WALL_T / 2 }
    : { x: door.x, z: door.z, hw: WALL_T / 2, hd: DOOR_W / 2 };
}

/** Push a circle at (x, z) out of every box it overlaps; returns the resolved position. */
export function collide(x: number, z: number, r: number, boxes: WallBox[]): Vec2 {
  let px = x;
  let pz = z;
  for (const b of boxes) {
    const cx = Math.max(b.x - b.hw, Math.min(px, b.x + b.hw));
    const cz = Math.max(b.z - b.hd, Math.min(pz, b.z + b.hd));
    let dx = px - cx;
    let dz = pz - cz;
    const distSq = dx * dx + dz * dz;
    if (distSq >= r * r) continue;
    if (distSq === 0) {
      // center inside the box: push out along the shallowest axis
      const ox = b.hw - Math.abs(px - b.x);
      const oz = b.hd - Math.abs(pz - b.z);
      if (ox < oz) px = b.x + Math.sign(px - b.x || 1) * (b.hw + r);
      else pz = b.z + Math.sign(pz - b.z || 1) * (b.hd + r);
      continue;
    }
    const dist = Math.sqrt(distSq);
    dx /= dist;
    dz /= dist;
    px = cx + dx * r;
    pz = cz + dz * r;
  }
  return [px, pz];
}
