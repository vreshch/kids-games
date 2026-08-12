'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Normalized move direction, +x = screen right, +z = toward the camera. */
export type MoveInput = { x: number; z: number };

const KEY_VECTORS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  Up: [0, -1],
  Down: [0, 1],
  Left: [-1, 0],
  Right: [1, 0],
};

const keyId = (e: KeyboardEvent) => (KEY_VECTORS[e.code] ? e.code : e.key);

export function useKeyboardInput(input: RefObject<MoveInput>) {
  useEffect(() => {
    const pressed = new Set<string>();
    const apply = () => {
      let x = 0;
      let z = 0;
      for (const code of pressed) {
        const vec = KEY_VECTORS[code];
        x += vec[0];
        z += vec[1];
      }
      const len = Math.hypot(x, z);
      input.current = len > 1 ? { x: x / len, z: z / len } : { x, z };
    };
    const down = (e: KeyboardEvent) => {
      const id = keyId(e);
      if (!KEY_VECTORS[id]) return;
      e.preventDefault();
      pressed.add(id);
      apply();
    };
    const up = (e: KeyboardEvent) => {
      if (!pressed.delete(keyId(e))) return;
      apply();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [input]);
}

const RADIUS = 56; // px from base to full speed

type Stick = { id: number; baseX: number; baseY: number; dx: number; dy: number };

/** Full-screen touch layer: press anywhere, a joystick appears under the finger. */
export function TouchJoystick({ input }: { input: RefObject<MoveInput> }) {
  const [stick, setStick] = useState<Stick | null>(null);
  const stickRef = useRef<Stick | null>(null);

  const release = () => {
    stickRef.current = null;
    input.current = { x: 0, z: 0 };
    setStick(null);
  };

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      onPointerDown={(e) => {
        if (stickRef.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const next = { id: e.pointerId, baseX: e.clientX, baseY: e.clientY, dx: 0, dy: 0 };
        stickRef.current = next;
        setStick(next);
      }}
      onPointerMove={(e) => {
        const cur = stickRef.current;
        if (!cur || e.pointerId !== cur.id) return;
        let dx = e.clientX - cur.baseX;
        let dy = e.clientY - cur.baseY;
        const len = Math.hypot(dx, dy);
        if (len > RADIUS) {
          dx = (dx / len) * RADIUS;
          dy = (dy / len) * RADIUS;
        }
        const next = { ...cur, dx, dy };
        stickRef.current = next;
        setStick(next);
        input.current = { x: dx / RADIUS, z: dy / RADIUS };
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {stick ? (
        <div
          className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25 bg-white/5"
          style={{ left: stick.baseX, top: stick.baseY }}
        >
          <div
            className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-white/40 shadow-lg"
            style={{
              transform: `translate(calc(-50% + ${stick.dx}px), calc(-50% + ${stick.dy}px))`,
            }}
          />
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-6 left-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/15 bg-white/5 text-2xl text-white/30 sm:hidden">
          ✥
        </div>
      )}
    </div>
  );
}
