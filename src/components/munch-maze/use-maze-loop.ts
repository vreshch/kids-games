'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { createWorld, stepClouds, type MazeEvent, type World } from '@/lib/munch-maze-world';

import { confetti, createEffects, popup, sparkle, stepEffects, type Effects } from './effects';
import { drawScene, fitBoard, glide, type Board, type Shown } from './render';

const CLOUD_STEP_MS = 140;
type Callbacks = { onEvent: (event: MazeEvent, world: World) => void };

/** Turns game events into sparkles, confetti, popups and shakes. */
function celebrate(fx: Effects, event: MazeEvent, world: World) {
  const p = { x: world.player.x + 0.5, y: world.player.y + 0.5 };
  if (event.type === 'berry') {
    sparkle(fx, p.x, p.y, '#fb7185', 6);
    popup(fx, p.x, p.y - 0.3, '+10', '#fecdd3');
  } else if (event.type === 'star') {
    sparkle(fx, p.x, p.y, '#fde047', 16);
    popup(fx, p.x, p.y - 0.4, 'SUPER!', '#fde047');
  } else if (event.type === 'gobble') {
    confetti(fx, p.x, p.y, 30);
    popup(fx, p.x, p.y - 0.4, 'YUM! +200', '#fde047');
    fx.shake = 0.25;
  } else if (event.type === 'clear') {
    confetti(fx, world.level.cols / 2, world.level.rows / 2, 120);
  } else if (event.type === 'caught' || event.type === 'over') {
    fx.shake = 0.4;
    sparkle(fx, p.x, p.y, '#93c5fd', 12);
  }
}

/** Owns the world, the clouds' step timer and the draw loop. */
export function useMazeLoop(canvasRef: RefObject<HTMLCanvasElement | null>, callbacks: Callbacks) {
  const worldRef = useRef<World>(null);
  if (worldRef.current === null) worldRef.current = createWorld();
  const boardRef = useRef<Board>({ left: 0, top: 0, size: 1 });
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const screen = { w: 1, h: 1, dpr: 1 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      screen.w = Math.max(1, rect.width);
      screen.h = Math.max(1, rect.height);
      screen.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(screen.w * screen.dpr);
      canvas.height = Math.round(screen.h * screen.dpr);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const shown = new Map<string, Shown>();
    const spot = (key: string, x: number, y: number, dt: number) => {
      const s = shown.get(key) ?? { x, y };
      glide(s, x, y, dt);
      shown.set(key, s);
      return s;
    };
    let last = performance.now();
    let cloudAt = 0;
    let raf = 0;
    const fx = createEffects();
    const frame = (now: number) => {
      const world = worldRef.current!;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (world.phase === 'clouds' && now - cloudAt > CLOUD_STEP_MS) {
        cloudAt = now;
        stepClouds(world);
      }
      for (const event of world.events) {
        celebrate(fx, event, world);
        callbacksRef.current.onEvent(event, world);
      }
      world.events.length = 0;

      const board = fitBoard(world, screen.w, screen.h);
      boardRef.current = board;
      ctx.setTransform(screen.dpr, 0, 0, screen.dpr, 0, 0);
      ctx.fillStyle = '#0b0820';
      ctx.fillRect(0, 0, screen.w, screen.h);
      stepEffects(fx, dt);
      drawScene(ctx, world, {
        b: board,
        dpr: screen.dpr,
        now,
        fx,
        spot: (key) => {
          const target = key === 'p' ? world.player : world.clouds[Number(key.slice(1))];
          return spot(key, target.x, target.y, dt);
        },
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [canvasRef]);

  return { worldRef, boardRef };
}
