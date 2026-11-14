import { cloudTarget, makeClouds, moveCloud, type Cloud } from './munch-maze-clouds';
import {
  cellAt,
  keyOf,
  parseLevel,
  stepFrom,
  type Dir,
  type Level,
  type Tile,
} from './munch-maze-level';

/** roll: waiting for the die · walk: player steps · clouds: clouds step · caught/clear: pause. */
export type Phase = 'roll' | 'walk' | 'clouds' | 'caught' | 'clear' | 'over';
export type MazeEvent =
  | { type: 'berry' | 'star' | 'caught' | 'clear' | 'over' | 'clouds' }
  | { type: 'step'; left: number; count: number }
  | { type: 'gobble'; cloud: Cloud };

export type World = {
  level: Level;
  berries: Set<number>;
  stars: Set<number>;
  player: Tile & { dir: Dir };
  clouds: Cloud[];
  score: number;
  lives: number;
  round: number;
  phase: Phase;
  die: number;
  stepsLeft: number;
  /** Cloud turns left while the clouds are scared. */
  power: number;
  queue: number[];
  events: MazeEvent[];
  rng: () => number;
};

export const LIVES = 3;
export const POWER_TURNS = 3;
const POINTS = { berry: 10, star: 50, cloud: 200 };

export function createWorld(rng: () => number = Math.random): World {
  const level = parseLevel();
  const world: World = {
    level,
    berries: new Set(level.berries),
    stars: new Set(level.stars),
    player: { ...level.start, dir: 2 },
    clouds: makeClouds(level),
    score: 0,
    lives: LIVES,
    round: 1,
    phase: 'roll',
    die: 0,
    stepsLeft: 0,
    power: 0,
    queue: [],
    events: [],
    rng,
  };
  return world;
}

/** Clouds take 2 steps a turn, one more every other round, capped at 4. */
export const cloudSteps = (round: number) => Math.min(4, 2 + Math.floor((round - 1) / 2));

export function rollDie(world: World): number {
  if (world.phase !== 'roll') return 0;
  world.die = 1 + Math.floor(world.rng() * 6);
  world.stepsLeft = world.die;
  world.phase = 'walk';
  return world.die;
}

export function canStep(world: World, dir: Dir) {
  const next = stepFrom(world.level, world.player, dir);
  const ch = cellAt(world.level, next.x, next.y);
  return dir >= 0 && ch !== '#' && ch !== '=';
}

/** One player step; returns false when the way is blocked or it is not the player's turn. */
export function stepPlayer(world: World, dir: Dir): boolean {
  if (world.phase !== 'walk' || !canStep(world, dir)) return false;
  Object.assign(world.player, stepFrom(world.level, world.player, dir), { dir });
  world.stepsLeft -= 1;
  world.events.push({ type: 'step', left: world.stepsLeft, count: world.die - world.stepsLeft });
  eat(world);
  for (const cloud of world.clouds) if (meet(world, cloud)) return true;
  if (isCleared(world)) return true;
  if (world.stepsLeft === 0) startCloudTurn(world);
  return true;
}

function startCloudTurn(world: World) {
  world.phase = 'clouds';
  world.queue = [];
  const steps = world.power > 0 ? 1 : cloudSteps(world.round);
  for (let i = 0; i < steps; i++) for (const c of world.clouds) world.queue.push(c.id);
  for (const cloud of world.clouds) {
    if (cloud.mode === 'wait' && --cloud.wait <= 0) cloud.mode = 'leave';
  }
  world.events.push({ type: 'clouds' });
}

/** Moves the next cloud in line by one tile; the UI calls this on a timer so kids can watch. */
export function stepClouds(world: World) {
  if (world.phase !== 'clouds') return;
  const id = world.queue.shift();
  const cloud = world.clouds.find((c) => c.id === id);
  if (cloud && cloud.mode !== 'wait') {
    const scared = world.power > 0 && cloud.mode === 'chase';
    const target = cloudTarget(cloud, world.player, world.level);
    moveCloud(world.level, cloud, { target, scared, rng: world.rng });
    if (meet(world, cloud)) return;
  }
  if (world.queue.length > 0) return;
  world.power = Math.max(0, world.power - 1);
  world.phase = 'roll';
}

function eat(world: World) {
  const key = keyOf(world.level, world.player);
  if (world.berries.delete(key)) {
    world.score += POINTS.berry;
    world.events.push({ type: 'berry' });
  } else if (world.stars.delete(key)) {
    world.score += POINTS.star;
    world.power = POWER_TURNS;
    world.events.push({ type: 'star' });
  }
}

function meet(world: World, cloud: Cloud): boolean {
  if (cloud.mode === 'wait' || cloud.x !== world.player.x || cloud.y !== world.player.y) {
    return false;
  }
  if (world.power > 0 && cloud.mode === 'chase') {
    world.score += POINTS.cloud;
    world.events.push({ type: 'gobble', cloud });
    Object.assign(cloud, cloud.home, { dir: -1, mode: 'wait', wait: 2 });
    return false;
  }
  world.lives -= 1;
  world.phase = world.lives > 0 ? 'caught' : 'over';
  world.events.push({ type: world.lives > 0 ? 'caught' : 'over' });
  return true;
}

function isCleared(world: World) {
  if (world.berries.size > 0 || world.stars.size > 0) return false;
  world.phase = 'clear';
  world.events.push({ type: 'clear' });
  return true;
}

/** After a catch or a cleared maze: everyone back to the start, the player rolls again. */
export function nextTurn(world: World) {
  if (world.phase !== 'caught' && world.phase !== 'clear') return;
  if (world.phase === 'clear') {
    world.round += 1;
    world.berries = new Set(world.level.berries);
    world.stars = new Set(world.level.stars);
  }
  world.player = { ...world.level.start, dir: 2 };
  world.clouds = makeClouds(world.level);
  world.power = 0;
  world.stepsLeft = 0;
  world.phase = 'roll';
}
