'use client';

import { useEffect, useRef, useState } from 'react';

import { applySnapshot, coast, sameInput, snapshot, type Snapshot } from '@/lib/tanky-town-net';
import type { Input, TankEvent, World } from '@/lib/tanky-town-state';

import { openRoom, type Drop, type Room } from './room';

export type DuoStatus = 'off' | 'connecting' | 'open' | Drop;
type Options = { onRole: (seat: number, peers: number) => void; onAgain: () => void };

const SEND_EVERY = 0.033;
const INPUT_EVERY = 0.25;
const IDLE: Input = { dir: null, fire: false };

/** Connection state only; the game itself stays in `World`. */
const fresh = () => ({
  room: null as Room | null,
  seat: -1,
  peers: 0,
  remote: IDLE,
  pending: null as Snapshot | null,
  outbox: [] as TankEvent[],
  sendIn: 0,
  sent: IDLE,
});

/** Two players through the relay: seat 0 runs the game, seat 1 mirrors it and sends its input. */
export function useDuo(options: Options) {
  const [status, setStatus] = useState<DuoStatus>('off');
  const [seat, setSeat] = useState(-1);
  const [peers, setPeers] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const optionsRef = useRef(options);
  const net = useRef(fresh());

  useEffect(() => {
    optionsRef.current = options;
  });
  useEffect(() => () => net.current.room?.close(), []);

  const leave = () => {
    net.current.room?.close();
    net.current = fresh();
    setStatus('off');
    setSeat(-1);
    setPeers(0);
    setRoomId(null);
  };

  const join = (id: string) => {
    leave();
    const n = net.current;
    setRoomId(id);
    setStatus('connecting');
    n.room = openRoom(id, {
      onSeat: (mine) => {
        n.seat = mine;
        setSeat(mine);
        setStatus('open');
      },
      onPeers: (count) => {
        n.peers = count;
        if (count < 2) n.remote = IDLE;
        setPeers(count);
        optionsRef.current.onRole(n.seat, count);
      },
      onMessage: (message) => {
        if (message.t === 'snap') n.pending = message.s;
        else if (message.t === 'input') n.remote = { dir: message.dir, fire: message.fire };
        else optionsRef.current.onAgain();
      },
      onDrop: (why) => {
        n.peers = 0;
        n.remote = IDLE;
        setPeers(0);
        setStatus(why);
      },
    });
  };

  /** Host: send the whole game, with the events since the last send, about 30 times a second. */
  const hostFrame = (world: World, dt: number) => {
    const n = net.current;
    n.sendIn -= dt;
    if (n.sendIn > 0 || n.peers < 2) return;
    n.sendIn = SEND_EVERY;
    n.room?.send({ t: 'snap', s: snapshot(world, n.outbox) });
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
      n.room?.send({ t: 'input', ...n.sent });
    }
    return snap !== null;
  };

  const record = (event: TankEvent) => {
    if (net.current.peers === 2) net.current.outbox.push(event);
  };
  const remoteInput = () => net.current.remote;
  const askAgain = () => net.current.room?.send({ t: 'again' });

  return {
    status,
    seat,
    peers,
    roomId,
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
