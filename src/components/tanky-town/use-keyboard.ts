'use client';

import { useEffect } from 'react';

import type { Dir } from '@/lib/tanky-town-level';
import type { Input } from '@/lib/tanky-town-state';

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

/** Arrow keys and WASD drive, space shoots; the newest held key wins. */
export function useKeyboard(inputRef: { current: Input }, enabled: boolean) {
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
