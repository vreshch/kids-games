'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { trackEvent } from '@/lib/analytics';
import { speakHint } from '@/lib/speak';
import { playSuper, unlockWiggleAudio } from '@/lib/wiggle-audio';
import { activateSuper, superState } from '@/lib/wiggle-rules';
import { loadSkin, saveSkin } from '@/lib/wiggle-skins';
import { removePlayer, spawnPlayer, type World } from '@/lib/wiggle-world';

import { inviteInUrl, pickRoom } from '../duo/room';
import { roomLink } from '../duo/share-link';
import { readHud, spawnFriend, steer, stepLocal, type Hud } from './arena-step';
import { isTouch, noSubscribe } from './browser-store';
import { freshWorld, useArena, type ArenaInput } from './use-arena';
import { useDuo } from './use-duo';
import { useFeedback } from './use-feedback';
import { useKeyboard } from './use-keyboard';
import { useStateRef } from './use-state-ref';

/** Who moves the arena: nobody yet, this browser alone, this browser for two, or the friend's. */
export type Mode = 'idle' | 'solo' | 'host' | 'guest';
export type Phase = 'menu' | 'play' | 'over';

const GAME = { game: 'wiggle-snakes' };

/** Everything the Wiggle Snakes screen does; the arena itself lives in the loop's World. */
export function useWiggleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, modeRef, setMode] = useStateRef<Mode>('idle');
  const [phase, phaseRef, setPhase] = useStateRef<Phase>('menu');
  // server and first client paint agree on the defaults; the saved values land right after
  const savedSkin = useSyncExternalStore(noSubscribe, loadSkin, () => 0);
  const invited = useSyncExternalStore(noSubscribe, inviteInUrl, () => null);
  const touch = useSyncExternalStore(noSubscribe, isTouch, () => false);
  const [pickedSkin, setSkin] = useState<number | null>(null);
  const skin = pickedSkin ?? savedSkin;
  const skinRef = useRef(skin);
  const [hud, setHud] = useState<Hud | null>(null);

  useEffect(() => {
    skinRef.current = skin;
  }, [skin]);

  const me = () => (modeRef.current === 'guest' ? 1 : 0);

  const feedback = useFeedback(me, () => setPhase('over'));

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
      if (world && modeRef.current === 'host') spawnFriend(world, friendSkin);
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
    onEvent: feedback.onEvent,
    onHud: (world) => setHud(readHud(world, me())),
    me,
  });

  const resetInput = (angle: number) => {
    inputRef.current = { angle, boosting: false, steerId: null } satisfies ArenaInput;
  };

  /** This browser's own snake, now: spawned here, or asked from the host. */
  function spawnMine() {
    const world = worldRef.current;
    if (!world) return;
    feedback.clearEnding();
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
    speakHint(peers === 2 ? 'Your friend is here!' : 'Your friend left', 0);
    if (peers === 2 && phaseRef.current === 'play') spawnMine();
  }

  const playSolo = () => {
    unlockWiggleAudio();
    duo.leave();
    history.replaceState(null, '', location.pathname);
    if (modeRef.current === 'guest') worldRef.current = freshWorld();
    else if (worldRef.current) removePlayer(worldRef.current, 1);
    setMode('solo');
    spawnMine();
    trackEvent('game_start', GAME);
  };

  const playTogether = () => {
    unlockWiggleAudio();
    const { room, seat } = pickRoom();
    history.replaceState(null, '', `?room=${room}`);
    duo.join(room, seat);
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

  useKeyboard(inputRef, phase === 'play', pressSuper);

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
    ...feedback,
    hud,
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
