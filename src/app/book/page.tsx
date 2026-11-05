import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import Link from 'next/link';

import { BookSheet } from '@/components/book/book-sheet';
import { PrintButton } from '@/components/book/print-button';
import { bookPages, imposeSheets } from '@/lib/book';
import { GAMES } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Paper Book',
  description:
    "Print Alisa's games as a little fold-up paper book with a QR code on every page - scan and play.",
  alternates: { canonical: '/book' },
  openGraph: { title: 'Paper Book', url: '/book' },
};

const fredoka = Fredoka({ subsets: ['latin'] });

// Print gets the bare sheets on A4 landscape, edge to edge; the screen gets the how-to around them.
const PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
@media print { body { background: #fff; padding: 0; } }
`;

const STEPS = [
  'Print in color on A4, on both sides: turn on "Print on both sides" and pick "Flip on short edge". If the colors come out missing, turn on "Background graphics".',
  'Cut along the red lines into four cards. Each row is one book, so one sheet makes two.',
  'Take a row: slip the card with pages 6 and 3 inside the card with the cover, so the pages count up from 1 to 8.',
  'Fold them in half together along the dashed line, cover outside. Add a staple in the fold if you like.',
];

export default function BookPage() {
  const sheets = imposeSheets(bookPages(GAMES));
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:gap-0 print:p-0">
      <style>{PRINT_CSS}</style>
      <header className="flex flex-col gap-5 print:hidden">
        <Link href="/" className="w-fit text-sm text-neutral-400">
          &larr; all games
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Paper Book</h1>
        <p className="max-w-2xl text-balance text-neutral-300 sm:text-lg">
          Print one sheet on both sides, cut it into four cards, and fold two little books to hand
          out. Every game has its own QR code: point a phone camera at it and the game opens right
          away.
        </p>
        <PrintButton />
        <ol className="grid max-w-4xl gap-3 text-sm text-neutral-300 sm:grid-cols-2 sm:text-base">
          {STEPS.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-neutral-900/70 p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-400 font-bold text-neutral-950">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </header>
      <div className={`${fredoka.className} flex flex-col gap-8 print:gap-0`}>
        {sheets.flatMap(({ front, back }, index) => [
          <BookSheet
            key={`${index}-front`}
            side="front"
            slots={front}
            label={`Sheet ${index + 1}, front`}
          />,
          <BookSheet
            key={`${index}-back`}
            side="back"
            slots={back}
            label={`Sheet ${index + 1}, back`}
          />,
        ])}
      </div>
    </main>
  );
}
