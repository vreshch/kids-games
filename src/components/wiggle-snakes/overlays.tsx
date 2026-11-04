'use client';

import type { ReactNode } from 'react';

import { SkinPicker } from './hud';

export type Ending = { by: string; length: number; best: number; record: boolean };

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-5 bg-black/55 px-4 text-center backdrop-blur-[2px]">
      {children}
    </div>
  );
}

function PlayButton({ label, onPlay }: { label: string; onPlay: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-pink-400/40 transition active:scale-90"
      onClick={onPlay}
    >
      ▶
    </button>
  );
}

type MenuProps = { skin: number; best: number; onSkin: (i: number) => void; onPlay: () => void };

export function MenuPanel({ skin, best, onSkin, onPlay }: MenuProps) {
  return (
    <Overlay>
      <span className="bg-gradient-to-r from-pink-300 via-amber-200 to-sky-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
        Wiggle Snakes
      </span>
      <span className="max-w-xs px-6 text-base text-neutral-300">
        Eat the glowing dots, grow huge, gobble the smaller snakes!
      </span>
      <SkinPicker skin={skin} onChange={onSkin} />
      <PlayButton label="Play" onPlay={onPlay} />
      <span className="max-w-xs px-6 text-sm text-neutral-400">
        steer with your finger or mouse &middot; hold 🚀 or the mouse button to go fast &middot; tap
        ⚡ on top to gobble everyone
      </span>
      <span className="h-5 text-sm text-amber-200/80">{best > 0 ? `Your best: ${best}` : ''}</span>
    </Overlay>
  );
}

type OverProps = { ending: Ending; onPlay: () => void; onMenu: () => void };

export function GameOverPanel({ ending, onPlay, onMenu }: OverProps) {
  return (
    <Overlay>
      <span className="text-5xl">😵</span>
      <span className="text-3xl font-bold text-white">Oh no! {ending.by} gobbled you!</span>
      <span className="text-lg text-neutral-300">
        You grew to <b className="text-amber-200">{ending.length}</b>
      </span>
      <span className="h-6 text-base text-amber-200/90">
        {ending.record ? 'New best! 🏆' : `Your best: ${ending.best}`}
      </span>
      <PlayButton label="Play again" onPlay={onPlay} />
      <button
        type="button"
        className="touch-manipulation text-sm text-neutral-400 underline underline-offset-4"
        onClick={onMenu}
      >
        pick another snake
      </button>
    </Overlay>
  );
}
