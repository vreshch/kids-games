import type { BookPage, BookSheet as Sheet } from '@/lib/book';

import { BackPage, CoverPage } from './cover-pages';
import { DrawPage, GamePage } from './game-page';
import { mm } from './mm';

function Page({ page }: { page: BookPage }) {
  if (page.kind === 'cover') return <CoverPage {...page} />;
  if (page.kind === 'back') return <BackPage />;
  if (page.kind === 'draw') return <DrawPage number={page.number} />;
  return <GamePage game={page.game} number={page.number} />;
}

const pageKey = (page: BookPage) =>
  page.kind === 'game' ? page.game.slug : page.kind === 'draw' ? `draw-${page.number}` : page.kind;

/** Dashed cut lines between the 8 cards, a little scissors at the start of each. */
function Guides() {
  const cut = 'absolute border-dashed border-neutral-400';
  const scissors = 'absolute bg-white leading-none text-neutral-500';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {['left-1/4', 'left-1/2', 'left-3/4'].map((left) => (
        <div key={left} className={`${cut} inset-y-0 ${left} border-l`}>
          <span
            className={`${scissors} top-0 -translate-x-1/2 rotate-90`}
            style={{ fontSize: mm(4) }}
          >
            ✂
          </span>
        </div>
      ))}
      <div className={`${cut} inset-x-0 top-1/2 border-t`}>
        <span className={`${scissors} left-0 -translate-y-1/2`} style={{ fontSize: mm(4) }}>
          ✂
        </span>
      </div>
    </div>
  );
}

/**
 * One A4 sheet cuts into an 8-card book. The spacing unit is a millimetre here
 * (scaled to the screen width in the preview), so print lands exactly on the paper.
 */
export function BookSheet({ sheet, index }: { sheet: Sheet; index: number }) {
  return (
    <div className="@container w-full break-after-page last:break-after-auto">
      <section
        aria-label={`Book sheet ${index + 1}`}
        className="relative grid h-210 w-297 grid-cols-4 grid-rows-2 overflow-hidden rounded-sm bg-white shadow-2xl [--spacing:calc(100cqw/297)] [text-rendering:geometricPrecision] print:rounded-none print:shadow-none print:[--spacing:1mm]"
      >
        {sheet.map((page) => (
          <div key={pageKey(page)} className="min-h-0 p-4.5">
            <Page page={page} />
          </div>
        ))}
        <Guides />
      </section>
    </div>
  );
}
