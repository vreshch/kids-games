'use client';

import { useEffect, useRef, type RefObject } from 'react';

import type { Input, TankEvent, World } from '@/lib/tanky-town-state';
import { createWorld, step } from '@/lib/tanky-town-world';

import {
  confetti,
  createEffects,
  popup,
  sparkle,
  stepEffects,
  type Effects,
} from '../munch-maze/effects';
import { drawScene, fitBoard } from './render';

type Options = {
  inputRef: RefObject<Input>;
  liveRef: RefObject<boolean>;
  onEvent: (event: TankEvent, world: World) => void;
};

/** Turns game events into sparkles, confetti, popups and shakes. */
function celebrate(fx: Effects, event: TankEvent, world: World) {
  const x = event.x + 0.5;
  const y = event.y + 0.5;
  if (event.type === 'brick') sparkle(fx, x, y, '#fb923c', 6);
  else if (event.type === 'clang') sparkle(fx, x, y, '#e2e8f0', 4);
  else if (event.type === 'hurt') sparkle(fx, x, y, '#bae6fd', 8);
  else if (event.type === 'heart') popup(fx, x, y - 0.3, '+1 💛');
  else if (event.type === 'boom') {
    sparkle(fx, x, y, '#fde047', 14);
    sparkle(fx, x, y, '#fb923c', 10);
    if (event.owner === 'enemy') popup(fx, x, y - 0.4, 'POW!');
    fx.shake = event.owner === 'enemy' ? 0.15 : 0.35;
  } else if (event.type === 'clear' || event.type === 'won') {
    confetti(fx, world.level.cols / 2, world.level.rows / 2, event.type === 'won' ? 200 : 110);
  } else if (event.type === 'cake') {
    confetti(fx, x, y, 40);
    fx.shake = 0.5;
  }
}

/** Owns the world, steps it every frame while the game is live, and draws it. */
export function useTankLoop(canvasRef: RefObject<HTMLCanvasElement | null>, options: Options) {
  const worldRef = useRef<World>(null);
  if (worldRef.current === null) worldRef.current = createWorld();
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
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

    const fx = createEffects();
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const world = worldRef.current!;
      const { inputRef, liveRef, onEvent } = optionsRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (liveRef.current) step(world, dt, inputRef.current);
      for (const event of world.events) {
        celebrate(fx, event, world);
        onEvent(event, world);
      }
      world.events.length = 0;
      stepEffects(fx, dt);
      ctx.setTransform(screen.dpr, 0, 0, screen.dpr, 0, 0);
      ctx.clearRect(0, 0, screen.w, screen.h);
      drawScene(ctx, world, { b: fitBoard(world, screen.w, screen.h), now, fx });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [canvasRef]);

  return worldRef;
}
