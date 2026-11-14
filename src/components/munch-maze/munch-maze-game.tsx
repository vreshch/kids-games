'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';

import { trackEvent } from '@/lib/analytics';
import {
  playBerry,
  playCaught,
  playGobble,
  playStar,
  sayNumber,
  unlockMazeAudio,
} from '@/lib/munch-maze-audio';
import type { Dir } from '@/lib/munch-maze-level';
import {
  canStep,
  createWorld,
  nextTurn,
  rollDie,
  stepPlayer,
  type MazeEvent,
  type Phase,
  type World,
} from '@/lib/munch-maze-world';

import { ArrowPad, Lives, RollButton, StepDots } from './hud';
import { GameOverPanel, MenuPanel } from './overlays';
import { useMazeLoop } from './use-maze-loop';

const GAME = { game: 'munch-maze' };
const PAUSE_MS = 1600;
const ROLL_MS = 700;
const KEYS: Record<string, Dir> = { ArrowRight: 0, ArrowDown: 1, ArrowLeft: 2, ArrowUp: 3 };
type View = {
  phase: Phase;
  die: number;
  left: number;
  score: number;
  lives: number;
  round: number;
};

const viewOf = (w: World): View => ({
  phase: w.phase,
  die: w.die,
  left: w.stepsLeft,
  score: w.score,
  lives: w.lives,
  round: w.round,
});

const BANNER: Record<Phase, (v: View) => string> = {
  roll: () => 'Your turn! Tap the die 🎲',
  walk: (v) => `Walk ${v.left} more step${v.left === 1 ? '' : 's'}`,
  clouds: () => 'The clouds are moving...',
  caught: () => 'Oops! A cloud got you 🌧️',
  clear: () => 'Yay! You ate everything! 🎉',
  over: () => '',
};

export function MunchMazeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const [face, setFace] = useState(1);
  const [rolling, setRolling] = useState(false);

  const onEvent = useCallback((event: MazeEvent, world: World) => {
    if (event.type === 'step') sayNumber(event.count);
    else if (event.type === 'berry') playBerry();
    else if (event.type === 'star') playStar();
    else if (event.type === 'gobble') playGobble();
    else if (event.type === 'caught' || event.type === 'over') playCaught();
    if (event.type === 'over') trackEvent('game_over', { ...GAME, score: String(world.score) });
    setView(viewOf(world));
  }, []);

  const { worldRef, boardRef } = useMazeLoop(canvasRef, { onEvent });

  useEffect(() => {
    if (view?.phase !== 'caught' && view?.phase !== 'clear') return;
    const timer = setTimeout(() => {
      nextTurn(worldRef.current!);
      setView(viewOf(worldRef.current!));
    }, PAUSE_MS);
    return () => clearTimeout(timer);
  }, [view?.phase, worldRef]);

  const start = () => {
    unlockMazeAudio();
    worldRef.current = createWorld();
    setView(viewOf(worldRef.current));
    setStarted(true);
    trackEvent('game_start', GAME);
  };

  const roll = useCallback(() => {
    const world = worldRef.current!;
    if (world.phase !== 'roll' || rolling) return;
    setRolling(true);
    const spin = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 90);
    setTimeout(() => {
      clearInterval(spin);
      const value = rollDie(world);
      setFace(value);
      setRolling(false);
      sayNumber(value);
      setView(viewOf(world));
    }, ROLL_MS);
  }, [rolling, worldRef]);

  const step = useCallback(
    (dir: Dir) => {
      if (stepPlayer(worldRef.current!, dir)) setView(viewOf(worldRef.current!));
    },
    [worldRef]
  );

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code in KEYS) step(KEYS[e.code]);
      else if (e.code === 'Space' || e.code === 'Enter') roll();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, step, roll]);

  /** Tap anywhere on the maze: Munchy steps one tile toward the finger. */
  const tapMaze = (e: PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current!;
    if (world.phase === 'roll') return roll();
    const rect = e.currentTarget.getBoundingClientRect();
    const b = boardRef.current;
    const dx = (e.clientX - rect.left - b.left) / b.size - (world.player.x + 0.5);
    const dy = (e.clientY - rect.top - b.top) / b.size - (world.player.y + 0.5);
    const main: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 2) : dy > 0 ? 1 : 3;
    const side: Dir = Math.abs(dx) > Math.abs(dy) ? (dy > 0 ? 1 : 3) : dx > 0 ? 0 : 2;
    step(canStep(world, main) ? main : side);
  };

  const walking = view?.phase === 'walk';
  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col items-center gap-3 self-stretch px-2 select-none">
      <div className="flex w-full items-center justify-between px-2 text-lg font-bold text-amber-200">
        <span>⭐ {view?.score ?? 0}</span>
        <span className="text-sm text-neutral-400">maze {view?.round ?? 1}</span>
        <Lives lives={view?.lives ?? 3} />
      </div>
      <div className="relative min-h-[320px] w-full flex-1">
        <canvas
          ref={canvasRef}
          onPointerDown={tapMaze}
          className="absolute inset-0 h-full w-full touch-none"
          aria-label="Munch Maze board"
        />
        {!started && <MenuPanel onPlay={start} />}
        {view?.phase === 'over' && <GameOverPanel score={view.score} onPlay={start} />}
      </div>
      <div className="h-7 text-center text-lg font-semibold text-emerald-200">
        {view ? BANNER[view.phase](view) : ''}
      </div>
      <div className="flex min-h-44 items-center justify-center gap-6 pb-4">
        <div className="flex flex-col items-center gap-2">
          <RollButton
            face={walking ? view.die : face}
            rolling={rolling}
            enabled={view?.phase === 'roll' && !rolling}
            onRoll={roll}
          />
          <StepDots total={walking ? view.die : 0} left={view?.left ?? 0} />
        </div>
        <ArrowPad canGo={(d) => walking && canStep(worldRef.current!, d)} onStep={step} />
      </div>
    </div>
  );
}
