'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { trackEvent } from '@/lib/analytics';
import { newRoomId } from '@/lib/duo-room';
import { speakHint } from '@/lib/speak';
import { playGobble, playMunch, playOops, playSuper, unlockWiggleAudio } from '@/lib/wiggle-audio';
import { toNetEvent, type NetEvent } from '@/lib/wiggle-net';
import { activateSuper, superState } from '@/lib/wiggle-rules';
import { loadBest, loadSkin, recordBest, saveSkin } from '@/lib/wiggle-skins';
import {
  removePlayer,
  spawnPlayer,
  standings,
  stepWorld,
  type Standing,
  type World,
} from '@/lib/wiggle-world';

import { roomInUrl } from '../duo/room';
import { roomLink } from '../duo/share-link';
import type { Ending } from './overlays';
import { freshWorld, useArena, type ArenaInput } from './use-arena';
import { useDuo, type Steer } from './use-duo';

/** Who moves the arena: nobody yet, this browser alone, this browser for two, or the friend's. */
export type Mode = 'idle' | 'solo' | 'host' | 'guest';
export type Phase = 'menu' | 'play' | 'over';
export type Hud = { board: Standing[]; player?: Standing; total: number } & ReturnType<
  typeof superState
>;

const GAME = { game: 'wiggle-snakes' };
const noSubscribe = () => () => {};
const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

function readHud(world: World, me: number): Hud {
  const board = standings(world, me);
  return {
    board,
    player: board.find((s) => s.isPlayer),
    total: board.length,
    ...superState(world, me),
  };
}

function steer(world: World, seat: number, input: Steer) {
  const snake = world.players[seat];
  if (!snake?.alive) return;
  snake.targetAngle = input.angle;
  snake.boosting = input.boosting;
}

/** A local step; the world's events come out in the shape the friend also gets them. */
function stepLocal(world: World, dt: number) {
  stepWorld(world, dt);
  const events = world.events.map(toNetEvent);
  world.events.length = 0;
  return events;
}

