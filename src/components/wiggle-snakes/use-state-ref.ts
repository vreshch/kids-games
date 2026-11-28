'use client';

import { useRef, useState } from 'react';

/** State for the screen plus a ref with the same value for the game loop and socket callbacks. */
export function useStateRef<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const ref = useRef(initial);
  const set = (next: T) => {
    ref.current = next;
    setValue(next);
  };
  return [value, ref, set] as const;
}
