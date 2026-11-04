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

/** Front side only: a dashed cross to cut, a dotted line down each spread to fold. */
function Guides() {
  const scissors = 'absolute bg-white leading-none text-neutral-500';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-neutral-400">
        <span
          className={`${scissors} top-0 -translate-x-1/2 rotate-90`}
          style={{ fontSize: mm(4) }}
        >
          ✂
        </span>
      </div>
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-400">
        <span className={`${scissors} left-0 -translate-y-1/2`} style={{ fontSize: mm(4) }}>
          ✂
        </span>
      </div>
      <div className="absolute inset-y-0 left-1/4 border-l border-dotted border-neutral-300" />
      <div className="absolute inset-y-0 left-3/4 border-l border-dotted border-neutral-300" />
    </div>
  );
}

type SideProps = { pages: BookPage[]; label: string; guides?: boolean };

/**
 * One side of an A4 sheet. The spacing unit is a millimetre here (scaled to the screen width
 * in the preview), so print lands exactly on the paper and the back lines up with the front.
 */
export function BookSide({ pages, label, guides = false }: SideProps) {
  return (
    <div className="@container flex w-full break-after-page flex-col gap-2 last:break-after-auto">
      <h2 className="text-sm font-semibold text-neutral-400 print:hidden">{label}</h2>
      <section
        aria-label={label}
        className="relative grid h-210 w-297 grid-cols-4 grid-rows-2 overflow-hidden rounded-sm bg-white shadow-2xl [--spacing:calc(100cqw/297)] [text-rendering:geometricPrecision] print:rounded-none print:shadow-none print:[--spacing:1mm]"
      >
        {pages.map((page, slot) => (
          <div key={slot} className="min-h-0 p-4.5">
            <Page page={page} />
          </div>
        ))}
        {guides && <Guides />}
      </section>
    </div>
  );
}