/** Everything the Wiggle Snakes screen does; the arena itself lives in the loop's World. */
export function useWiggleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<Mode>('idle');
  const phaseRef = useRef<Phase>('menu');
  const [mode, setModeState] = useState<Mode>('idle');
  const [phase, setPhaseState] = useState<Phase>('menu');
  // server and first client paint agree on the defaults; the saved values land right after
  const savedSkin = useSyncExternalStore(noSubscribe, loadSkin, () => 0);
  const savedBest = useSyncExternalStore(noSubscribe, loadBest, () => 0);
  const invited = useSyncExternalStore(noSubscribe, roomInUrl, () => null);
  const touch = useSyncExternalStore(noSubscribe, isTouch, () => false);
  const [pickedSkin, setSkin] = useState<number | null>(null);
  const [newBest, setBest] = useState<number | null>(null);
  const skin = pickedSkin ?? savedSkin;
  const best = newBest ?? savedBest;
  const skinRef = useRef(skin);
  const [hud, setHud] = useState<Hud | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    skinRef.current = skin;
  }, [skin]);

  const setMode = (next: Mode) => {
    modeRef.current = next;
    setModeState(next);
  };
  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };
  const me = () => (modeRef.current === 'guest' ? 1 : 0);

  const onEvent = (event: NetEvent) => {
    const mine = (seat: number | null) => seat === me();
    if (event.type === 'munch') {
      if (mine(event.snake.seat)) playMunch();
      return;
    }
    if (mine(event.eater.seat)) {
      playGobble();
      setToast({ id: event.victim.id, text: `You gobbled ${event.victim.name}! 😋` });
    }
    if (mine(event.victim.seat)) {
      playOops();
      const length = Math.round(event.victim.mass);
      const record = length > loadBest();
      const topLength = recordBest(length);
      setBest(topLength);
      setEnding({ by: event.eater.name, length, best: topLength, record });
      setPhase('over');
      trackEvent('game_over', { ...GAME, length: String(length) });
    }
  };

  const duo = useDuo({
    onRole: (seat, peers) => {
      const now = modeRef.current;
      if (seat === 1) return joinAsGuest(peers);
      if (peers === 2) {
        if (now !== 'host') beginHost();
        speakHint('Your friend is here!', 0);
        return;
      }
      if (now === 'host' && worldRef.current) {
        removePlayer(worldRef.current, 1);
        speakHint('Your friend left', 0);
      }
      if (now === 'guest') {
        worldRef.current = freshWorld();
        setMode('idle');
        setPhase('menu');
      }
    },
    onSpawn: (friendSkin) => {
      const world = worldRef.current;
      if (world && modeRef.current === 'host' && !world.players[1]?.alive) {
        spawnPlayer(world, friendSkin, 1);
      }
    },
    onSuper: () => {
      if (worldRef.current) activateSuper(worldRef.current, 1);
    },
  });

  const advance = (world: World, dt: number, view: Parameters<typeof duo.guestFrame>[3]) => {
    const input = inputRef.current;
    const now = modeRef.current;
    if (now === 'guest') return duo.guestFrame(world, dt, input, view);
    steer(world, 0, input);
    if (now !== 'host') return stepLocal(world, dt);
    steer(world, 1, duo.remoteSteer());
    const events = stepLocal(world, dt);
    for (const event of events) duo.record(event);
    duo.hostFrame(world, dt);
    return events;
  };

  const { worldRef, inputRef } = useArena(canvasRef, {
    advance,
    onEvent,
    onHud: (world) => setHud(readHud(world, me())),
    me,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const resetInput = (angle: number) => {
    inputRef.current = { angle, boosting: false, steerId: null } satisfies ArenaInput;
  };

  /** This browser's own snake, now: spawned here, or asked from the host. */
  function spawnMine() {
    const world = worldRef.current;
    if (!world) return;
    setEnding(null);
    setPhase('play');
    if (modeRef.current === 'guest') {
      resetInput(0);
      duo.askSpawn(skinRef.current);
      return;
    }
    const player = spawnPlayer(world, skinRef.current, 0);
    resetInput(player.angle);
    setHud(readHud(world, 0));
  }

  function beginHost() {
    setMode('host');
    spawnMine();
    trackEvent('game_start', { ...GAME, mode: 'host' });
  }

  function joinAsGuest(peers: number) {
    if (modeRef.current !== 'guest') {
      worldRef.current = freshWorld();
      setMode('guest');
      setPhase('play');
      setHud(null);
      trackEvent('game_start', { ...GAME, mode: 'guest' });
    }
    if (peers === 2) speakHint('Your friend is here!', 0);
    if (peers === 2 && phaseRef.current === 'play') spawnMine();
  }

  const playSolo = () => {
    unlockWiggleAudio();
    duo.leave();
    history.replaceState(null, '', location.pathname);
    if (modeRef.current === 'guest') worldRef.current = freshWorld();
    setMode('solo');
    spawnMine();
    trackEvent('game_start', GAME);
  };

  const playTogether = () => {
    unlockWiggleAudio();
    const room = invited ?? newRoomId();
    history.replaceState(null, '', `?room=${room}`);
    duo.join(room);
  };

  const playAgain = () => {
    unlockWiggleAudio();
    spawnMine();
  };

  function pressSuper() {
    const world = worldRef.current;
    if (!world) return;
    if (modeRef.current === 'guest') {
      if (!superState(world, 1).ready || !world.players[1]?.alive) return;
      duo.askSuper();
    } else if (!activateSuper(world, 0)) return;
    playSuper();
    trackEvent('super_power', GAME);
  }
  const pressRef = useRef(pressSuper);
  useEffect(() => {
    pressRef.current = pressSuper;
  });

  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown';
      if (e.code === 'Space') inputRef.current.boosting = down;
      else if (down && e.code === 'ArrowLeft') inputRef.current.angle -= 0.3;
      else if (down && e.code === 'ArrowRight') inputRef.current.angle += 0.3;
      else if (down && e.code === 'KeyS') pressRef.current();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [phase, inputRef]);

  const pickSkin = (i: number) => {
    setSkin(i);
    saveSkin(i);
  };

  return {
    canvasRef,
    inputRef,
    mode,
    phase,
    skin,
    best,
    hud,
    ending,
    toast,
    touch,
    invited,
    duo,
    link: roomLink(duo.roomId),
    pickSkin,
    playSolo,
    playTogether,
    playAgain,
    pressSuper,
    toMenu: () => setPhase('menu'),
  };
}

export type WiggleGame = ReturnType<typeof useWiggleGame>;
