'use client';

import { useEffect, useRef, type RefObject } from 'react';

import type { NetEvent, ViewBox } from '@/lib/wiggle-net';
import { radiusFor } from '@/lib/wiggle-snake';
import { SKINS } from '@/lib/wiggle-skins';
import { createWorld, type World } from '@/lib/wiggle-world';

import { createAssets, drawFrame, type Camera, type Screen } from './render';

export type ArenaInput = { angle: number; boosting: boolean; steerId: number | null };
type Callbacks = {
  /** Moves the world on by one frame (a local step or the host's snapshot); returns what happened. */
  advance: (world: World, dt: number, view: ViewBox) => NetEvent[];
  onEvent: (event: NetEvent) => void;
  onHud: (world: World) => void;
  /** This browser's seat: the camera follows that snake. */
  me: () => number;
};

const HUD_EVERY_MS = 200;

export const freshWorld = () => createWorld(SKINS.length);

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
    worldRef.current ??= freshWorld();
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
      const world = worldRef.current!;
      const { advance, onEvent, onHud, me } = callbacksRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const event of advance(world, dt, viewOf(cam, screen))) onEvent(event);
      followCamera(cam, world, screen, dt, me());
      drawFrame(ctx, world, cam, screen, assets, me());
      if (now - hudAt > HUD_EVERY_MS) {
        hudAt = now;
        onHud(world);
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

/** What the camera shows, in arena units; the host sends the friend only this part. */
const viewOf = (cam: Camera, screen: Screen): ViewBox => ({
  x: Math.round(cam.x),
  y: Math.round(cam.y),
  w: Math.round(screen.w / 2 / cam.zoom),
  h: Math.round(screen.h / 2 / cam.zoom),
});

/** Lock onto this player's snake; on the title screen drift after the biggest bot instead. */
function followCamera(cam: Camera, world: World, screen: Screen, dt: number, me: number) {
  const player = world.players[me];
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
