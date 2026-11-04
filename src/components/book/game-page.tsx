import Image from 'next/image';

import { blurbFor, playUrl } from '@/lib/book';
import { SITE_URL } from '@/lib/site';
import type { Game } from '@/lib/games';

import { BOOK_SHOTS } from './book-shots';
import { mm } from './mm';
import { QrCode } from './qr-code';

const HOST = new URL(SITE_URL).host;

function PageNumber({ number }: { number: number }) {
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-bold text-white"
      style={{ fontSize: mm(3.6) }}
    >
      {number}
    </span>
  );
}

function Picture({ game }: { game: Game }) {
  const shot = BOOK_SHOTS[game.slug];
  if (!shot) return <game.Icon className="size-28 self-center" />;
  return (
    <div className="relative w-29 shrink-0 overflow-hidden rounded-[calc(var(--spacing)*4)] border-[calc(var(--spacing)*1.2)] border-neutral-900 bg-neutral-900">
      <Image
        src={shot}
        alt={`${game.title} on a phone`}
        fill
        unoptimized
        loading="eager"
        className="object-cover object-bottom"
      />
    </div>
  );
}

export function GamePage({ game, number }: { game: Game; number: number }) {
  return (
    <article
      style={{ '--accent': game.accent } as React.CSSProperties}
      className="flex h-full flex-col gap-2.5 rounded-[calc(var(--spacing)*5)] border-[calc(var(--spacing)*0.7)] border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,white)] p-3 text-neutral-800"
    >
      <header className="flex items-center gap-2">
        <PageNumber number={number} />
        <h2
          className="leading-none font-bold text-[color-mix(in_srgb,var(--accent)_55%,#111827)]"
          style={{ fontSize: mm(6.4) }}
        >
          {game.title}
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 gap-2.5">
        <Picture game={game} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <game.Icon className="size-16" />
          <p className="leading-snug font-medium" style={{ fontSize: mm(3.5) }}>
            {blurbFor(game)}
          </p>
        </div>
      </div>

      <footer className="flex items-center gap-2.5 rounded-[calc(var(--spacing)*3.5)] bg-white p-1.5">
        <QrCode text={playUrl(game.slug)} label={`QR code for ${game.title}`} className="size-23" />
        <div className="flex flex-col gap-1 leading-tight">
          <strong className="font-bold" style={{ fontSize: mm(4.4) }}>
            Scan &amp; play!
          </strong>
          <span className="text-neutral-500" style={{ fontSize: mm(2.5) }}>
            {HOST}
            <br />
            <span className="font-semibold text-neutral-700">/{game.slug}</span>
          </span>
        </div>
      </footer>
    </article>
  );
}

export function DrawPage({ number }: { number: number }) {
  return (
    <article className="flex h-full flex-col items-center gap-3 rounded-[calc(var(--spacing)*5)] border-[calc(var(--spacing)*0.7)] border-dashed border-neutral-400 p-4 text-center text-neutral-600">
      <span className="self-start font-bold" style={{ fontSize: mm(3.6) }}>
        {number}
      </span>
      <strong style={{ fontSize: mm(5.6) }}>Your game here!</strong>
      <p style={{ fontSize: mm(3.4) }}>
        Alisa draws every game on paper first. Draw the game you want to play next.
      </p>
      <div className="w-full flex-1 rounded-[calc(var(--spacing)*3)] border-[calc(var(--spacing)*0.4)] border-dashed border-neutral-300" />
    </article>
  );
}
