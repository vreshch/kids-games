'use client';

import { useRef } from 'react';

import type { Seat } from '@/lib/duo-room';
import {
  applySnapshot,
  coast,
  concerns,
  mergeSnapshots,
  snapshot,
  type NetEvent,
  type Snapshot,
  type ViewBox,
  type WiggleMessage,
} from '@/lib/wiggle-net';
import type { World } from '@/lib/wiggle-world';

import { useRoom } from '../duo/use-room';

export type Steer = { angle: number; boosting: boolean };
type Options = {
  onRole: (seat: number, peers: number) => void;
  /** Host only: the friend asked for a (new) snake, or pressed super. */
  onSpawn: (skin: number) => void;
  onSuper: () => void;
};

const SEND_EVERY = 0.033;
const HEARTBEAT = 0.25;
const IDLE: Steer = { angle: 0, boosting: false };

/** Game traffic only; the game itself stays in `World`, the room in `useRoom`. */
const fresh = () => ({
  remote: IDLE,
  view: null as ViewBox | null,
  pending: null as Snapshot | null,
  outbox: [] as NetEvent[],
  sendIn: 0,
  beatIn: 0,
  sent: '',
});

/** Two players through the relay: seat 0 runs the arena, seat 1 mirrors it and steers. */
export function useDuo(options: Options) {
  const net = useRef(fresh());
  const room = useRoom<WiggleMessage>({
    onPeers: (seat, count) => {
      if (count < 2) {
        net.current.remote = IDLE;
        net.current.outbox = [];
      }
      options.onRole(seat, count);
    },
    onMessage: (message) => {
      const n = net.current;
      if (message.t === 'snap') n.pending = mergeSnapshots(n.pending, message.s);
      else if (message.t === 'input') {
        n.remote = { angle: message.a, boosting: message.b };
        n.view = message.v;
      } else if (message.t === 'spawn') options.onSpawn(message.skin);
      else options.onSuper();
    },
    onDrop: () => {
      net.current.remote = IDLE;
    },
  });

  const join = (id: string, seat: Seat) => {
    net.current = fresh();
    room.join(id, seat);
  };
  const leave = () => {
    net.current = fresh();
    room.leave();
  };

  /** Host: send what the friend can see, with its events, about 30 times a second. */
  const hostFrame = (world: World, dt: number) => {
    const n = net.current;
    n.sendIn -= dt;
    if (n.sendIn > 0 || room.now().peers < 2 || !n.view) return;
    n.sendIn = SEND_EVERY;
    room.send({ t: 'snap', s: snapshot(world, n.view, n.outbox) });
    n.outbox = [];
  };

  /** Friend: show the newest snapshot or coast, and send the steering when it changes. */
  const guestFrame = (world: World, dt: number, steer: Steer, view: ViewBox) => {
    const n = net.current;
    const snap = n.pending;
    n.pending = null;
    const events = snap ? applySnapshot(world, snap) : [];
    if (!snap) coast(world, dt);
    const a = Math.round(steer.angle * 100) / 100;
    const key = `${a} ${steer.boosting} ${view.x} ${view.y} ${view.w} ${view.h}`;
    n.sendIn -= dt;
    n.beatIn -= dt;
    if ((key !== n.sent && n.sendIn <= 0) || n.beatIn <= 0) {
      n.sent = key;
      n.sendIn = SEND_EVERY;
      n.beatIn = HEARTBEAT;
      room.send({ t: 'input', a, b: steer.boosting, v: view });
    }
    return events;
  };

  const record = (event: NetEvent) => {
    if (room.now().peers === 2 && concerns(event, 1)) net.current.outbox.push(event);
  };

  return {
    status: room.status,
    seat: room.seat,
    peers: room.peers,
    roomId: room.roomId,
    join,
    leave,
    hostFrame,
    guestFrame,
    record,
    remoteSteer: () => net.current.remote,
    askSpawn: (skin: number) => room.send({ t: 'spawn', skin }),
    askSuper: () => room.send({ t: 'super' }),
  };
}

export type Duo = ReturnType<typeof useDuo>;
