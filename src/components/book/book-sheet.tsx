import { UPSIDE_DOWN_SLOTS, type BookPage } from '@/lib/book';

import { BackPage, CoverPage } from './cover-pages';
import { DrawPage, GamePage } from './game-page';
import { mm } from './mm';

function Page({ page }: { page: BookPage }) {
  if (page.kind === 'cover') return <CoverPage {...page} />;
  if (page.kind === 'back') return <BackPage />;
  if (page.kind === 'draw') return <DrawPage number={page.number} />;
  return <GamePage game={page.game} number={page.number} />;
}

/** Faint fold lines, and the one red cut across the middle two panels. */
function Guides() {
  const fold = 'absolute border-dashed border-neutral-300';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className={`${fold} inset-y-0 left-1/4 border-l`} />
      <div className={`${fold} inset-y-0 left-1/2 border-l`} />
      <div className={`${fold} inset-y-0 left-3/4 border-l`} />
      <div className={`${fold} top-1/2 left-0 w-1/4 border-t`} />
      <div className={`${fold} top-1/2 right-0 w-1/4 border-t`} />
      <div className="absolute top-1/2 left-1/4 w-1/2 border-t-[calc(var(--spacing)*0.5)] border-dashed border-rose-500" />
      <span
        className="absolute top-1/2 left-1/4 -translate-y-1/2 bg-white px-0.5 leading-none text-rose-500"
        style={{ fontSize: mm(4.5) }}
      >
        ✂
      </span>
    </div>
  );
}

/**
 * One A4 sheet with one cut makes an 8-page book. The spacing unit is a millimetre here
 * (scaled to the screen width in the preview), so print lands exactly on the paper.
 */
export function BookSheet({ slots, label }: { slots: BookPage[]; label: string }) {
  return (
    <div className="@container w-full break-after-page last:break-after-auto">
      <section
        aria-label={label}
        className="relative grid h-210 w-297 grid-cols-4 grid-rows-2 overflow-hidden rounded-sm bg-white shadow-2xl [--spacing:calc(100cqw/297)] [text-rendering:geometricPrecision] print:rounded-none print:shadow-none print:[--spacing:1mm]"
      >
        {slots.map((page, slot) => (
          <div
            key={slot}
            className={`min-h-0 p-4.5 ${slot < UPSIDE_DOWN_SLOTS ? 'rotate-180' : ''}`}
          >
            <Page page={page} />
          </div>
        ))}
        <Guides />
      </section>
    </div>
  );
}
