'use client';

import { useEffect, useRef, type RefObject } from 'react';

import type { ArenaInput } from './use-arena';

/** Arrows turn, space goes fast, S fires super - only while a snake is playing. */
export function useKeyboard(inputRef: RefObject<ArenaInput>, active: boolean, onSuper: () => void) {
  const superRef = useRef(onSuper);
  useEffect(() => {
    superRef.current = onSuper;
  });
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown';
      if (e.code === 'Space') inputRef.current.boosting = down;
      else if (down && e.code === 'ArrowLeft') inputRef.current.angle -= 0.3;
      else if (down && e.code === 'ArrowRight') inputRef.current.angle += 0.3;
      else if (down && e.code === 'KeyS') superRef.current();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [active, inputRef]);
}
