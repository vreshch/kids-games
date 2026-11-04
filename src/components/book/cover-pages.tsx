import { playUrl } from '@/lib/book';
import { GAMES, type Game } from '@/lib/games';
import { SITE_URL } from '@/lib/site';

import { mm } from './mm';
import { QrCode } from './qr-code';

const HOST = new URL(SITE_URL).host;

/** Each letter takes a game's color, so the title looks like the games inside. */
function RainbowWord({ word, offset }: { word: string; offset: number }) {
  return (
    <span className="block">
      {[...word].map((letter, i) => (
        <span key={i} style={{ color: GAMES[(i + offset) % GAMES.length].accent }}>
          {letter}
        </span>
      ))}
    </span>
  );
}

type CoverProps = { sheet: number; sheets: number; games: Game[] };

export function CoverPage({ sheet, sheets, games }: CoverProps) {
  return (
    <article className="flex h-full flex-col items-center justify-between rounded-[calc(var(--spacing)*5)] bg-[linear-gradient(160deg,#fdf2f8,#ecfeff_55%,#fefce8)] p-4 text-center text-neutral-700">
      <p className="font-semibold tracking-wide uppercase" style={{ fontSize: mm(3) }}>
        A little book of phone games
      </p>
      <h1
        className="leading-[0.95] font-bold [text-shadow:0_calc(var(--spacing)*0.6)_0_rgba(17,24,39,0.18)]"
        style={{ fontSize: mm(13) }}
      >
        <RainbowWord word="Alisa's" offset={0} />
        <RainbowWord word="Games" offset={3} />
      </h1>
      <ul className="grid grid-cols-3 gap-2">
        {games.map(({ slug, Icon }) => (
          <li key={slug} className="rounded-full bg-white p-1.5 shadow-sm">
            <Icon className="size-12" />
          </li>
        ))}
      </ul>
      <p className="font-medium" style={{ fontSize: mm(3.8) }}>
        invented by Alisa, age 5{sheets > 1 && ` · book ${sheet} of ${sheets}`}
      </p>
      <div className="w-full text-left" style={{ fontSize: mm(3) }}>
        This book belongs to:
        <div className="mt-5 border-b-[calc(var(--spacing)*0.4)] border-dotted border-neutral-400" />
      </div>
    </article>
  );
}

const STEPS = [
  ['📷', 'Open the camera on a phone'],
  ['🎯', 'Point it at a game code'],
  ['👆', 'Tap the link and play!'],
];

export function BackPage() {
  return (
    <article className="flex h-full flex-col items-center justify-between rounded-[calc(var(--spacing)*5)] border-[calc(var(--spacing)*0.7)] border-sky-300 bg-sky-50 p-4 text-center text-neutral-700">
      <h2 className="font-bold text-sky-800" style={{ fontSize: mm(6.4) }}>
        How to play
      </h2>
      <ol className="flex w-full flex-col gap-1.5 text-left" style={{ fontSize: mm(3.4) }}>
        {STEPS.map(([emoji, text], i) => (
          <li key={text} className="flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
            <span className="font-bold text-sky-700">{i + 1}</span>
            <span style={{ fontSize: mm(4.6) }}>{emoji}</span>
            {text}
          </li>
        ))}
      </ol>
      <p style={{ fontSize: mm(3) }}>Free, right in the browser. No app to install.</p>
      <div className="flex w-full items-center gap-2.5 rounded-[calc(var(--spacing)*3.5)] bg-white p-1.5 text-left">
        <QrCode text={playUrl()} label="QR code for all the games" className="size-23" />
        <div className="flex flex-col gap-1 leading-tight">
          <strong style={{ fontSize: mm(4.2) }}>All the games</strong>
          <span className="text-neutral-500" style={{ fontSize: mm(2.6) }}>
            {HOST}
          </span>
        </div>
      </div>
      <p className="text-neutral-500" style={{ fontSize: mm(2.6) }}>
        Made by Alisa with a little help from Claude Code
      </p>
    </article>
  );
}
