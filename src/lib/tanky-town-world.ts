import { fire, stepBullets, stepPickup } from './tanky-town-bullets';
import { LEVEL_COUNT, parseLevel } from './tanky-town-level';
import { emit, enemiesOf, type Input, type World } from './tanky-town-state';
import { drive, driveEnemy, placePlayer, respawnPlayers, spawnEnemies } from './tanky-town-tanks';

const START_LIVES = 3;
const LIVES_PER_FRIEND = 2;
const IDLE: Input = { dir: null, fire: false };
const MAX_DT = 0.05;
const CLEAR_BONUS = 500;
const CLEAR_PAUSE = 2.4;

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
    respawnIn: [0, 0],
    clearIn: 0,
    kills: 0,
    phase: 'play' as const,
  };
}

/** The whole game lives in this one object; nothing else holds game state. */
export function createWorld(rng: () => number = Math.random, levelIndex = 0, players = 1): World {
  const lives = START_LIVES + (players - 1) * LIVES_PER_FRIEND;
  const run = { players, lives, score: 0, events: [], rng, nextId: 1 };
  const world: World = { ...run, ...levelState(levelIndex) };
  placePlayers(world);
  return world;
}

function placePlayers(world: World) {
  for (let seat = 0; seat < world.players; seat++) placePlayer(world, seat);
}

/** Swaps in a fresh map and roster; score and lives carry over. */
export function loadLevel(world: World, index: number) {
  Object.assign(world, levelState(index));
  placePlayers(world);
}

/** Enemies still to beat on this level: on the field plus waiting at the gates. */
export const enemiesLeft = (world: World) => world.queue.length + enemiesOf(world).length;

function checkClear(world: World) {
  if (world.phase !== 'play' || enemiesLeft(world) > 0) return;
  const last = world.levelIndex === LEVEL_COUNT - 1;
  world.score += CLEAR_BONUS;
  world.phase = last ? 'won' : 'clear';
  world.clearIn = CLEAR_PAUSE;
  emit(world, last ? 'won' : 'clear', world.level.cake);
}

function stepTimers(world: World, dt: number) {
  for (const tank of world.tanks) {
    tank.reload = Math.max(0, tank.reload - dt);
    tank.shield = Math.max(0, tank.shield - dt);
  }
}

function stepTanks(world: World, dt: number, inputs: Input[]) {
  for (const tank of [...world.tanks]) {
    if (tank.owner === 'player') {
      const input = inputs[tank.seat] ?? IDLE;
      drive(world, tank, dt, () => input.dir);
      if (input.fire) fire(world, tank);
    } else {
      driveEnemy(world, tank, dt);
      fire(world, tank);
    }
  }
}

/** After the party pause the next map loads by itself. */
function stepClear(world: World, dt: number) {
  world.clearIn -= dt;
  if (world.clearIn > 0) return;
  loadLevel(world, world.levelIndex + 1);
  emit(world, 'level', world.level.homes[0]);
}

/** One frame of the game; the only way the world moves on. Frozen once won or lost. */
export function step(world: World, dt: number, inputs: Input[]) {
  const tick = Math.min(MAX_DT, dt);
  if (world.phase === 'clear') return stepClear(world, tick);
  if (world.phase !== 'play') return;
  stepTimers(world, tick);
  spawnEnemies(world, tick);
  respawnPlayers(world, tick);
  stepTanks(world, tick, inputs);
  stepBullets(world, tick);
  stepPickup(world, tick);
  checkClear(world);
}
