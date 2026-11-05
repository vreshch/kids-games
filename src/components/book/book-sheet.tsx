import type { BookPage } from '@/lib/book';

import { BackPage, CoverPage } from './cover-pages';
import { DrawPage, GamePage } from './game-page';
import { mm } from './mm';

function Page({ page }: { page: BookPage }) {
  if (page.kind === 'cover') return <CoverPage {...page} />;
  if (page.kind === 'back') return <BackPage />;
  if (page.kind === 'draw') return <DrawPage number={page.number} />;
  return <GamePage game={page.game} number={page.number} />;
}

/** Faint fold lines down the middle of each card; on the front, the red cuts that split the sheet into four cards. */
function Guides({ cuts }: { cuts: boolean }) {
  const fold = 'absolute inset-y-0 border-l border-dashed border-neutral-300';
  const cut = 'absolute border-dashed border-rose-500';
  const scissors = 'absolute bg-white px-0.5 leading-none text-rose-500';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className={`${fold} left-1/4`} />
      <div className={`${fold} left-3/4`} />
      {cuts && (
        <>
          <div className={`${cut} inset-x-0 top-1/2 border-t-[calc(var(--spacing)*0.5)]`} />
          <div className={`${cut} inset-y-0 left-1/2 border-l-[calc(var(--spacing)*0.5)]`} />
          <span
            className={`${scissors} top-1/2 left-0 -translate-y-1/2`}
            style={{ fontSize: mm(4.5) }}
          >
            ✂
          </span>
          <span
            className={`${scissors} top-0 left-1/2 -translate-x-1/2 rotate-90`}
            style={{ fontSize: mm(4.5) }}
          >
            ✂
          </span>
        </>
      )}
    </div>
  );
}

/**
 * One side of an A4 sheet: two books, one per row, each row cut into two cards that nest into an
 * 8-page book. The spacing unit is a millimetre here (scaled to the screen width in the preview),
 * so print lands exactly on the paper, and the back lines up behind the front.
 */
export function BookSheet({
  slots,
  label,
  side,
}: {
  slots: BookPage[];
  label: string;
  side: 'front' | 'back';
}) {
  return (
    <div className="@container w-full break-after-page last:break-after-auto">
      <section
        aria-label={label}
        className="relative grid h-210 w-297 grid-cols-4 grid-rows-2 overflow-hidden rounded-sm bg-white shadow-2xl [--spacing:calc(100cqw/297)] [text-rendering:geometricPrecision] print:rounded-none print:shadow-none print:[--spacing:1mm]"
      >
        {slots.map((page, slot) => (
          <div key={slot} className="min-h-0 p-4.5">
            <Page page={page} />
          </div>
        ))}
        <Guides cuts={side === 'front'} />
      </section>
    </div>
  );
}
