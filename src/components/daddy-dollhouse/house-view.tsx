import { HOUSES } from '@/lib/dollhouse-data';

import { CharArt } from './characters';
import { Room } from './room';
import type { Ctx } from './room-things';

function Cabin({ ctx }: { ctx: Ctx }) {
  const { lift, at } = ctx.state;
  const rider = (Object.keys(at) as (keyof typeof at)[]).find((id) => at[id] === 'lift');
  const closed = lift.phase === 'closing' || lift.phase === 'riding';
  return (
    <span
      className="absolute inset-x-0.5 h-[49%] overflow-hidden rounded bg-amber-100 transition-[top] duration-[1300ms] ease-in-out motion-reduce:transition-none"
      style={{ top: lift.floor === 1 ? '0.5%' : '50.5%' }}
    >
      {rider ? (
        <span className="absolute inset-x-1 top-2 bottom-1 flex justify-center">
          <span className="block w-10">
            <CharArt id={rider} happy />
          </span>
        </span>
      ) : null}
      {[0, 1].map((side) => (
        <span
          key={side}
          className="absolute inset-y-0 w-1/2 bg-slate-400 transition-transform duration-500 motion-reduce:transition-none"
          style={{
            [side ? 'right' : 'left']: 0,
            transform: closed ? 'none' : `scaleX(0.12)`,
            transformOrigin: side ? 'right' : 'left',
          }}
        />
      ))}
    </span>
  );
}

function Shaft({ ctx }: { ctx: Ctx }) {
  return (
    <button
      type="button"
      aria-label="Elevator"
      onClick={() => ctx.dispatch({ type: 'elevator' })}
      className="relative row-span-2 touch-manipulation overflow-hidden rounded bg-slate-700"
    >
      <span className="absolute inset-x-1/2 inset-y-0 w-px bg-slate-500" />
      <Cabin ctx={ctx} />
      <span className="pointer-events-none absolute top-[48%] left-1/2 size-3 -translate-x-1/2 rounded-full bg-rose-400" />
    </button>
  );
}

export function HouseView({ ctx }: { ctx: Ctx }) {
  const def = HOUSES[ctx.state.house];
  return (
    <div className="short:flex-none short:w-[min(calc((100dvh_-_7.75rem)*5/3),calc(100vw_-_21rem))] flex w-full flex-1 flex-col justify-center">
      <div
        className="short:h-6 mx-auto h-9 w-[104%] -translate-x-[2%] transition-colors duration-500"
        style={{ background: def.roof, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
      />
      <div
        className="short:aspect-[5/3] grid aspect-[7/6] w-full grid-cols-[1fr_22%_1fr] grid-rows-2 gap-1 rounded-md p-1 transition-colors duration-500"
        style={{ background: def.wall }}
      >
        <Room room={2} ctx={ctx} />
        <Shaft ctx={ctx} />
        <Room room={3} ctx={ctx} />
        <Room room={0} ctx={ctx} />
        <Room room={1} ctx={ctx} />
      </div>
      <div className="mx-auto h-4 w-[104%] -translate-x-[2%] rounded-b-2xl bg-emerald-500 transition-opacity" />
    </div>
  );
}
