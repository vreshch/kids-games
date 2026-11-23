'use client';

import { useState, type PointerEvent } from 'react';

import type { Dir } from '@/lib/tanky-town-level';

const ARROWS: { dir: Dir; glyph: string; area: string }[] = [
  { dir: 3, glyph: '▲︎', area: 'col-start-2 row-start-1' },
  { dir: 2, glyph: '◀︎', area: 'col-start-1 row-start-2' },
  { dir: 0, glyph: '▶︎', area: 'col-start-3 row-start-2' },
  { dir: 1, glyph: '▼︎', area: 'col-start-2 row-start-3' },
];
const DEAD_ZONE = 10;

/** Which way the finger points from the middle of the pad. */
function dirOf(e: PointerEvent<HTMLDivElement>): Dir | null {
  const rect = e.currentTarget.getBoundingClientRect();
  const dx = e.clientX - (rect.left + rect.width / 2);
  const dy = e.clientY - (rect.top + rect.height / 2);
  if (Math.max(Math.abs(dx), Math.abs(dy)) < DEAD_ZONE) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 0 : 2;
  return dy > 0 ? 1 : 3;
}

/** One big thumb pad: hold to drive, slide to turn, lift to stop. */
export function DrivePad({ onDir }: { onDir: (dir: Dir | null) => void }) {
  const [active, setActive] = useState<Dir | null>(null);
  const set = (dir: Dir | null) => {
    setActive(dir);
    onDir(dir);
  };
  const press = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    set(dirOf(e));
  };
  const slide = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) set(dirOf(e));
  };
  return (
    <div
      role="group"
      aria-label="Drive pad"
      onPointerDown={press}
      onPointerMove={slide}
      onPointerUp={() => set(null)}
      onPointerCancel={() => set(null)}
      onContextMenu={(e) => e.preventDefault()}
      className="grid h-44 w-44 touch-none grid-cols-3 grid-rows-3 gap-1 rounded-full bg-neutral-800/70 p-2"
    >
      {ARROWS.map((a) => (
        <span
          key={a.dir}
          className={`${a.area} flex items-center justify-center rounded-2xl text-2xl transition ${
            active === a.dir
              ? 'scale-95 bg-amber-300 text-amber-950'
              : 'bg-amber-400/25 text-amber-200'
          }`}
        >
          {a.glyph}
        </span>
      ))}
    </div>
  );
}

export function FireButton({ onFire }: { onFire: (down: boolean) => void }) {
  const press = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onFire(true);
  };
  return (
    <button
      type="button"
      aria-label="Fire"
      onPointerDown={press}
      onPointerUp={() => onFire(false)}
      onPointerCancel={() => onFire(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="h-28 w-28 touch-none rounded-full bg-rose-500 text-4xl shadow-lg shadow-rose-500/40 transition active:scale-90 active:bg-rose-400"
    >
      💥
    </button>
  );
}

export function Lives({ lives }: { lives: number }) {
  return (
    <span className="text-xl" aria-label={`${lives} lives`}>
      {'💛'.repeat(Math.max(0, lives))}
    </span>
  );
}
