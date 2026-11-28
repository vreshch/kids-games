import { toNetEvent } from '@/lib/wiggle-net';
import { superState } from '@/lib/wiggle-rules';
import { spawnPlayer, standings, stepWorld, type Standing, type World } from '@/lib/wiggle-world';

import type { Steer } from './use-duo';

export type Hud = { board: Standing[]; player?: Standing; total: number } & ReturnType<
  typeof superState
>;

/** What the HUD shows to the player in seat `me`. */
export function readHud(world: World, me: number): Hud {
  const board = standings(world, me);
  return {
    board,
    player: board.find((s) => s.isPlayer),
    total: board.length,
    ...superState(world, me),
  };
}

export function steer(world: World, seat: number, input: Steer) {
  const snake = world.players[seat];
  if (!snake?.alive) return;
  snake.targetAngle = input.angle;
  snake.boosting = input.boosting;
}

/** A local step; the world's events come out in the shape the friend also gets them. */
export function stepLocal(world: World, dt: number) {
  stepWorld(world, dt);
  const events = world.events.map(toNetEvent);
  world.events.length = 0;
  return events;
}

/** Host: the friend's snake appears, unless it is still alive. */
export function spawnFriend(world: World, skin: number) {
  if (!world.players[1]?.alive) spawnPlayer(world, skin, 1);
}
