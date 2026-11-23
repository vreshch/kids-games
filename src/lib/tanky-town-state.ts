import {
  DX,
  DY,
  type Dir,
  type EnemyKind,
  type Level,
  type Point,
  type Tile,
} from './tanky-town-level';

export type Owner = 'player' | 'enemy';
export type TankKind = EnemyKind | 'hero';

/** A tank sits on tile (x, y); `off` is how much of the last hop is still to drive. */
export type Tank = {
  id: number;
  owner: Owner;
  kind: TankKind;
  x: number;
  y: number;
  dir: Dir;
  off: number;
  hp: number;
  reload: number;
  shield: number;
  think: number;
};

export type Bullet = { x: number; y: number; dir: Dir; owner: Owner; tankId: number };
export type Pickup = Point & { ttl: number };
export type Phase = 'play' | 'clear' | 'won' | 'over';
export type Input = { dir: Dir | null; fire: boolean };

export type TankEventType =
  | 'shot'
  | 'brick'
  | 'clang'
  | 'boom'
  | 'hurt'
  | 'spawn'
  | 'heart'
  | 'cake'
  | 'clear'
  | 'level'
  | 'won'
  | 'over';
export type TankEvent = Point & { type: TankEventType; owner?: Owner };

export type World = {
  levelIndex: number;
  level: Level;
  tiles: Tile[];
  tanks: Tank[];
  bullets: Bullet[];
  pickup: Pickup | null;
  queue: EnemyKind[];
  spawnIn: number;
  respawnIn: number;
  /** Seconds of "level clear" party left before the next map loads. */
  clearIn: number;
  lives: number;
  score: number;
  kills: number;
  phase: Phase;
  events: TankEvent[];
  rng: () => number;
  nextId: number;
};

export const SPEED: Record<TankKind, number> = { hero: 3.4, basic: 1.7, fast: 2.8, tough: 1.3 };
export const HP: Record<TankKind, number> = { hero: 1, basic: 1, fast: 1, tough: 3 };
export const POINTS: Record<EnemyKind, number> = { basic: 100, fast: 200, tough: 300 };

export const inBounds = (world: World, x: number, y: number) =>
  x >= 0 && y >= 0 && x < world.level.cols && y < world.level.rows;

export const tileAt = (world: World, x: number, y: number): Tile =>
  inBounds(world, x, y) ? world.tiles[y * world.level.cols + x] : 'steel';

export function setTile(world: World, x: number, y: number, tile: Tile) {
  world.tiles[y * world.level.cols + x] = tile;
}

/** Where the tank really is right now, mid-hop included. */
export const tankPos = (tank: Tank): Point => ({
  x: tank.x - DX[tank.dir] * tank.off,
  y: tank.y - DY[tank.dir] * tank.off,
});

export const heroOf = (world: World) => world.tanks.find((tank) => tank.owner === 'player');
export const enemiesOf = (world: World) => world.tanks.filter((tank) => tank.owner === 'enemy');

export function emit(world: World, type: TankEventType, at: Point, owner?: Owner) {
  world.events.push({ type, x: at.x, y: at.y, owner });
}

export function addTank(world: World, kind: TankKind, at: Point, dir: Dir): Tank {
  const tank: Tank = {
    id: world.nextId++,
    owner: kind === 'hero' ? 'player' : 'enemy',
    kind,
    x: at.x,
    y: at.y,
    dir,
    off: 0,
    hp: HP[kind],
    reload: kind === 'hero' ? 0 : 1,
    shield: kind === 'hero' ? 3 : 0,
    think: 0,
  };
  world.tanks.push(tank);
  return tank;
}
