import { BOT_NAMES, thinkBot } from './wiggle-bots';
import { eatFood, pelletAt, randomFood, type Food } from './wiggle-food';
import { isSuper, resolveContacts } from './wiggle-rules';
import { canBoost, createSnake, moveSnake, START_MASS, type Snake, type Vec } from './wiggle-snake';

export const ARENA_RADIUS = 3000;
export const FOOD_TARGET = 900;
export const BOT_COUNT = 14;
const BOOST_COST = 8;
const DROP_EVERY = 0.12;
const SAFE_SPAWN = 700;

export type WorldEvent =
  { type: 'gobble'; eater: Snake; victim: Snake } | { type: 'munch'; snake: Snake; value: number };

export type World = {
  time: number;
  arenaRadius: number;
  snakes: Snake[];
  foods: Food[];
  player: Snake | null;
  superUntil: number;
  superReadyAt: number;
  respawnAt: number[];
  nextId: number;
  skinCount: number;
  rand: () => number;
  events: WorldEvent[];
};

export function createWorld(skinCount: number, rand: () => number = Math.random): World {
  const world: World = {
    time: 0,
    arenaRadius: ARENA_RADIUS,
    snakes: [],
    foods: [],
    player: null,
    superUntil: 0,
    superReadyAt: 0,
    respawnAt: [],
    nextId: 1,
    skinCount,
    rand,
    events: [],
  };
  refill(world);
  for (let i = 0; i < BOT_COUNT; i++) spawnBot(world);
  return world;
}

/** A spot no living head is close to, so nobody spawns inside a hungry mouth. */
function safeSpot(world: World, spread: number): Vec {
  const heads = world.snakes.filter((s) => s.alive).map((s) => s.body[0]);
  let spot: Vec = { x: 0, y: 0 };
  for (let tries = 0; tries < 25; tries++) {
    const dist = Math.sqrt(world.rand()) * world.arenaRadius * spread;
    const angle = world.rand() * Math.PI * 2;
    spot = { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
    if (heads.every((h) => Math.hypot(h.x - spot.x, h.y - spot.y) > SAFE_SPAWN)) break;
  }
  return spot;
}

function freeName(world: World) {
  const taken = new Set(world.snakes.filter((s) => s.alive).map((s) => s.name));
  const free = BOT_NAMES.filter((name) => !taken.has(name));
  const pool = free.length > 0 ? free : BOT_NAMES;
  return pool[Math.floor(world.rand() * pool.length)];
}

export function spawnBot(world: World) {
  const { rand } = world;
  const bot = createSnake({
    id: world.nextId++,
    name: freeName(world),
    skin: Math.floor(rand() * world.skinCount),
    isPlayer: false,
    // mostly little snakes to chase, a few big ones to steer clear of
    mass: 10 + rand() ** 2.2 * 500,
    angle: rand() * Math.PI * 2,
    ...safeSpot(world, 0.85),
  });
  bot.bold = rand() < 0.35;
  world.snakes.push(bot);
  return bot;
}

export function spawnPlayer(world: World, skin: number) {
  world.snakes = world.snakes.filter((s) => !s.isPlayer);
  const player = createSnake({
    id: world.nextId++,
    name: 'You',
    skin,
    isPlayer: true,
    mass: START_MASS,
    angle: world.rand() * Math.PI * 2,
    ...safeSpot(world, 0.5),
  });
  world.snakes.push(player);
  world.player = player;
  world.superUntil = 0;
  world.superReadyAt = world.time;
  return player;
}

export function stepWorld(world: World, dt: number) {
  world.time += dt;
  const { player } = world;
  const superSnake = player?.alive && isSuper(world, player) ? player : null;
  const surroundings = { ...world, superSnake };
  for (const snake of world.snakes) {
    if (!snake.alive) continue;
    if (!snake.isPlayer) thinkBot(snake, surroundings, dt);
    moveSnake(snake, dt, world.arenaRadius);
    dropBoostTrail(world, snake, dt);
    const value = eatFood(snake, world.foods, dt);
    if (value > 0) world.events.push({ type: 'munch', snake, value });
  }
  resolveContacts(world);
  refill(world);
}

function dropBoostTrail(world: World, snake: Snake, dt: number) {
  if (!canBoost(snake)) {
    snake.dropTimer = 0;
    return;
  }
  snake.mass -= BOOST_COST * dt;
  snake.dropTimer += dt;
  if (snake.dropTimer < DROP_EVERY) return;
  snake.dropTimer -= DROP_EVERY;
  const tail = snake.body[snake.body.length - 1];
  world.foods.push(pelletAt(world.rand, tail.x, tail.y, BOOST_COST * DROP_EVERY * 0.75));
}

function refill(world: World) {
  world.snakes = world.snakes.filter((s) => s.alive || s.isPlayer);
  const due = world.respawnAt.filter((t) => t <= world.time).length;
  world.respawnAt = world.respawnAt.filter((t) => t > world.time);
  for (let i = 0; i < due; i++) spawnBot(world);
  while (world.foods.length < FOOD_TARGET)
    world.foods.push(randomFood(world.rand, world.arenaRadius));
}

export type Standing = { name: string; length: number; isPlayer: boolean; rank: number };

export function standings(world: World): Standing[] {
  return world.snakes
    .filter((s) => s.alive)
    .sort((a, b) => b.mass - a.mass)
    .map((s, i) => ({
      name: s.name,
      length: Math.round(s.mass),
      isPlayer: s.isPlayer,
      rank: i + 1,
    }));
}
