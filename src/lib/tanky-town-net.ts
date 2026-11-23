import { BULLET_SPEED } from './tanky-town-bullets';
import { DX, DY, parseLevel, type Tile } from './tanky-town-level';
import { SPEED, type Input, type TankEvent, type World } from './tanky-town-state';

const CODES: Tile[] = ['empty', 'brick', 'cracked', 'steel', 'water', 'bush', 'cake'];
const ROOM_ID = /^[a-z0-9]{4,12}$/;
const ROOM_LETTERS = 'abcdefghjkmnpqrstuvwxyz23456789';

/** What the host sends about 30 times a second: the whole game, tiles packed one digit each. */
export type Snapshot = Pick<
  World,
  | 'levelIndex'
  | 'tanks'
  | 'bullets'
  | 'pickup'
  | 'queue'
  | 'lives'
  | 'score'
  | 'kills'
  | 'phase'
  | 'players'
> & { tiles: string; events: TankEvent[] };

/** The only messages the two players exchange. */
export type NetMessage = { t: 'snap'; s: Snapshot } | ({ t: 'input' } & Input) | { t: 'again' };

export function snapshot(world: World, events: TankEvent[]): Snapshot {
  return {
    levelIndex: world.levelIndex,
    tiles: world.tiles.map((tile) => CODES.indexOf(tile)).join(''),
    tanks: world.tanks,
    bullets: world.bullets,
    pickup: world.pickup,
    queue: world.queue,
    lives: world.lives,
    score: world.score,
    kills: world.kills,
    phase: world.phase,
    players: world.players,
    events,
  };
}

/** Guest side: the host's picture replaces the local one; its events play here too. */
export function applySnapshot(world: World, snap: Snapshot) {
  const { tiles, events, ...rest } = snap;
  if (rest.levelIndex !== world.levelIndex) world.level = parseLevel(rest.levelIndex);
  Object.assign(world, rest);
  world.tiles = [...tiles].map((code) => CODES[Number(code)]);
  world.events.push(...events);
}

/** Guest side, between snapshots: things keep rolling the way they were; nothing is decided. */
export function coast(world: World, dt: number) {
  if (world.phase !== 'play') return;
  for (const tank of world.tanks) tank.off = Math.max(0, tank.off - SPEED[tank.kind] * dt);
  for (const bullet of world.bullets) {
    bullet.x += DX[bullet.dir] * BULLET_SPEED[bullet.owner] * dt;
    bullet.y += DY[bullet.dir] * BULLET_SPEED[bullet.owner] * dt;
  }
}

export const isRoomId = (value: unknown): value is string =>
  typeof value === 'string' && ROOM_ID.test(value);

/** Six letters that are easy to read aloud: no 0/o, 1/l/i. */
export function newRoomId(rng: () => number = Math.random) {
  const pick = () => ROOM_LETTERS[Math.floor(rng() * ROOM_LETTERS.length)];
  return Array.from({ length: 6 }, pick).join('');
}

export const sameInput = (a: Input, b: Input) => a.dir === b.dir && a.fire === b.fire;
