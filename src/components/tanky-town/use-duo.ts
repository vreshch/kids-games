'use client';

import { useRef } from 'react';

import {
  applySnapshot,
  coast,
  sameInput,
  snapshot,
  type NetMessage,
  type Snapshot,
} from '@/lib/tanky-town-net';
import type { Input, TankEvent, World } from '@/lib/tanky-town-state';

import { useRoom } from '../duo/use-room';

export type { DuoStatus } from '../duo/use-room';
type Options = { onRole: (seat: number, peers: number) => void; onAgain: () => void };

const SEND_EVERY = 0.033;
const INPUT_EVERY = 0.25;
const IDLE: Input = { dir: null, fire: false };

/** Game traffic only; the game itself stays in `World`, the room in `useRoom`. */
const fresh = () => ({
  remote: IDLE,
  pending: null as Snapshot | null,
  outbox: [] as TankEvent[],
  sendIn: 0,
  sent: IDLE,
});

/** Two players through the relay: seat 0 runs the game, seat 1 mirrors it and sends its input. */
export function useDuo(options: Options) {
  const net = useRef(fresh());
  const room = useRoom<NetMessage>({
    onPeers: (seat, count) => {
      if (count < 2) net.current.remote = IDLE;
      options.onRole(seat, count);
    },
    onMessage: (message) => {
      const n = net.current;
      if (message.t === 'snap') n.pending = message.s;
      else if (message.t === 'input') n.remote = { dir: message.dir, fire: message.fire };
      else options.onAgain();
    },
    onDrop: () => {
      net.current.remote = IDLE;
    },
  });

  const join = (id: string) => {
    net.current = fresh();
    room.join(id);
  };
  const leave = () => {
    net.current = fresh();
    room.leave();
  };

  /** Host: send the whole game, with the events since the last send, about 30 times a second. */
  const hostFrame = (world: World, dt: number) => {
    const n = net.current;
    n.sendIn -= dt;
    if (n.sendIn > 0 || room.now().peers < 2) return;
    n.sendIn = SEND_EVERY;
    room.send({ t: 'snap', s: snapshot(world, n.outbox) });
    n.outbox = [];
  };

  /** Guest: show the newest snapshot (true when one arrived) and send the input when it changes. */
  const guestFrame = (world: World, dt: number, input: Input) => {
    const n = net.current;
    const snap = n.pending;
    n.pending = null;
    if (snap) applySnapshot(world, snap);
    else coast(world, dt);
    n.sendIn -= dt;
    if (!sameInput(input, n.sent) || n.sendIn <= 0) {
      n.sent = { ...input };
      n.sendIn = INPUT_EVERY;
      room.send({ t: 'input', ...n.sent });
    }
    return snap !== null;
  };

  const record = (event: TankEvent) => {
    if (room.now().peers === 2) net.current.outbox.push(event);
  };
  const remoteInput = () => net.current.remote;
  const askAgain = () => room.send({ t: 'again' });

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
    remoteInput,
    askAgain,
  };
}

export type Duo = ReturnType<typeof useDuo>;
