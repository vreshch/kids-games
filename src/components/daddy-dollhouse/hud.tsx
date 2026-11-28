import { HOUSES, ICE_COLORS, SECRET_IDS, type IceColor } from '@/lib/dollhouse-data';
import { current } from '@/lib/dollhouse-play';
import type { Action, DollState } from '@/lib/dollhouse-state';

import { Cube, HouseIcon, ItemIcon, LockIcon, StarIcon } from './icons';

type Props = { state: DollState; dispatch: (action: Action) => void };

function Houses({ state, dispatch }: Props) {
  return (
    <div className="flex gap-1.5">
      {HOUSES.map((def, i) => {
        const locked = i === 1 && !state.unlocked;
        const index = i as 0 | 1;
        return (
          <button
            key={def.name}
            type="button"
            aria-label={locked ? `${def.name} (locked)` : def.name}
            aria-pressed={state.house === i}
            disabled={locked}
            onClick={() => dispatch({ type: 'house', index })}
            className={`relative flex size-12 items-center justify-center rounded-xl bg-white/20 p-2 transition ${
              state.house === i ? 'ring-4 ring-amber-300' : ''
            } ${state.unlocked && state.house === 0 && i === 1 ? 'animate-bob' : ''}`}
          >
            <HouseIcon tint={def.roof} className={`size-full ${locked ? 'opacity-30' : ''}`} />
            {locked ? <LockIcon className="absolute size-5" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function Counter({ state }: { state: DollState }) {
  const found = current(state).secrets.length;
  return (
    <div className="flex" role="img" aria-label={`${found} of 3 secrets found`}>
      {SECRET_IDS.map((id, i) => (
        <StarIcon key={id} on={i < found} className="size-8" />
      ))}
    </div>
  );
}

function Items({ state }: { state: DollState }) {
  const items = current(state).items;
  return (
    <div className="flex gap-1" aria-label="Things you have">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="flex size-10 items-center justify-center rounded-lg border-2 border-dashed border-white/40 bg-white/10 p-1"
        >
          {items[i] ? <ItemIcon id={items[i]} className="animate-spl-pop size-full" /> : null}
        </span>
      ))}
    </div>
  );
}

export function TopBar({ state, dispatch }: Props) {
  return (
    <div className="short:flex-col short:items-start flex w-full items-center justify-between gap-2">
      <Houses state={state} dispatch={dispatch} />
      <Counter state={state} />
      <Items state={state} />
    </div>
  );
}

export function IceBar({ state, dispatch }: Props) {
  const colors = Object.keys(ICE_COLORS) as IceColor[];
  return (
    <div className="short:grid short:grid-cols-2 flex w-full items-center justify-center gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`${color} ice`}
          aria-pressed={state.iceColor === color}
          onClick={() => dispatch({ type: 'iceColor', color })}
          className={`size-12 rounded-full border-4 transition ${
            state.iceColor === color ? 'scale-110 border-white' : 'border-transparent'
          }`}
          style={{ background: ICE_COLORS[color] }}
        />
      ))}
      <button
        type="button"
        aria-label="Ice cube"
        aria-pressed={state.holding}
        disabled={!state.cube}
        onClick={() => dispatch({ type: 'cube' })}
        className={`flex size-12 items-center justify-center rounded-xl bg-white/20 p-1 transition ${
          state.holding ? 'ring-4 ring-amber-300' : ''
        } ${state.cube ? '' : 'opacity-40'}`}
      >
        <Cube
          color={ICE_COLORS[state.iceColor]}
          className={state.cube ? 'size-full' : 'size-full opacity-0'}
        />
      </button>
    </div>
  );
}
