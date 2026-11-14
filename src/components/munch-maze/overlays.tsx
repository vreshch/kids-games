'use client';

import type { ReactNode } from 'react';

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-5 rounded-2xl bg-black/65 px-4 text-center backdrop-blur-[2px]">
      {children}
    </div>
  );
}

function PlayButton({ label, onPlay }: { label: string; onPlay: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-emerald-400/40 transition active:scale-90"
      onClick={onPlay}
    >
      ▶
    </button>
  );
}

export function MenuPanel({ onPlay }: { onPlay: () => void }) {
  return (
    <Overlay>
      <span className="bg-gradient-to-r from-emerald-300 via-amber-200 to-pink-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
        Munch Maze
      </span>
      <span className="max-w-xs px-6 text-base text-neutral-200">
        Roll the die, count your steps, eat all the berries. Watch out for the grumpy clouds!
      </span>
      <PlayButton label="Play" onPlay={onPlay} />
      <span className="max-w-xs px-6 text-sm text-neutral-400">
        eat a ⭐ and the clouds get scared, then you can gobble them
      </span>
    </Overlay>
  );
}

export function GameOverPanel({ score, onPlay }: { score: number; onPlay: () => void }) {
  return (
    <Overlay>
      <span className="text-5xl">🌧️</span>
      <span className="text-3xl font-bold text-white">The clouds got you!</span>
      <span className="text-lg text-neutral-300">
        You got <b className="text-amber-200">{score}</b> points
      </span>
      <PlayButton label="Play again" onPlay={onPlay} />
    </Overlay>
  );
}
