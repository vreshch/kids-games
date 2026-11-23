'use client';

import { useRef, useState, useSyncExternalStore } from 'react';

import { trackEvent } from '@/lib/analytics';
import * as audio from '@/lib/tanky-town-audio';
import { isRoomId, newRoomId } from '@/lib/tanky-town-net';
import type { Input, TankEvent, World } from '@/lib/tanky-town-state';
import { createWorld, step } from '@/lib/tanky-town-world';

import { useDuo } from './use-duo';
import { useKeyboard } from './use-keyboard';
import { useTankLoop } from './use-tank-loop';
import { sameView, viewOf, type View } from './view';

/** Who moves the world: nobody yet, this browser alone, this browser for two, or the friend's. */
export type Mode = 'idle' | 'solo' | 'host' | 'guest';

const GAME = { game: 'tanky-town' };
const SOUNDS: Partial<Record<TankEvent['type'], () => void>> = {
  brick: audio.playBrick,
  clang: audio.playClang,
  boom: audio.playBoom,
  hurt: audio.playHurt,
  heart: audio.playHeart,
  clear: audio.playClear,
  won: audio.playWon,
  over: audio.playOver,
};
const QUIET = new Set<TankEvent['type']>(['shot', 'brick', 'clang']);

const noSubscribe = () => () => undefined;
function roomInUrl() {
  const room = new URLSearchParams(location.search).get('room');
  return isRoomId(room) ? room : null;
}

function report(event: TankEvent, world: World) {
  if (event.type !== 'over' && event.type !== 'won') return;
  trackEvent(event.type === 'won' ? 'game_won' : 'game_over', {
    ...GAME,
    score: String(world.score),
    level: String(world.levelIndex + 1),
  });
}

/** Everything the Tanky Town screen does; the game state itself lives in the loop's World. */
export function useTankGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<Input>({ dir: null, fire: false });
  const modeRef = useRef<Mode>('idle');
  const [mode, setMode] = useState<Mode>('idle');
  const [view, setView] = useState<View | null>(null);
  const invited = useSyncExternalStore(noSubscribe, roomInUrl, () => null);

  const sync = (world: World) =>
    setView((prev) => {
      const next = viewOf(world);
      return prev && sameView(prev, next) ? prev : next;
    });

  const duo = useDuo({
    onRole: (seat, peers) => {
      const now = modeRef.current;
      if (seat === 1) return now === 'guest' || begin('guest');
      if (peers === 2) return now === 'host' || begin('host');
      if (now === 'guest') begin('idle');
    },
    onAgain: () => begin('host', retryLevel()),
  });

  const worldRef = useTankLoop(canvasRef, {
    advance: (world, dt) => {
      const input = inputRef.current;
      if (modeRef.current === 'solo') step(world, dt, [input]);
      else if (modeRef.current === 'host') {
        step(world, dt, [input, duo.remoteInput()]);
        duo.hostFrame(world, dt);
      } else if (modeRef.current === 'guest' && duo.guestFrame(world, dt, input)) sync(world);
    },
    onEvent: (event, world) => {
      if (event.type !== 'shot') SOUNDS[event.type]?.();
      else if (event.owner === 'player') audio.playShot();
      report(event, world);
      if (modeRef.current === 'host') duo.record(event);
      if (!QUIET.has(event.type)) sync(world);
    },
  });
  useKeyboard(inputRef, mode !== 'idle');

  /** A fresh world for the new mode; a guest's stays empty until the first snapshot. */
  function begin(next: Mode, level = 0) {
    const world = createWorld(Math.random, level, next === 'solo' ? 1 : 2);
    worldRef.current = world;
    modeRef.current = next;
    setMode(next);
    setView(next === 'solo' || next === 'host' ? viewOf(world) : null);
    if (next !== 'idle') trackEvent('game_start', { ...GAME, mode: next });
  }

  const playSolo = () => {
    audio.unlockTankAudio();
    duo.leave();
    history.replaceState(null, '', location.pathname);
    begin('solo');
  };
  const playTogether = () => {
    audio.unlockTankAudio();
    const room = invited ?? newRoomId();
    history.replaceState(null, '', `?room=${room}`);
    duo.join(room);
  };
  /** After a loss the same level starts again with a fresh score; after a win, level one. */
  const retryLevel = () => (worldRef.current?.phase === 'over' ? worldRef.current.levelIndex : 0);
  const playAgain = () => (mode === 'guest' ? duo.askAgain() : begin(mode, retryLevel()));
  const link = duo.roomId ? `${location.origin}${location.pathname}?room=${duo.roomId}` : '';

  return { canvasRef, inputRef, mode, view, duo, invited, link, playSolo, playTogether, playAgain };
}

export type TankGame = ReturnType<typeof useTankGame>;
