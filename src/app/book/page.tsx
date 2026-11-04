import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import Link from 'next/link';

import { BookSide } from '@/components/book/book-sheet';
import { PrintButton } from '@/components/book/print-button';
import { bookPages, imposeSheet } from '@/lib/book';
import { GAMES } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Paper Book',
  description:
    "Print Alisa's games as a little paper book with a QR code on every page - scan and play.",
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
  'Print in color on A4, two-sided, "Flip on short edge". One sheet makes two books. If the back comes out upside down, switch to the other flip option.',
  'Cut along the dashed cross into 4 pieces.',
  'Fold each piece in half along the dotted line, pictures outside.',
  'Slide the piece with page 3 inside the one with the cover, then staple the fold twice.',
];

export default function BookPage() {
  const books = bookPages(GAMES);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:gap-0 print:p-0">
      <style>{PRINT_CSS}</style>
      <header className="flex flex-col gap-5 print:hidden">
        <Link href="/" className="w-fit text-sm text-neutral-400">
          &larr; all games
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Paper Book</h1>
        <p className="max-w-2xl text-balance text-neutral-300 sm:text-lg">
          Print it on both sides, cut, fold, staple, and hand it out. Every game has its own QR
          code: point a phone camera at it and the game opens right away.
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
        {books.map((pages, index) => {
          const { front, back } = imposeSheet(pages);
          const of = books.length > 1 ? ` of book ${index + 1}` : '';
          return [
            <BookSide key={`${index}-front`} pages={front} label={`Front side${of}`} guides />,
            <BookSide key={`${index}-back`} pages={back} label={`Back side${of}`} />,
          ];
        })}
      </div>
    </main>
  );
}
