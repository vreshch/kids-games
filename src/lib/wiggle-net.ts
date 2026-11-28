import { foodRadius, type Food } from './wiggle-food';
import { packBody, STRIDE, unpackBody } from './wiggle-net-body';
import { createSnake, moveSnake, radiusFor, type Snake, type Vec } from './wiggle-snake';
import type { World, WorldEvent } from './wiggle-world';

/** Extra room around the friend's view, so a snake never pops in at the edge. */
const MARGIN = 300;
const TAU = Math.PI * 2;

/** The part of the arena the friend can see: centre and half size, in arena units. */
export type ViewBox = { x: number; y: number; w: number; h: number };

/** A snake on the wire. Far snakes carry only the head (for the map and the board). */
export type WireSnake = {
  i: number;
  n: string;
  k: number;
  s: number | null;
  /** mass x 10 */
  m: number;
  /** near snakes only: angle and target x 100, boosting, full body length */
  a?: number;
  t?: number;
  b?: 1;
  l?: number;
  /** head, then every STRIDE-th point as whole-number steps from the one before */
  p: number[];
};

/** Who took part in a gobble or a munch: enough for the toast, the sound and the ending. */
export type Who = Pick<Snake, 'id' | 'name' | 'seat' | 'mass'>;
export type NetEvent =
  { type: 'munch'; snake: Who; value: number } | { type: 'gobble'; eater: Who; victim: Who };

/** What the host sends about 30 times a second, cut down to what the friend can see. */
export type Snapshot = {
  time: number;
  snakes: WireSnake[];
  /** x, y, value x 10, colour - four numbers per dot */
  foods: number[];
  superUntil: number[];
  superReadyAt: number[];
  events: NetEvent[];
};

/** The only messages the two players exchange. */
export type WiggleMessage =
  | { t: 'snap'; s: Snapshot }
  | { t: 'input'; a: number; b: boolean; v: ViewBox }
  | { t: 'super' }
  | { t: 'spawn'; skin: number };

const who = ({ id, name, seat, mass }: Snake): Who => ({ id, name, seat, mass });

export function toNetEvent(event: WorldEvent): NetEvent {
  if (event.type === 'munch') return { type: 'munch', snake: who(event.snake), value: event.value };
  return { type: 'gobble', eater: who(event.eater), victim: who(event.victim) };
}

/** True when the event matters to that seat, so the host only forwards those. */
export function concerns(event: NetEvent, seat: number) {
  if (event.type === 'munch') return event.snake.seat === seat;
  return event.eater.seat === seat || event.victim.seat === seat;
}

const round = (value: number, k: number) => Math.round(value * k) / k;

function inBox(p: Vec, box: ViewBox, pad: number) {
  return Math.abs(p.x - box.x) < box.w + pad && Math.abs(p.y - box.y) < box.h + pad;
}

function wireSnake(snake: Snake, box: ViewBox): WireSnake {
  const base = {
    i: snake.id,
    n: snake.name,
    k: snake.skin,
    s: snake.seat,
    m: round(snake.mass * 10, 1),
  };
  const pad = radiusFor(snake.mass) + MARGIN;
  const near = snake.body.some((p, i) => i % STRIDE === 0 && inBox(p, box, pad));
  if (!near) return { ...base, p: [Math.round(snake.body[0].x), Math.round(snake.body[0].y)] };
  return {
    ...base,
    a: Math.round(snake.angle * 100),
    t: Math.round(snake.targetAngle * 100),
    ...(snake.boosting ? { b: 1 as const } : {}),
    l: snake.body.length,
    p: packBody(snake.body),
  };
}

/** Host side: the living snakes, the dots near the friend, and the events since the last send. */
export function snapshot(world: World, box: ViewBox, events: NetEvent[]): Snapshot {
  const foods: number[] = [];
  for (const food of world.foods) {
    if (!inBox(food, box, MARGIN)) continue;
    foods.push(Math.round(food.x), Math.round(food.y), Math.round(food.value * 10), food.color);
  }
  return {
    time: round(world.time, 1000),
    snakes: world.snakes.filter((s) => s.alive).map((s) => wireSnake(s, box)),
    foods,
    superUntil: world.superUntil.map((t) => round(t, 100)),
    superReadyAt: world.superReadyAt.map((t) => round(t, 100)),
    events,
  };
}

function readSnake(w: WireSnake): Snake {
  const snake = createSnake({
    id: w.i,
    name: w.n,
    skin: w.k,
    isPlayer: w.s !== null,
    seat: w.s,
    mass: w.m / 10,
    angle: (w.a ?? 0) / 100,
    x: 0,
    y: 0,
  });
  snake.targetAngle = (w.t ?? 0) / 100;
  snake.boosting = w.b === 1;
  snake.body = unpackBody(w.p, w.l ?? 1);
  return snake;
}

function readFoods(packed: number[]): Food[] {
  const foods: Food[] = [];
  for (let i = 0; i < packed.length; i += 4) {
    const [x, y, v, color] = packed.slice(i, i + 4);
    foods.push({ x, y, r: foodRadius(v / 10), value: v / 10, color, phase: ((x + y) / 40) % TAU });
  }
  return foods;
}

/** Friend side: the host's picture replaces the local one. Returns the events to play here. */
export function applySnapshot(world: World, snap: Snapshot): NetEvent[] {
  world.time = snap.time;
  world.snakes = snap.snakes.map(readSnake);
  world.foods = readFoods(snap.foods);
  world.superUntil = snap.superUntil;
  world.superReadyAt = snap.superReadyAt;
  const seats = Math.max(2, world.players.length);
  for (let seat = 0; seat < seats; seat++) {
    const now = world.snakes.find((s) => s.seat === seat);
    const before = world.players[seat];
    // a gobbled snake stays put (dead), so the camera stays where it happened
    world.players[seat] = now ?? (before ? { ...before, alive: false } : null);
  }
  return snap.events;
}

/** Friend side, between snapshots: near snakes keep sliding the way they were going. */
export function coast(world: World, dt: number) {
  world.time += dt;
  for (const snake of world.snakes) {
    if (snake.alive && snake.body.length > 1) moveSnake(snake, dt, world.arenaRadius);
  }
}

/** Snapshots that pile up (a slow frame, a hidden tab): newest picture, old munches dropped. */
export function mergeSnapshots(older: Snapshot | null, newer: Snapshot): Snapshot {
  if (!older) return newer;
  const kept = older.events.filter((e) => e.type === 'gobble');
  return { ...newer, events: [...kept, ...newer.events] };
}
