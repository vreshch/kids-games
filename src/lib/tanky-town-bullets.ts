import { DX, DY, type Point } from './tanky-town-level';
import {
  emit,
  inBounds,
  POINTS,
  setTile,
  tankPos,
  tileAt,
  type Bullet,
  type Tank,
  type World,
} from './tanky-town-state';
import { startRespawn } from './tanky-town-tanks';

const BULLET_SPEED = { player: 9, enemy: 5 };
const HIT_RADIUS = 0.45;
const MAX_LIVES = 5;
const HEART_AT_KILL = 3;
const HEART_TTL = 15;

/** One bullet per tank at a time, so every shot counts. */
export function fire(world: World, tank: Tank) {
  if (tank.reload > 0 || world.bullets.some((bullet) => bullet.tankId === tank.id)) return;
  const pos = tankPos(tank);
  const at = { x: pos.x + DX[tank.dir] * 0.5, y: pos.y + DY[tank.dir] * 0.5 };
  world.bullets.push({ ...at, dir: tank.dir, owner: tank.owner, tankId: tank.id });
  tank.reload = tank.owner === 'player' ? 0.25 : 2 + world.rng() * 2.5;
  emit(world, 'shot', at, tank.owner);
}

function dropHeart(world: World) {
  const free = world.tiles.flatMap((tile, i) => (tile === 'empty' ? [i] : []));
  const i = free[Math.floor(world.rng() * free.length)];
  const { cols } = world.level;
  world.pickup = { x: i % cols, y: Math.floor(i / cols), ttl: HEART_TTL };
}

function destroy(world: World, tank: Tank) {
  world.tanks = world.tanks.filter((other) => other !== tank);
  emit(world, 'boom', tankPos(tank), tank.owner);
  if (tank.kind === 'hero') {
    world.lives -= 1;
    if (world.lives > 0) return startRespawn(world);
    world.phase = 'over';
    return emit(world, 'over', tankPos(tank));
  }
  world.score += POINTS[tank.kind];
  world.kills += 1;
  if (world.kills === HEART_AT_KILL) dropHeart(world);
}

export function damage(world: World, tank: Tank) {
  if (tank.shield > 0) return emit(world, 'clang', tankPos(tank));
  tank.hp -= 1;
  if (tank.hp <= 0) destroy(world, tank);
  else emit(world, 'hurt', tankPos(tank), tank.owner);
}

/** True when the tile stops the bullet; bricks crack, then crumble. */
function hitTile(world: World, bullet: Bullet, x: number, y: number) {
  if (!inBounds(world, x, y)) return true;
  const tile = tileAt(world, x, y);
  const at: Point = { x, y };
  if (tile === 'brick' || tile === 'cracked') {
    setTile(world, x, y, tile === 'brick' ? 'cracked' : 'empty');
    emit(world, 'brick', at);
  } else if (tile === 'steel') emit(world, 'clang', at);
  else if (tile === 'cake') hitCake(world, bullet, at);
  else return false;
  return true;
}

/** Only an enemy shot ruins the cake; the hero's own shots just stop. */
function hitCake(world: World, bullet: Bullet, at: Point) {
  if (bullet.owner === 'player') return;
  world.phase = 'over';
  emit(world, 'cake', at);
  emit(world, 'over', at);
}

function hitTank(world: World, bullet: Bullet) {
  const target = world.tanks.find((tank) => {
    const pos = tankPos(tank);
    const near = Math.max(Math.abs(pos.x - bullet.x), Math.abs(pos.y - bullet.y)) < HIT_RADIUS;
    return tank.owner !== bullet.owner && near;
  });
  if (target) damage(world, target);
  return target !== undefined;
}

/** Opposing bullets that meet pop each other. */
function cancelBullets(world: World) {
  const gone = new Set<Bullet>();
  for (const a of world.bullets) {
    for (const b of world.bullets) {
      const near = Math.abs(a.x - b.x) < 0.35 && Math.abs(a.y - b.y) < 0.35;
      if (a.owner !== b.owner && near) gone.add(a).add(b);
    }
  }
  world.bullets = world.bullets.filter((bullet) => !gone.has(bullet));
}

export function stepBullets(world: World, dt: number) {
  for (const bullet of world.bullets) {
    bullet.x += DX[bullet.dir] * BULLET_SPEED[bullet.owner] * dt;
    bullet.y += DY[bullet.dir] * BULLET_SPEED[bullet.owner] * dt;
  }
  cancelBullets(world);
  world.bullets = world.bullets.filter((bullet) => {
    if (world.phase !== 'play') return true;
    const stopped = hitTile(world, bullet, Math.round(bullet.x), Math.round(bullet.y));
    return !stopped && !hitTank(world, bullet);
  });
}

/** The heart fades after a while; the hero grabs it by driving over it. */
export function stepPickup(world: World, dt: number, hero?: Tank) {
  const pickup = world.pickup;
  if (!pickup) return;
  pickup.ttl -= dt;
  if (hero && hero.x === pickup.x && hero.y === pickup.y) {
    world.lives = Math.min(MAX_LIVES, world.lives + 1);
    emit(world, 'heart', pickup);
    world.pickup = null;
  } else if (pickup.ttl <= 0) world.pickup = null;
}
