import { ALL_DIRS, DX, DY, type Dir, type Point } from './tanky-town-level';
import {
  addTank,
  emit,
  enemiesOf,
  heroOf,
  SPEED,
  tileAt,
  type Tank,
  type World,
} from './tanky-town-state';

const SPAWN_EVERY = 2.4;
const RESPAWN_AFTER = 1.2;

/** A hopping tank holds both its new tile and the one it is leaving. */
function holds(tank: Tank, x: number, y: number) {
  if (tank.x === x && tank.y === y) return true;
  return tank.off > 0 && tank.x - DX[tank.dir] === x && tank.y - DY[tank.dir] === y;
}

export const tileFree = (world: World, x: number, y: number, self?: Tank) =>
  world.tanks.every((tank) => tank === self || !holds(tank, x, y));

export function canEnter(world: World, tank: Tank, x: number, y: number) {
  const tile = tileAt(world, x, y);
  return (tile === 'empty' || tile === 'bush') && tileFree(world, x, y, tank);
}

/** Drives toward the next tile; `pick` chooses a direction each time the tank is on a tile. */
export function drive(
  world: World,
  tank: Tank,
  dt: number,
  pick: (arrived: boolean) => Dir | null
) {
  let budget = SPEED[tank.kind] * dt;
  const moving = tank.off > 0;
  if (moving) {
    const used = Math.min(tank.off, budget);
    tank.off -= used;
    budget -= used;
    if (tank.off > 0) return;
  }
  const want = pick(moving);
  if (want === null) return;
  tank.dir = want;
  const x = tank.x + DX[want];
  const y = tank.y + DY[want];
  if (!canEnter(world, tank, x, y)) return;
  tank.x = x;
  tank.y = y;
  tank.off = Math.max(0.01, 1 - budget);
}

const isBrick = (world: World, x: number, y: number) => {
  const tile = tileAt(world, x, y);
  return tile === 'brick' || tile === 'cracked';
};

/** The direction that closes the longer gap to the cake. */
function towardCake(world: World, tank: Tank): Dir {
  const { cake } = world.level;
  const dx = cake.x - tank.x;
  const dy = cake.y - tank.y;
  if (Math.abs(dy) >= Math.abs(dx)) return dy > 0 ? 1 : 3;
  return dx > 0 ? 0 : 2;
}

/** Mostly straight on, sometimes toward the cake, sometimes anywhere; bricks get shot open. */
export function chooseDir(world: World, tank: Tank): Dir {
  const open = ALL_DIRS.filter((dir) => {
    const x = tank.x + DX[dir];
    const y = tank.y + DY[dir];
    return canEnter(world, tank, x, y) || isBrick(world, x, y);
  });
  if (open.length === 0) return ALL_DIRS[Math.floor(world.rng() * 4)];
  if (open.includes(tank.dir) && world.rng() < 0.55) return tank.dir;
  const goal = towardCake(world, tank);
  if (open.includes(goal) && world.rng() < 0.3) return goal;
  return open[Math.floor(world.rng() * open.length)];
}

export function driveEnemy(world: World, tank: Tank, dt: number) {
  tank.think -= dt;
  drive(world, tank, dt, (arrived) => {
    if (!arrived && tank.think > 0) return tank.dir;
    tank.think = 0.5 + world.rng() * 0.9;
    return chooseDir(world, tank);
  });
}

/** Sends the next enemy of the roster through a free gate. */
export function spawnEnemies(world: World, dt: number) {
  world.spawnIn -= dt;
  if (world.spawnIn > 0 || world.queue.length === 0) return;
  if (enemiesOf(world).length >= world.level.maxActive) return;
  const gates = world.level.spawns.filter((gate) => tileFree(world, gate.x, gate.y));
  if (gates.length === 0) return;
  const gate = gates[Math.floor(world.rng() * gates.length)];
  addTank(world, world.queue.shift()!, gate, 1);
  emit(world, 'spawn', gate, 'enemy');
  world.spawnIn = SPAWN_EVERY;
}

export function placeHero(world: World): Tank {
  return addTank(world, 'hero', world.level.player, 3);
}

/** Brings the hero back at home once the tile is free. */
export function respawnHero(world: World, dt: number) {
  if (heroOf(world) || world.lives <= 0) return;
  world.respawnIn -= dt;
  const home: Point = world.level.player;
  if (world.respawnIn > 0 || !tileFree(world, home.x, home.y)) return;
  placeHero(world);
  emit(world, 'spawn', home, 'player');
}

export const startRespawn = (world: World) => {
  world.respawnIn = RESPAWN_AFTER;
};
