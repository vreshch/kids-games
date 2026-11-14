import { cellAt, opposite, stepFrom, type Dir, type Level, type Tile } from './munch-maze-level';

export type CloudMode = 'wait' | 'leave' | 'chase';
export type Cloud = Tile & {
  id: number;
  name: string;
  color: string;
  dir: Dir;
  home: Tile;
  mode: CloudMode;
  /** Turns left before the cloud floats out of its home. */
  wait: number;
};

export const CLOUD_LOOKS = [
  { name: 'Grumbo', color: '#f87171' },
  { name: 'Puffy', color: '#f9a8d4' },
  { name: 'Drizzle', color: '#60a5fa' },
  { name: 'Thunder', color: '#fb923c' },
];

/** Kids need slack: a chasing cloud takes a random turn this often. */
export const WANDER = 0.35;

export function makeClouds(level: Level): Cloud[] {
  return CLOUD_LOOKS.map((look, id) => {
    const home = level.homes[id % level.homes.length];
    return { ...look, id, home, ...home, dir: -1, mode: 'wait', wait: id * 2 };
  });
}

function canWalk(level: Level, cloud: Cloud, dir: Dir) {
  const next = stepFrom(level, cloud, dir);
  const ch = cellAt(level, next.x, next.y);
  return ch !== '#' && (ch !== '=' || cloud.mode === 'leave');
}

const dist2 = (a: Tile, b: Tile) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

type Aim = { target: Tile; scared: boolean; rng: () => number };

/** No U-turns unless stuck; head for the target, or away from it when scared. */
export function chooseCloudDir(level: Level, cloud: Cloud, aim: Aim): Dir {
  const all = ([0, 1, 2, 3] as Dir[]).filter((d) => canWalk(level, cloud, d));
  const forward = all.filter((d) => d !== opposite(cloud.dir));
  const options = forward.length > 0 ? forward : all;
  if (options.length === 0) return -1;
  const leaving = cloud.mode === 'leave';
  if (!leaving && aim.rng() < WANDER) return options[Math.floor(aim.rng() * options.length)];
  const target = leaving ? level.exit : aim.target;
  const score = (d: Dir) => dist2(stepFrom(level, cloud, d), target) * (aim.scared ? -1 : 1);
  return options.reduce((best, d) => (score(d) < score(best) ? d : best));
}

/** Each cloud aims a little differently so they spread out instead of queueing. */
export function cloudTarget(cloud: Cloud, player: Tile & { dir: Dir }, level: Level): Tile {
  if (cloud.id === 1) {
    const ahead = stepFrom(level, stepFrom(level, player, player.dir), player.dir);
    return ahead;
  }
  if (cloud.id === 2) return { x: level.cols - 1 - player.x, y: player.y };
  if (cloud.id === 3 && dist2(player, cloud) < 25) return { x: 0, y: level.rows };
  return player;
}

/** Move one tile; a leaving cloud turns into a chaser once it is past the gate. */
export function moveCloud(level: Level, cloud: Cloud, aim: Aim) {
  const dir = chooseCloudDir(level, cloud, aim);
  if (dir < 0) return;
  Object.assign(cloud, stepFrom(level, cloud, dir), { dir });
  if (cloud.mode === 'leave' && cloud.x === level.exit.x && cloud.y === level.exit.y) {
    cloud.mode = 'chase';
  }
}
