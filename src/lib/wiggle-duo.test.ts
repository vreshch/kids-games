import { describe, expect, it } from 'vitest';

import {
  applySnapshot,
  coast,
  concerns,
  mergeSnapshots,
  snapshot,
  toNetEvent,
  type Snapshot,
  type ViewBox,
} from './wiggle-net';
import { activateSuper, resolveContacts, superState } from './wiggle-rules';
import { createSnake, SEGMENT_SPACING } from './wiggle-snake';
import {
  createWorld,
  friendOf,
  removePlayer,
  spawnPlayer,
  standings,
  stepWorld,
  type World,
} from './wiggle-world';

function seeded(seed = 11) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Two players in an empty arena. */
function duo() {
  const world = createWorld(8, seeded());
  world.snakes = [];
  world.foods = [];
  const host = spawnPlayer(world, 2, 0);
  const friend = spawnPlayer(world, 4, 1);
  return { world, host, friend };
}

let nextId = 500;
const bot = (mass: number, x: number, y: number, angle = 0) =>
  createSnake({ id: nextId++, name: `B${nextId}`, skin: 0, isPlayer: false, mass, angle, x, y });
const overTheWire = (snap: Snapshot) => JSON.parse(JSON.stringify(snap)) as Snapshot;
const run = (world: World, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 30) stepWorld(world, 1 / 30);
};

describe('two players', () => {
  it('gives each seat its own snake, close to the friend', () => {
    const { world, host, friend } = duo();
    expect(world.players).toEqual([host, friend]);
    expect([host.seat, friend.seat]).toEqual([0, 1]);
    const gap = Math.hypot(host.body[0].x - friend.body[0].x, host.body[0].y - friend.body[0].y);
    expect(gap).toBeLessThan(600);
    expect(friendOf(world, 0)).toBe(friend);
  });

  it('never spawns a player on top of a bot', () => {
    for (let seed = 1; seed < 30; seed++) {
      const world = createWorld(8, seeded(seed));
      run(world, 3);
      const host = spawnPlayer(world, 0, 0);
      const friend = spawnPlayer(world, 1, 1);
      for (const player of [host, friend]) {
        const head = player.body[0];
        const bots = world.snakes.filter((s) => s.seat === null && s.alive);
        const closest = Math.min(
          ...bots.flatMap((b) => b.body.map((p) => Math.hypot(p.x - head.x, p.y - head.y)))
        );
        expect(closest).toBeGreaterThan(150);
      }
    }
  });

  it('never gives the friend the same colours', () => {
    const world = createWorld(8, seeded());
    spawnPlayer(world, 3, 0);
    expect(spawnPlayer(world, 3, 1).skin).toBe(4);
    expect(spawnPlayer(world, 5, 1).skin).toBe(5);
  });

  it('lets friends slide past each other without a gobble', () => {
    const { world, host, friend } = duo();
    host.mass = 300;
    friend.body[0] = { ...host.body[3] };
    resolveContacts(world);
    expect(host.alive && friend.alive).toBe(true);
  });

  it('lets the friend gobble a smaller bot', () => {
    const { world, friend } = duo();
    friend.mass = 200;
    const snack = bot(15, friend.body[0].x, friend.body[0].y);
    world.snakes.push(snack);
    resolveContacts(world);
    expect(snack.alive).toBe(false);
    expect(world.events).toContainEqual(expect.objectContaining({ type: 'gobble', eater: friend }));
  });

  it('gives each player its own super button', () => {
    const { world, host, friend } = duo();
    expect(activateSuper(world, 1)).toBe(true);
    expect(superState(world, 1).active).toBe(true);
    expect(superState(world, 0).ready).toBe(true);
    const giant = bot(800, friend.body[0].x, friend.body[0].y);
    world.snakes.push(giant);
    resolveContacts(world);
    expect(giant.alive).toBe(false);
    expect(host.alive).toBe(true);
  });

  it('brings back only the seat that asks, and takes out the one that leaves', () => {
    const { world, host, friend } = duo();
    friend.alive = false;
    const again = spawnPlayer(world, 4, 1);
    expect(world.players).toEqual([host, again]);
    expect(world.snakes.filter((s) => s.seat === 1)).toEqual([again]);
    removePlayer(world, 1);
    expect(world.players[1]).toBeNull();
    expect(world.snakes).toEqual([host]);
  });

  it('shows each player "You" for its own snake and "Friend" for the other', () => {
    const { world, host } = duo();
    host.mass = 50;
    const forFriend = standings(world, 1);
    expect(forFriend.map((s) => [s.name, s.isPlayer, s.isFriend])).toEqual([
      ['Friend', false, true],
      ['You', true, false],
    ]);
    expect(standings(world, 0)[0]).toMatchObject({ name: 'You', isPlayer: true });
  });
});

