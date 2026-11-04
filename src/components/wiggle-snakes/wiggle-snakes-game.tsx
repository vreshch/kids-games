'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from 'react';

import { trackEvent } from '@/lib/analytics';
import { playGobble, playMunch, playOops, playSuper, unlockWiggleAudio } from '@/lib/wiggle-audio';
import { loadBest, loadSkin, recordBest, saveSkin } from '@/lib/wiggle-skins';
import { activateSuper, superState } from '@/lib/wiggle-rules';
import {
  spawnPlayer,
  standings,
  type Standing,
  type World,
  type WorldEvent,
} from '@/lib/wiggle-world';

import { BoostButton, LengthBadge, Leaderboard, SuperButton } from './hud';
import { GameOverPanel, MenuPanel, type Ending } from './overlays';
import { useArena } from './use-arena';

type Phase = 'menu' | 'play' | 'over';
type Hud = { board: Standing[]; player?: Standing; total: number } & ReturnType<typeof superState>;

const GAME = { game: 'wiggle-snakes' };
const noSubscribe = () => () => {};
const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

function readHud(world: World): Hud {
  const board = standings(world);
  return {
    board,
    player: board.find((s) => s.isPlayer),
    total: board.length,
    ...superState(world),
  };
}

export function WiggleSnakesGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('menu');
  // server and first client paint agree on the defaults; the saved values land right after
  const savedSkin = useSyncExternalStore(noSubscribe, loadSkin, () => 0);
  const savedBest = useSyncExternalStore(noSubscribe, loadBest, () => 0);
  const [pickedSkin, setSkin] = useState<number | null>(null);
  const [newBest, setBest] = useState<number | null>(null);
  const skin = pickedSkin ?? savedSkin;
  const best = newBest ?? savedBest;
  const [hud, setHud] = useState<Hud | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const touch = useSyncExternalStore(noSubscribe, isTouch, () => false);

  const onEvent = useCallback((event: WorldEvent) => {
    if (event.type === 'munch') {
      if (event.snake.isPlayer) playMunch();
      return;
    }
    if (event.eater.isPlayer) {
      playGobble();
      setToast({ id: event.victim.id, text: `You gobbled ${event.victim.name}! 😋` });
    }
    if (event.victim.isPlayer) {
      playOops();
      const length = Math.round(event.victim.mass);
      const record = length > loadBest();
      const topLength = recordBest(length);
      setBest(topLength);
      setEnding({ by: event.eater.name, length, best: topLength, record });
      setPhase('over');
      trackEvent('game_over', { ...GAME, length: String(length) });
    }
  }, []);

  const { worldRef, inputRef } = useArena(canvasRef, { onHud: (w) => setHud(readHud(w)), onEvent });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const start = () => {
    const world = worldRef.current;
    if (!world) return;
    unlockWiggleAudio();
    const player = spawnPlayer(world, skin);
    inputRef.current = { angle: player.angle, boosting: false, steerId: null };
    setHud(readHud(world));
    setEnding(null);
    setPhase('play');
    trackEvent('game_start', GAME);
  };

  const pressSuper = useCallback(() => {
    const world = worldRef.current;
    if (!world || !activateSuper(world)) return;
    playSuper();
    setHud(readHud(world));
    trackEvent('super_power', GAME);
  }, [worldRef]);

  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown';
      if (e.code === 'Space') inputRef.current.boosting = down;
      else if (down && e.code === 'ArrowLeft') inputRef.current.angle -= 0.3;
      else if (down && e.code === 'ArrowRight') inputRef.current.angle += 0.3;
      else if (down && e.code === 'KeyS') pressSuper();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [phase, inputRef, pressSuper]);

  /** The head sits mid-screen, so steering is just "point from the middle to the finger". */
  const steer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    if (dx !== 0 || dy !== 0) inputRef.current.angle = Math.atan2(dy, dx);
  };

  return (
    <div
      className="relative w-full flex-1 touch-none self-stretch overflow-hidden bg-[#07091a] select-none"
      onPointerDown={(e) => {
        if (phase !== 'play') return;
        if (e.pointerType === 'mouse') inputRef.current.boosting = e.button === 0;
        else inputRef.current.steerId = e.pointerId;
        steer(e);
      }}
      onPointerMove={(e) => {
        if (phase !== 'play') return;
        if (e.pointerType === 'mouse' || e.pointerId === inputRef.current.steerId) steer(e);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'mouse') inputRef.current.boosting = false;
        if (e.pointerId === inputRef.current.steerId) inputRef.current.steerId = null;
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Snake arena" />

      {phase === 'play' && hud && (
        <>
          <SuperButton
            charge={hud.charge}
            active={hud.active}
            ready={hud.ready}
            left={hud.remaining}
            onPress={pressSuper}
          />
          <Leaderboard board={hud.board} player={hud.player} />
          <LengthBadge
            length={hud.player?.length ?? 0}
            rank={hud.player?.rank ?? 0}
            total={hud.total}
          />
          {touch && (
            <BoostButton
              onBoost={(on) => {
                inputRef.current.boosting = on;
              }}
            />
          )}
          {toast && (
            <div
              key={toast.id}
              className="pointer-events-none absolute top-[36%] left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-black/55 px-4 py-1.5 text-base font-semibold whitespace-nowrap text-amber-200"
            >
              {toast.text}
            </div>
          )}
        </>
      )}

      {phase === 'menu' && (
        <MenuPanel
          skin={skin}
          best={best}
          onSkin={(i) => {
            setSkin(i);
            saveSkin(i);
          }}
          onPlay={start}
        />
      )}
      {phase === 'over' && ending && (
        <GameOverPanel ending={ending} onPlay={start} onMenu={() => setPhase('menu')} />
      )}
    </div>
  );
}
