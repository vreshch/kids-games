'use client';

import { useEffect, useRef, useState } from 'react';

import { openRoom, type Drop, type Room } from './room';

export type DuoStatus = 'off' | 'connecting' | 'open' | Drop;
type Handlers<M> = {
  /** Someone came or went; `seat` is this browser's (0 is the host). */
  onPeers: (seat: number, count: number) => void;
  onMessage: (message: M) => void;
  onDrop?: () => void;
};

/** One relay room for a two-player game: who sits where, who is here, and sending. */
export function useRoom<M extends { t: string }>(handlers: Handlers<M>) {
  const [status, setStatus] = useState<DuoStatus>('off');
  const [seat, setSeat] = useState(-1);
  const [peers, setPeers] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const handlersRef = useRef(handlers);
  const live = useRef({ room: null as Room<M> | null, seat: -1, peers: 0 });

  useEffect(() => {
    handlersRef.current = handlers;
  });
  useEffect(() => () => live.current.room?.close(), []);

  const leave = () => {
    live.current.room?.close();
    live.current = { room: null, seat: -1, peers: 0 };
    setStatus('off');
    setSeat(-1);
    setPeers(0);
    setRoomId(null);
  };

  const join = (id: string) => {
    leave();
    const n = live.current;
    setRoomId(id);
    setStatus('connecting');
    n.room = openRoom<M>(id, {
      onSeat: (mine) => {
        n.seat = mine;
        setSeat(mine);
        setStatus('open');
      },
      onPeers: (count) => {
        n.peers = count;
        setPeers(count);
        handlersRef.current.onPeers(n.seat, count);
      },
      onMessage: (message) => handlersRef.current.onMessage(message),
      onDrop: (why) => {
        n.peers = 0;
        setPeers(0);
        setStatus(why);
        handlersRef.current.onDrop?.();
      },
    });
  };

  const send = (message: M) => live.current.room?.send(message);
  /** For the game loop: the newest values, without waiting for a render. */
  const now = () => ({ seat: live.current.seat, peers: live.current.peers });

  return { status, seat, peers, roomId, join, leave, send, now };
}