describe('snapshots', () => {
  /** A busy minute: two players, every bot, then a big snake and a burst of dots in view. */
  function busy() {
    const world = createWorld(8, seeded(5));
    spawnPlayer(world, 0, 0);
    spawnPlayer(world, 1, 1);
    run(world, 20);
    // whoever got gobbled on the way comes back, like after "Play again"
    if (!world.players[0]?.alive) spawnPlayer(world, 0, 0);
    const friend = world.players[1]?.alive ? world.players[1] : spawnPlayer(world, 1, 1);
    const at = friend.body[0];
    for (let i = 0; i < 3; i++) world.snakes.push(bot(1500, at.x + 100 * i, at.y + 150 + 80 * i));
    const view: ViewBox = { x: Math.round(at.x), y: Math.round(at.y), w: 1300, h: 600 };
    return { world, view };
  }

  it('rebuild the near snakes on the friend side, to within a step', () => {
    const { world, view } = busy();
    const guest = createWorld(8, seeded(1));
    applySnapshot(guest, overTheWire(snapshot(world, view, [])));
    const alive = world.snakes.filter((s) => s.alive);
    expect(guest.snakes.map((s) => s.id)).toEqual(alive.map((s) => s.id));
    for (const copy of guest.snakes.filter((s) => s.body.length > 1)) {
      const real = alive.find((s) => s.id === copy.id)!;
      expect(copy.body).toHaveLength(real.body.length);
      copy.body.forEach((p, i) => {
        expect(Math.hypot(p.x - real.body[i].x, p.y - real.body[i].y)).toBeLessThan(
          SEGMENT_SPACING
        );
      });
      expect(copy.angle).toBeCloseTo(real.angle, 1);
      expect(copy.mass).toBeCloseTo(real.mass, 0);
    }
    expect(guest.players[1]?.seat).toBe(1);
  });

  it('send far snakes as a head only and dots only near the friend', () => {
    const { world, view } = busy();
    const snap = snapshot(world, view, []);
    const far = snap.snakes.filter((s) => s.l === undefined);
    expect(far.length).toBeGreaterThan(0);
    for (const s of far) expect(s.p).toHaveLength(2);
    expect(snap.foods.length / 4).toBeLessThan(world.foods.length / 2);
    for (let i = 0; i < snap.foods.length; i += 4) {
      expect(Math.abs(snap.foods[i] - view.x)).toBeLessThan(view.w + 301);
    }
  });

  it('stay small enough to send 30 times a second', () => {
    const { world, view } = busy();
    const size = JSON.stringify(snapshot(world, view, [])).length;
    expect(size).toBeLessThan(20_000);
    const calm = createWorld(8, seeded(9));
    const me = spawnPlayer(calm, 0, 1);
    run(calm, 5);
    const near: ViewBox = { x: me.body[0].x, y: me.body[0].y, w: 900, h: 450 };
    expect(JSON.stringify(snapshot(calm, near, [])).length).toBeLessThan(8000);
  });

  it("keep the friend's gobbled snake in place for the camera", () => {
    const { world, friend } = duo();
    const guest = createWorld(8, seeded(1));
    const view: ViewBox = { x: 0, y: 0, w: 3000, h: 3000 };
    applySnapshot(guest, overTheWire(snapshot(world, view, [])));
    friend.alive = false;
    applySnapshot(guest, overTheWire(snapshot(world, view, [])));
    expect(guest.players[1]).toMatchObject({ seat: 1, alive: false });
    expect(guest.snakes.some((s) => s.seat === 1)).toBe(false);
  });

  it('coast near snakes forward without deciding anything', () => {
    const { world } = duo();
    const guest = createWorld(8, seeded(1));
    applySnapshot(guest, overTheWire(snapshot(world, { x: 0, y: 0, w: 3000, h: 3000 }, [])));
    const head = { ...guest.players[0]!.body[0] };
    const foods = guest.foods.length;
    coast(guest, 0.1);
    expect(
      Math.hypot(guest.players[0]!.body[0].x - head.x, guest.players[0]!.body[0].y - head.y)
    ).toBeGreaterThan(10);
    expect(guest.events).toHaveLength(0);
    expect(guest.foods).toHaveLength(foods);
  });

  it("keep every event when two arrive in one frame, and forward only the friend's", () => {
    const { world, host, friend } = duo();
    const snack = bot(10, 0, 0);
    const mine = toNetEvent({ type: 'gobble', eater: friend, victim: snack });
    const theirs = toNetEvent({ type: 'munch', snake: host, value: 1 });
    expect(mine).toEqual({
      type: 'gobble',
      eater: { id: friend.id, name: 'Friend', seat: 1, mass: friend.mass },
      victim: { id: snack.id, name: snack.name, seat: null, mass: 10 },
    });
    expect(concerns(mine, 1)).toBe(true);
    expect(concerns(theirs, 1)).toBe(false);
    const box = { x: 0, y: 0, w: 100, h: 100 };
    const merged = mergeSnapshots(snapshot(world, box, [mine]), snapshot(world, box, [theirs]));
    expect(merged.events).toEqual([mine, theirs]);
    const late = mergeSnapshots(merged, snapshot(world, box, []));
    expect(late.events).toEqual([mine]);
    expect(mergeSnapshots(null, merged)).toBe(merged);
  });
});
