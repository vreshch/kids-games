'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import {
  playBoom,
  playBrick,
  playClang,
  playClear,
  playHeart,
  playHurt,
  playOver,
  playShot,
  playWon,
  unlockTankAudio,
} from '@/lib/tanky-town-audio';
import { LEVEL_COUNT, LEVEL_DEFS, type Dir } from '@/lib/tanky-town-level';
import type { Input, Phase, TankEvent, World } from '@/lib/tanky-town-state';
import { createWorld, enemiesLeft } from '@/lib/tanky-town-world';

import { DrivePad, FireButton, Lives } from './hud';
import { EndPanel, MenuPanel } from './overlays';
import { useTankLoop } from './use-tank-loop';

const GAME = { game: 'tanky-town' };
const KEYS: Record<string, Dir> = {
  ArrowRight: 0,
  ArrowDown: 1,
  ArrowLeft: 2,
  ArrowUp: 3,
  KeyD: 0,
  KeyS: 1,
  KeyA: 2,
  KeyW: 3,
};
const SOUNDS: Partial<Record<TankEvent['type'], () => void>> = {
  brick: playBrick,
  clang: playClang,
  boom: playBoom,
  hurt: playHurt,
  heart: playHeart,
  clear: playClear,
  won: playWon,
  over: playOver,
};
const QUIET = new Set<TankEvent['type']>(['shot', 'brick', 'clang']);

type View = { phase: Phase; level: number; left: number; score: number; lives: number };

const viewOf = (w: World): View => ({
  phase: w.phase,
  level: w.levelIndex,
  left: enemiesLeft(w),
  score: w.score,
  lives: w.lives,
});

function banner(view: View | null) {
  if (!view) return '';
  if (view.phase === 'clear') return `Level clear! 🎉 Next: ${LEVEL_DEFS[view.level + 1].name}`;
  if (view.phase !== 'play') return '';
  return `${LEVEL_DEFS[view.level].name}: ${view.left} grumpy tank${view.left === 1 ? '' : 's'} left`;
}

/** Arrow keys and WASD drive, space shoots; the newest held key wins. */
function useKeyboard(inputRef: { current: Input }, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const input = inputRef.current;
    const held: Dir[] = [];
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown';
      if (e.code === 'Space') input.fire = down;
      else if (e.code in KEYS) {
        const dir = KEYS[e.code];
        if (held.includes(dir)) held.splice(held.indexOf(dir), 1);
        if (down) held.push(dir);
        input.dir = held.at(-1) ?? null;
      } else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [inputRef, enabled]);
}

export function TankyTownGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<Input>({ dir: null, fire: false });
  const liveRef = useRef(false);
  const [view, setView] = useState<View | null>(null);

  const onEvent = useCallback((event: TankEvent, world: World) => {
    if (event.type === 'shot') {
      if (event.owner === 'player') playShot();
    } else SOUNDS[event.type]?.();
    if (event.type === 'over' || event.type === 'won') {
      trackEvent(event.type === 'won' ? 'game_won' : 'game_over', {
        ...GAME,
        score: String(world.score),
        level: String(world.levelIndex + 1),
      });
    }
    if (!QUIET.has(event.type)) setView(viewOf(world));
  }, []);

  const worldRef = useTankLoop(canvasRef, { inputRef, liveRef, onEvent });
  useKeyboard(inputRef, view !== null);

  const start = () => {
    unlockTankAudio();
    worldRef.current = createWorld();
    liveRef.current = true;
    setView(viewOf(worldRef.current));
    trackEvent('game_start', GAME);
  };

  const ended = view?.phase === 'over' || view?.phase === 'won';
  return (
    <div className="short:grid short:grid-cols-[auto_1fr_auto] short:grid-rows-[auto_1fr_auto] short:gap-x-4 flex w-full max-w-3xl flex-1 flex-col items-center gap-1 self-stretch px-2 select-none sm:gap-2">
      <div className="short:col-span-3 flex w-full items-center justify-between px-2 text-lg font-bold text-amber-200">
        <span aria-label={`${view?.score ?? 0} points`}>⭐ {view?.score ?? 0}</span>
        <span className="text-sm text-neutral-400">
          level {(view?.level ?? 0) + 1} of {LEVEL_COUNT}
        </span>
        <Lives lives={view?.lives ?? 3} />
      </div>
      <div className="short:col-start-2 short:row-start-2 short:h-full short:min-h-[200px] relative min-h-[240px] w-full flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          aria-label="Tanky Town field"
        />
        {!view && <MenuPanel onPlay={start} />}
        {view && ended && <EndPanel score={view.score} won={view.phase === 'won'} onPlay={start} />}
      </div>
      <div
        className="short:col-span-3 short:row-start-3 h-7 text-center text-base font-semibold text-amber-100"
        aria-live="polite"
      >
        {banner(view)}
      </div>
      <div className="short:contents flex w-full max-w-md items-center justify-between px-4 pb-2">
        <div className="short:col-start-1 short:row-start-2">
          <DrivePad onDir={(dir) => (inputRef.current.dir = dir)} />
        </div>
        <div className="short:col-start-3 short:row-start-2">
          <FireButton onFire={(down) => (inputRef.current.fire = down)} />
        </div>
      </div>
    </div>
  );
}
