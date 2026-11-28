'use client';

import { useState, type ReactNode } from 'react';

import { shareLink } from '../duo/share-link';
import { SkinPicker } from './hud';

export type Ending = { by: string; length: number; best: number; record: boolean };
type Action = { label: string; onPlay: () => void };

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="short:gap-2 absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-4 bg-black/55 px-4 text-center backdrop-blur-[2px]">
      {children}
    </div>
  );
}

function PlayButton({ label, onPlay }: Action) {
  return (
    <button
      type="button"
      aria-label={label}
      className="short:h-16 short:w-16 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-pink-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-pink-400/40 transition active:scale-90"
      onClick={onPlay}
    >
      ▶
    </button>
  );
}

function PillButton({ label, onPlay }: Action) {
  return (
    <button
      type="button"
      className="min-h-12 rounded-full bg-teal-300 px-5 text-lg font-bold text-neutral-950 shadow-lg shadow-teal-300/30 transition active:scale-95"
      onClick={onPlay}
    >
      {label}
    </button>
  );
}

type MenuProps = {
  skin: number;
  best: number;
  invited: boolean;
  onSkin: (i: number) => void;
  onPlay: () => void;
  onTogether: () => void;
};

export function MenuPanel({ skin, best, invited, onSkin, onPlay, onTogether }: MenuProps) {
  return (
    <Overlay>
      <span className="short:text-3xl bg-gradient-to-r from-pink-300 via-amber-200 to-sky-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
        Wiggle Snakes
      </span>
      <span className="short:hidden max-w-xs px-6 text-base text-neutral-300">
        {invited
          ? 'Your friend is waiting for you! 👫'
          : 'Eat the glowing dots, grow huge, gobble the smaller snakes!'}
      </span>
      <SkinPicker skin={skin} onChange={onSkin} />
      <div className="flex items-center gap-4">
        {!invited && <PlayButton label="Play" onPlay={onPlay} />}
        <PillButton
          label={invited ? '👫 Join your friend' : '👫 Play together'}
          onPlay={onTogether}
        />
      </div>
      <span className="short:hidden max-w-xs px-6 text-sm text-neutral-400">
        steer with your finger or mouse &middot; hold 🚀 or the mouse button to go fast &middot; tap
        ⚡ on top to gobble everyone
      </span>
      <span className="h-5 text-sm text-amber-200/80">{best > 0 ? `Your best: ${best}` : ''}</span>
    </Overlay>
  );
}

export function SharePanel({ link, onAlone }: { link: string; onAlone: () => void }) {
  const [copied, setCopied] = useState(false);
  const share = () => void shareLink('Wiggle Snakes', link).then(setCopied, () => undefined);
  return (
    <Overlay>
      <span className="short:text-3xl text-5xl">👫</span>
      <span className="text-2xl font-bold text-white">Send this link to your friend</span>
      <input
        readOnly
        aria-label="Game link"
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full max-w-sm rounded-xl bg-neutral-800 px-3 py-2 text-center text-sm text-pink-200 select-all"
      />
      <PillButton label={copied ? '✅ Copied!' : '📤 Share the link'} onPlay={share} />
      <span className="animate-pulse text-base text-neutral-300">
        ⏳ Waiting for your friend...
      </span>
      <button
        type="button"
        className="min-h-10 text-sm text-neutral-400 underline underline-offset-4"
        onClick={onAlone}
      >
        or play alone
      </button>
    </Overlay>
  );
}

type NoticeProps = { icon: string; title: string; text?: string; action?: Action };

export function NoticePanel({ icon, title, text, action }: NoticeProps) {
  return (
    <Overlay>
      <span className="text-5xl">{icon}</span>
      <span className="text-2xl font-bold text-white">{title}</span>
      {text && <span className="text-base text-neutral-300">{text}</span>}
      {action && <PillButton {...action} />}
    </Overlay>
  );
}

type OverProps = { ending: Ending; onPlay: () => void; onMenu?: () => void };

export function GameOverPanel({ ending, onPlay, onMenu }: OverProps) {
  return (
    <Overlay>
      <span className="short:text-4xl text-5xl">😵</span>
      <span className="short:text-2xl text-3xl font-bold text-white">
        Oh no! {ending.by} gobbled you!
      </span>
      <span className="text-lg text-neutral-300">
        You grew to <b className="text-amber-200">{ending.length}</b>
      </span>
      <span className="h-6 text-base text-amber-200/90">
        {ending.record ? 'New best! 🏆' : `Your best: ${ending.best}`}
      </span>
      <PlayButton label="Play again" onPlay={onPlay} />
      {onMenu && (
        <button
          type="button"
          className="touch-manipulation text-sm text-neutral-400 underline underline-offset-4"
          onClick={onMenu}
        >
          pick another snake
        </button>
      )}
    </Overlay>
  );
}
