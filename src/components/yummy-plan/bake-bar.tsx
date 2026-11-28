'use client';

import type { RefObject } from 'react';

import { GOOD_ZONE } from '@/lib/yummy-kitchen';

type Props = {
  sweet: number;
  starRef: RefObject<HTMLSpanElement | null>;
  resting: boolean;
  onBake: () => void;
};

const zone = (half: number) => ({ left: `${(0.5 - half) * 100}%`, width: `${half * 200}%` });

/** The star slides over the bar; the green spot sits right on top of the Bake button. */
export function BakeBar({ sweet, starRef, resting, onBake }: Props) {
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="relative h-12 w-full rounded-full bg-neutral-800">
        <span
          className="absolute inset-y-1 rounded-full bg-amber-300/40"
          style={zone(Math.min(0.5, sweet * GOOD_ZONE))}
        />
        <span className="absolute inset-y-1 rounded-full bg-emerald-400" style={zone(sweet)} />
        <span
          ref={starRef}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow"
          style={{ left: '0%' }}
          aria-hidden="true"
        >
          ⭐
        </span>
      </div>
      <span className="text-2xl leading-none text-emerald-300" aria-hidden="true">
        ▼
      </span>
      <button
        type="button"
        aria-label="Bake"
        disabled={resting}
        onClick={onBake}
        className="h-24 w-24 touch-manipulation rounded-full bg-orange-500 text-5xl shadow-lg shadow-orange-500/40 transition active:scale-90 disabled:opacity-50"
      >
        🔥
      </button>
    </div>
  );
}
