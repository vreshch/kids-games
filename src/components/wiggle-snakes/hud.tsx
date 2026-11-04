'use client';

import { useRef, type PointerEvent } from 'react';

import { SKINS } from '@/lib/wiggle-skins';
import type { Standing } from '@/lib/wiggle-world';

const stopSteer = (e: PointerEvent) => e.stopPropagation();

type SuperProps = {
  charge: number;
  active: boolean;
  ready: boolean;
  left: number;
  onPress: () => void;
};

/** Alisa's big button on top: fills up, glows when ready, then lets you gobble everyone. */
export function SuperButton({ charge, active, ready, left, onPress }: SuperProps) {
  const label = active ? `${Math.ceil(left)}` : ready ? 'SUPER!' : 'filling up';
  return (
    <div className="absolute top-3 left-1/2 flex w-24 -translate-x-1/2 flex-col items-center gap-1">
      <button
        type="button"
        aria-label="Super power"
        aria-disabled={!ready}
        onPointerDown={stopSteer}
        onClick={onPress}
        className={`flex h-[72px] w-[72px] touch-manipulation items-center justify-center rounded-full transition active:scale-90 ${
          ready ? 'shadow-[0_0_28px_6px_rgba(250,204,21,0.55)]' : ''
        }`}
        style={{
          background: `conic-gradient(#facc15 ${charge * 360}deg, rgba(255,255,255,0.14) 0)`,
        }}
      >
        <span
          className={`flex h-[58px] w-[58px] items-center justify-center rounded-full text-3xl ${
            active
              ? 'animate-pulse bg-gradient-to-br from-pink-400 via-yellow-300 to-sky-400'
              : ready
                ? 'bg-amber-400'
                : 'bg-neutral-800 grayscale'
          }`}
        >
          ⚡
        </span>
      </button>
      <span className="pointer-events-none text-xs font-bold tracking-wide text-amber-200 drop-shadow">
        {label}
      </span>
    </div>
  );
}

export function Leaderboard({ board, player }: { board: Standing[]; player?: Standing }) {
  const shown = board.slice(0, 5);
  return (
    <ol className="pointer-events-none absolute top-3 right-3 w-32 rounded-xl bg-black/40 px-3 py-2 text-xs sm:w-44 sm:text-sm">
      <li className="mb-1 text-[11px] font-semibold tracking-wide text-pink-200/80 uppercase">
        Biggest snakes
      </li>
      {shown.map((s) => (
        <Row key={s.rank} standing={s} />
      ))}
      {player && player.rank > shown.length && <Row standing={player} />}
    </ol>
  );
}

function Row({ standing }: { standing: Standing }) {
  return (
    <li
      className={`flex justify-between gap-2 ${standing.isPlayer ? 'font-bold text-amber-300' : 'text-white/80'}`}
    >
      <span className="truncate">
        {standing.rank}. {standing.name}
      </span>
      <span className="tabular-nums">{standing.length}</span>
    </li>
  );
}

export function LengthBadge({
  length,
  rank,
  total,
}: {
  length: number;
  rank: number;
  total: number;
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col text-white drop-shadow">
      <span className="text-3xl font-extrabold tabular-nums">{length}</span>
      <span className="text-xs text-white/70">
        length &middot; #{rank} of {total}
      </span>
    </div>
  );
}

/** Hold to go fast; pointer capture keeps it pressed even if the finger slides off. */
export function BoostButton({ onBoost }: { onBoost: (on: boolean) => void }) {
  const held = useRef(false);
  const set = (on: boolean) => {
    if (held.current === on) return;
    held.current = on;
    onBoost(on);
  };
  return (
    <button
      type="button"
      aria-label="Go fast"
      className="absolute right-5 bottom-5 flex h-20 w-20 touch-none items-center justify-center rounded-full border-2 border-sky-300/60 bg-sky-400/25 text-4xl select-none active:scale-95 active:bg-sky-400/50"
      onPointerDown={(e) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        set(true);
      }}
      onPointerUp={() => set(false)}
      onPointerCancel={() => set(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      🚀
    </button>
  );
}

const stripes = (colors: readonly string[]) =>
  `repeating-linear-gradient(90deg, ${colors.map((c, i) => `${c} ${i * 9}px ${(i + 1) * 9}px`).join(', ')})`;

export function SkinPicker({
  skin,
  onChange,
}: {
  skin: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {SKINS.map((s, i) => (
        <button
          key={s.id}
          type="button"

          aria-label={`${s.name} snake`}
          aria-pressed={skin === i}
          onClick={() => onChange(i)}
          className={`h-11 w-11 touch-manipulation rounded-full border-2 transition active:scale-90 ${
            skin === i ? 'scale-110 border-white' : 'border-white/25'
          }`}
          style={{ background: stripes(s.colors) }}
        />
      ))}
    </div>
  );
}
