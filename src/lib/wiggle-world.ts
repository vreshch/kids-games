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
const FRIEND_NEAR = 250;
const BODY_CLEAR = 250;
export const PLAYER_NAMES = ['You', 'Friend'];

export type WorldEvent =
  { type: 'gobble'; eater: Snake; victim: Snake } | { type: 'munch'; snake: Snake; value: number };

export type World = {
  time: number;
  arenaRadius: number;
  snakes: Snake[];
  foods: Food[];
  /** The players' snakes by seat; a gobbled one stays here, dead, until it comes back. */
  players: (Snake | null)[];
  superUntil: number[];
  superReadyAt: number[];
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
    players: [],
    superUntil: [],
    superReadyAt: [],
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

/** A random spot in the arena, or close to a friend when there is one. */
function randomSpot(world: World, spread: number, near?: Snake): Vec {
  const angle = world.rand() * Math.PI * 2;
  const center = near?.body[0] ?? { x: 0, y: 0 };
  const dist = near
    ? FRIEND_NEAR + world.rand() * FRIEND_NEAR
    : Math.sqrt(world.rand()) * world.arenaRadius * spread;
  const spot = { x: center.x + Math.cos(angle) * dist, y: center.y + Math.sin(angle) * dist };
  const out = Math.hypot(spot.x, spot.y) / (world.arenaRadius * 0.9);
  return out > 1 ? { x: spot.x / out, y: spot.y / out } : spot;
}

/** Far from every hungry head and clear of every body, so nobody spawns inside a mouth. */
function isClear(spot: Vec, others: Snake[]) {
  return others.every(
    (o) =>
      Math.hypot(o.body[0].x - spot.x, o.body[0].y - spot.y) > SAFE_SPAWN &&
      o.body.every((p, i) => i % 4 !== 0 || Math.hypot(p.x - spot.x, p.y - spot.y) > BODY_CLEAR)
  );
}

/** A clear spot; near the friend when there is one. Friends do not count as danger. */
function safeSpot(world: World, spread: number, near?: Snake): Vec {
  const others = world.snakes.filter((s) => s.alive && (!near || s.seat === null));
  let spot: Vec = { x: 0, y: 0 };
  for (let tries = 0; tries < 40; tries++) {
    spot = randomSpot(world, spread, tries < 20 ? near : undefined);
    if (isClear(spot, others)) break;
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

/** The living snake of the other player, if any. */
export const friendOf = (world: World, seat: number) =>
  world.players.find((s, i) => i !== seat && s?.alive) ?? null;

/** A fresh snake for one seat, near the friend and never in the friend's colours. */
export function spawnPlayer(world: World, skin: number, seat = 0) {
  removePlayer(world, seat);
  const friend = friendOf(world, seat);
  const player = createSnake({
    id: world.nextId++,
    name: PLAYER_NAMES[seat] ?? 'Friend',
    skin: friend?.skin === skin ? (skin + 1) % world.skinCount : skin,
    isPlayer: true,
    seat,
    mass: START_MASS,
    angle: world.rand() * Math.PI * 2,
    ...safeSpot(world, 0.5, friend ?? undefined),
  });
  world.snakes.push(player);
  world.players[seat] = player;
  world.superUntil[seat] = 0;
  world.superReadyAt[seat] = world.time;
  return player;
}

/** Takes a seat's snake out of the arena, for example when the friend leaves. */
export function removePlayer(world: World, seat: number) {
  world.snakes = world.snakes.filter((s) => s.seat !== seat);
  world.players[seat] = null;
}

export function stepWorld(world: World, dt: number) {
  world.time += dt;
  const superSnakes = world.snakes.filter((s) => s.alive && isSuper(world, s));
  const surroundings = { ...world, superSnakes };
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

export type Standing = {
  name: string;
  length: number;
  isPlayer: boolean;
  isFriend: boolean;
  rank: number;
};

/** The board as one player sees it: their own snake is "You", the other one "Friend". */
export function standings(world: World, me = 0): Standing[] {
  return world.snakes
    .filter((s) => s.alive)
    .sort((a, b) => b.mass - a.mass)
    .map((s, i) => ({
      name: s.seat === null ? s.name : PLAYER_NAMES[s.seat === me ? 0 : 1],
      length: Math.round(s.mass),
      isPlayer: s.seat === me,
      isFriend: s.seat !== null && s.seat !== me,
      rank: i + 1,
    }));
}
