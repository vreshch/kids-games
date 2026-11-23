import { fire, stepBullets, stepPickup } from './tanky-town-bullets';
import { LEVEL_COUNT, parseLevel } from './tanky-town-level';
import { emit, enemiesOf, heroOf, type Input, type World } from './tanky-town-state';
import { drive, driveEnemy, placeHero, respawnHero, spawnEnemies } from './tanky-town-tanks';

const START_LIVES = 3;
const MAX_DT = 0.05;
const CLEAR_BONUS = 500;

/** Everything that belongs to one level; a new level replaces all of it. */
function levelState(index: number) {
  const level = parseLevel(index);
  return {
    levelIndex: index,
    level,
    tiles: [...level.tiles],
    tanks: [],
    bullets: [],
    pickup: null,
    queue: [...level.roster],
    spawnIn: 1,
    respawnIn: 0,
    kills: 0,
    phase: 'play' as const,
  };
}

/** The whole game lives in this one object; nothing else holds game state. */
export function createWorld(rng: () => number = Math.random, levelIndex = 0): World {
  const run = { lives: START_LIVES, score: 0, events: [], rng, nextId: 1 };
  const world: World = { ...run, ...levelState(levelIndex) };
  placeHero(world);
  return world;
}

/** Swaps in a fresh map and roster; score and lives carry over. */
export function loadLevel(world: World, index: number) {
  Object.assign(world, levelState(index));
  placeHero(world);
}

/** Enemies still to beat on this level: on the field plus waiting at the gates. */
export const enemiesLeft = (world: World) => world.queue.length + enemiesOf(world).length;

function checkClear(world: World) {
  if (world.phase !== 'play' || enemiesLeft(world) > 0) return;
  const last = world.levelIndex === LEVEL_COUNT - 1;
  world.score += CLEAR_BONUS;
  world.phase = last ? 'won' : 'clear';
  emit(world, last ? 'won' : 'clear', world.level.cake);
}

function stepTimers(world: World, dt: number) {
  for (const tank of world.tanks) {
    tank.reload = Math.max(0, tank.reload - dt);
    tank.shield = Math.max(0, tank.shield - dt);
  }
}

function stepTanks(world: World, dt: number, input: Input) {
  for (const tank of [...world.tanks]) {
    if (tank.owner === 'player') {
      drive(world, tank, dt, () => input.dir);
      if (input.fire) fire(world, tank);
    } else {
      driveEnemy(world, tank, dt);
      fire(world, tank);
    }
  }
}

/** One frame of the game. Does nothing once the level is cleared or lost. */
export function step(world: World, dt: number, input: Input) {
  if (world.phase !== 'play') return;
  const tick = Math.min(MAX_DT, dt);
  stepTimers(world, tick);
  spawnEnemies(world, tick);
  respawnHero(world, tick);
  stepTanks(world, tick, input);
  stepBullets(world, tick);
  stepPickup(world, tick, heroOf(world));
  checkClear(world);
}

/** Call after the "level clear" pause to roll on to the next map. */
export function nextLevel(world: World) {
  if (world.phase === 'clear') loadLevel(world, world.levelIndex + 1);
}
