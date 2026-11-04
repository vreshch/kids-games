'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { radiusFor } from '@/lib/wiggle-snake';
import { SKINS } from '@/lib/wiggle-skins';
import { createWorld, stepWorld, type World, type WorldEvent } from '@/lib/wiggle-world';

import { createAssets, drawFrame, type Camera, type Screen } from './render';

export type ArenaInput = { angle: number; boosting: boolean; steerId: number | null };
type Callbacks = { onHud: (world: World) => void; onEvent: (event: WorldEvent) => void };

const HUD_EVERY_MS = 200;

/** Owns the world and the animation loop; React only hears about it a few times a second. */
export function useArena(canvasRef: RefObject<HTMLCanvasElement | null>, callbacks: Callbacks) {
  const worldRef = useRef<World | null>(null);
  const inputRef = useRef<ArenaInput>({ angle: 0, boosting: false, steerId: null });
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const world = createWorld(SKINS.length);
    worldRef.current = world;
    const assets = createAssets(ctx);
    const cam: Camera = { x: 0, y: 0, zoom: 0.5 };
    const screen: Screen = { w: 1, h: 1, dpr: 1 };
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      screen.w = Math.max(1, rect.width);
      screen.h = Math.max(1, rect.height);
      screen.dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      canvas.width = Math.round(screen.w * screen.dpr);
      canvas.height = Math.round(screen.h * screen.dpr);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let last = performance.now();
    let hudAt = 0;
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { player } = world;
      if (player?.alive) {
        player.targetAngle = inputRef.current.angle;
        player.boosting = inputRef.current.boosting;
      }
      stepWorld(world, dt);
      for (const event of world.events) callbacksRef.current.onEvent(event);
      world.events.length = 0;
      followCamera(cam, world, screen, dt);
      drawFrame(ctx, world, cam, screen, assets);
      if (now - hudAt > HUD_EVERY_MS) {
        hudAt = now;
        callbacksRef.current.onHud(world);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [canvasRef]);

  return { worldRef, inputRef };
}

/** Lock onto the player; on the title screen drift after the biggest bot instead. */
function followCamera(cam: Camera, world: World, screen: Screen, dt: number) {
  const { player } = world;
  if (player && !player.alive) return;
  const target = player ?? [...world.snakes].sort((a, b) => b.mass - a.mass)[0];
  if (!target) return;
  const head = target.body[0];
  const follow = player ? 1 : Math.min(1, dt * 1.5);
  cam.x += (head.x - cam.x) * follow;
  cam.y += (head.y - cam.y) * follow;
  const zoom =
    (Math.min(screen.w, screen.h) / (450 + radiusFor(target.mass) * 18)) * (player ? 1 : 0.75);
  cam.zoom += (zoom - cam.zoom) * Math.min(1, dt * 3);
}
