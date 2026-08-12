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

export const ROOM = 12.6; // wall-centerline pitch between adjacent rooms
export const HALF = ROOM / 2;
export const WALL_T = 0.6;
export const WALL_H = 3;
export const DOOR_W = 3;
export const PLAYER_R = 0.45;

const cell = (cx: number, cz: number): Vec2 => [cx * ROOM, cz * ROOM];

export const ROOMS: Room[] = [
  { id: 0, center: cell(0, 0), color: '#38bdf8', letter: 'A', keyPos: [2.8, -2.8] },
  { id: 1, center: cell(0, -1), color: '#4ade80', letter: 'L', keyPos: [-3.4, -3] },
  { id: 2, center: cell(1, -1), color: '#c084fc', letter: 'Y', keyPos: [3.4, 2.6] },
  { id: 3, center: cell(1, -2), color: '#fbbf24', letter: 'S', keyPos: [-3.4, -3.2] },
  { id: 4, center: cell(0, -2), color: '#f472b6', letter: 'A', keyPos: [-2, 0.5] },
];

export const START_POS: Vec2 = [0, 3.2];
export const LETTERS = ROOMS.map((r) => r.letter);

/** Door i sits between room i and room i+1 and opens with room i's key. */
export const DOORS: Door[] = [
  { id: 0, x: 0, z: -HALF, axis: 'x', letter: 'A' },
  { id: 1, x: HALF, z: -ROOM, axis: 'z', letter: 'L' },
  { id: 2, x: ROOM, z: -ROOM - HALF, axis: 'x', letter: 'Y' },
  { id: 3, x: HALF, z: -2 * ROOM, axis: 'z', letter: 'S' },
];

type Side = 'n' | 's' | 'e' | 'w';

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

/** sides built per room; shared sides are built once, by the room whose door it is */
const PLAN: Record<number, Partial<Record<Side, 'wall' | 'door'>>> = {
  0: { s: 'wall', e: 'wall', w: 'wall', n: 'door' },
  1: { n: 'wall', w: 'wall', e: 'door' },
  2: { e: 'wall', s: 'wall', n: 'door' },
  3: { n: 'wall', e: 'wall', w: 'door' },
  4: { n: 'wall', s: 'wall', w: 'wall' },
};

export const PILLARS: WallBox[] = [
  { x: -1.6, z: -ROOM - 1.4, hw: 0.55, hd: 0.55 },
  { x: ROOM + 1.4, z: -2 * ROOM - 1.2, hw: 0.55, hd: 0.55 },
];

export const WALLS: WallBox[] = [
  ...ROOMS.flatMap((room) => {
    const plan = PLAN[room.id];
    return (Object.keys(plan) as Side[]).flatMap((dir) =>
      side(room.center[0], room.center[1], dir, plan[dir] === 'door')
    );
  }),
  ...PILLARS,
];

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
