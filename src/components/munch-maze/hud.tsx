'use client';

import type { Dir } from '@/lib/munch-maze-level';

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 25],
    [72, 25],
    [28, 50],
    [72, 50],
    [28, 75],
    [72, 75],
  ],
};

export function DieFace({ value, className }: { value: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect x={4} y={4} width={92} height={92} rx={20} fill="#fffdf5" />
      {(PIPS[value] ?? []).map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={9} fill="#1f2937" />
      ))}
    </svg>
  );
}

type RollProps = { face: number; rolling: boolean; enabled: boolean; onRoll: () => void };

export function RollButton({ face, rolling, enabled, onRoll }: RollProps) {
  return (
    <button
      type="button"
      aria-label="Roll the die"
      disabled={!enabled}
      onClick={onRoll}
      className={`h-24 w-24 touch-manipulation rounded-3xl transition active:scale-90 ${
        enabled ? 'animate-pulse shadow-lg shadow-amber-300/50' : 'opacity-80'
      } ${rolling ? 'animate-spin' : ''}`}
    >
      <DieFace value={face} className="h-full w-full" />
    </button>
  );
}

/** One dot per step: filled dots are steps already walked, so kids can count what is left. */
export function StepDots({ total, left }: { total: number; left: number }) {
  return (
    <div className="flex h-8 items-center gap-2" aria-label={`${left} steps left`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-6 w-6 rounded-full border-2 border-emerald-300 ${
            i < total - left ? 'bg-emerald-300' : 'bg-transparent'
          }`}
        />
      ))}
    </div>
  );
}

const ARROWS: { dir: Dir; label: string; glyph: string; area: string }[] = [
  { dir: 3, label: 'Up', glyph: '▲\uFE0E', area: 'col-start-2 row-start-1' },
  { dir: 2, label: 'Left', glyph: '◀\uFE0E', area: 'col-start-1 row-start-2' },
  { dir: 0, label: 'Right', glyph: '▶\uFE0E', area: 'col-start-3 row-start-2' },
  { dir: 1, label: 'Down', glyph: '▼\uFE0E', area: 'col-start-2 row-start-3' },
];

type PadProps = { canGo: (dir: Dir) => boolean; onStep: (dir: Dir) => void };

export function ArrowPad({ canGo, onStep }: PadProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1">
      {ARROWS.map((a) => (
        <button
          key={a.dir}
          type="button"
          aria-label={`Step ${a.label}`}
          disabled={!canGo(a.dir)}
          onClick={() => onStep(a.dir)}
          className={`${a.area} h-14 w-14 touch-manipulation rounded-2xl bg-emerald-400 text-2xl text-emerald-950 transition active:scale-90 disabled:bg-neutral-700 disabled:text-neutral-500`}
        >
          {a.glyph}
        </button>
      ))}
    </div>
  );
}

export function Lives({ lives }: { lives: number }) {
  return (
    <span className="text-2xl" aria-label={`${lives} lives`}>
      {'💚'.repeat(Math.max(0, lives))}
    </span>
  );
}
