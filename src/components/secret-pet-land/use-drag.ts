'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import type { Item } from '@/lib/secret-pet-land-data';
import { asTarget, canDrop, dragItem, type DragSource } from '@/lib/secret-pet-land-drag';
import type { Target } from '@/lib/secret-pet-land-puzzles';
import type { World } from '@/lib/secret-pet-land-world';

type Drag = {
  source: DragSource;
  item: Item;
  x: number;
  y: number;
  startX: number;
  startY: number;
  moved: boolean;
  over: Target | null;
};

export type DragApi = {
  start: (source: DragSource) => (e: ReactPointerEvent) => void;
  ghost: { item: Item; x: number; y: number } | null;
  hot: Target | null;
};

const MOVE_PX = 8;

const targetAt = (x: number, y: number) =>
  asTarget(document.elementFromPoint(x, y)?.closest('[data-drop]')?.getAttribute('data-drop'));

/** Pointer drag for mouse and touch; a press that barely moves stays a normal tap. */
export function useDrag(world: World, onDrop: (source: DragSource, target: Target | null) => void) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const swallowClick = useRef(false);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const moved =
        drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > MOVE_PX;
      setDrag({
        ...drag,
        x: e.clientX,
        y: e.clientY,
        moved,
        over: moved ? targetAt(e.clientX, e.clientY) : null,
      });
    };
    const up = () => {
      setDrag(null);
      if (!drag.moved) return;
      // the browser may still fire a click after a real drag; the next press clears this
      swallowClick.current = true;
      onDrop(drag.source, drag.over);
    };
    const cancel = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [drag, onDrop]);

  const start = (source: DragSource) => (e: ReactPointerEvent) => {
    const item = dragItem(world, source);
    if (!item || !e.isPrimary || e.button !== 0) return;
    const { clientX: x, clientY: y } = e;
    setDrag({ source, item, x, y, startX: x, startY: y, moved: false, over: null });
  };

  const live = drag?.moved ? drag : null;
  const api: DragApi = {
    start,
    ghost: live && { item: live.item, x: live.x, y: live.y },
    hot: live?.over && canDrop(world, live.item, live.over) ? live.over : null,
  };
  const stage = {
    onPointerDownCapture: () => (swallowClick.current = false),
    onClickCapture: (e: { stopPropagation: () => void }) => {
      if (swallowClick.current) e.stopPropagation();
    },
  };
  return { api, stage };
}
