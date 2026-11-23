'use client';

import { useState, type ReactNode } from 'react';

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-4 rounded-2xl bg-black/65 px-4 text-center backdrop-blur-[2px]">
      {children}
    </div>
  );
}

type Action = { label: string; onPlay: () => void };

function PlayButton({ label, onPlay }: Action) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-amber-400/40 transition active:scale-90"
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
      className="min-h-12 rounded-full bg-teal-400 px-6 text-lg font-bold text-neutral-950 shadow-lg shadow-teal-400/30 transition active:scale-95"
      onClick={onPlay}
    >
      {label}
    </button>
  );
}

type MenuProps = { invited: boolean; onSolo: () => void; onTogether: () => void };

export function MenuPanel({ invited, onSolo, onTogether }: MenuProps) {
  return (
    <Overlay>
      <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
        Tanky Town
      </span>
      <span className="max-w-xs px-6 text-base text-neutral-200">
        {invited
          ? 'Your friend is waiting for you!'
          : 'Drive your little tank and keep the birthday cake safe from the grumpy tanks!'}
      </span>
      {!invited && <PlayButton label="Play" onPlay={onSolo} />}
      <PillButton
        label={invited ? '👫 Join your friend' : '👫 Play together'}
        onPlay={onTogether}
      />
      <span className="max-w-xs px-6 text-sm text-neutral-400">
        5 levels. Hold the pad to drive, tap 💥 to shoot. Keyboard: arrows and space.
      </span>
    </Overlay>
  );
}

/** Shares the link with the phone's share sheet, or copies it where there is none. */
async function shareLink(link: string) {
  if (navigator.share) return navigator.share({ title: 'Tanky Town', url: link }).then(() => false);
  await navigator.clipboard.writeText(link);
  return true;
}

export function SharePanel({ link, onAlone }: { link: string; onAlone: () => void }) {
  const [copied, setCopied] = useState(false);
  const share = () => void shareLink(link).then(setCopied, () => undefined);
  return (
    <Overlay>
      <span className="text-4xl">👫</span>
      <span className="text-2xl font-bold text-white">Send this link to your friend</span>
      <input
        readOnly
        aria-label="Game link"
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full max-w-sm rounded-xl bg-neutral-800 px-3 py-2 text-center text-sm text-amber-200 select-all"
      />
      <PillButton label={copied ? 'Copied!' : 'Share the link'} onPlay={share} />
      <span className="animate-pulse text-base text-neutral-300">Waiting for your friend...</span>
      <button
        type="button"
        className="min-h-10 text-sm text-neutral-400 underline"
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

type EndProps = { score: number; won: boolean; onPlay: () => void };

export function EndPanel({ score, won, onPlay }: EndProps) {
  return (
    <Overlay>
      <span className="text-5xl">{won ? '🏆' : '🎂'}</span>
      <span className="text-3xl font-bold text-white">
        {won ? 'You saved the cake!' : 'The grumpy tanks won'}
      </span>
      <span className="text-lg text-neutral-300">
        You got <b className="text-amber-200">{score}</b> points
      </span>
      <PlayButton label="Play again" onPlay={onPlay} />
    </Overlay>
  );
}
