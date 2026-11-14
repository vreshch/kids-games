'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { createWorld, stepClouds, type MazeEvent, type World } from '@/lib/munch-maze-world';

import {
  drawBoard,
  drawCloud,
  drawMunchy,
  fitBoard,
  glide,
  type Board,
  type Shown,
} from './render';

const CLOUD_STEP_MS = 260;
type Callbacks = { onEvent: (event: MazeEvent, world: World) => void };

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
    const frame = (now: number) => {
      const world = worldRef.current!;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (world.phase === 'clouds' && now - cloudAt > CLOUD_STEP_MS) {
        cloudAt = now;
        stepClouds(world);
      }
      for (const event of world.events) callbacksRef.current.onEvent(event, world);
      world.events.length = 0;

      const board = fitBoard(world, screen.w, screen.h);
      boardRef.current = board;
      ctx.setTransform(screen.dpr, 0, 0, screen.dpr, 0, 0);
      ctx.fillStyle = '#0b0820';
      ctx.fillRect(0, 0, screen.w, screen.h);
      drawBoard(ctx, world, board, now);
      for (const cloud of world.clouds) {
        drawCloud(ctx, world, cloud, board, spot(`c${cloud.id}`, cloud.x, cloud.y, dt), now);
      }
      drawMunchy(ctx, world, board, spot('p', world.player.x, world.player.y, dt), now);
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
