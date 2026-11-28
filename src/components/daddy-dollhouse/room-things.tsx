import type { ReactNode } from 'react';

import { HOUSES, ICE_COLORS, type RoomId, type SecretId, type Slot } from '@/lib/dollhouse-data';
import { current, presentSpot, type Hint } from '@/lib/dollhouse-play';
import type { Action, DollState } from '@/lib/dollhouse-state';

import { ItemIcon } from './icons';
import { FoundStar, MachineArt, PresentArt, SecretArt, Sparkle } from './things';

export type Ctx = { state: DollState; dispatch: (action: Action) => void; hint: Hint };

const SLOT: Record<Slot, string> = {
  wallL: 'left-[6%] top-[3%] short:top-[2%]',
  floorA: 'left-[6%] top-[33%] short:top-[40%]',
  floorB: 'right-[6%] top-[33%] short:top-[40%]',
};

type ThingProps = {
  slot: Slot;
  label: string;
  onTap: () => void;
  sparkle?: boolean;
  className?: string;
  children: ReactNode;
};

function Thing({ slot, label, onTap, sparkle, className = '', children }: ThingProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onTap}
      className={`absolute z-10 size-12 touch-manipulation ${SLOT[slot]} ${className}`}
    >
      {children}
      {sparkle ? <Sparkle /> : null}
    </button>
  );
}

function Present({ ctx }: { ctx: Ctx }) {
  const { state, dispatch, hint } = ctx;
  const spot = presentSpot(state);
  const { stage, opened } = current(state);
  if (!spot) return null;
  const scale = ['scale-[0.6]', 'scale-100', 'scale-[1.45]', 'scale-[1.2]'][stage];
  const wiggle = stage === 1 ? 'animate-dd-wiggle' : '';
  const gift = HOUSES[state.house].items[opened];
  return (
    <Thing
      slot={spot.slot}
      label="Present"
      onTap={() => dispatch({ type: 'present' })}
      sparkle={hint?.kind === 'present'}
    >
      <span
        className={`block h-full w-full origin-bottom transition-transform duration-300 ${scale} ${wiggle}`}
      >
        <PresentArt stage={stage} />
      </span>
      {stage === 3 ? (
        <ItemIcon
          id={gift}
          className="animate-spl-pop absolute -top-7 left-1/2 h-9 w-9 -translate-x-1/2"
        />
      ) : null}
    </Thing>
  );
}

function Secret({ id, ctx }: { id: SecretId; ctx: Ctx }) {
  const { state, dispatch, hint } = ctx;
  const p = current(state);
  const def = HOUSES[state.house].secrets.find((x) => x.id === id)!;
  const found = p.secrets.includes(id);
  const lit = !def.needs || p.items.includes(def.needs);
  const shake = state.event.kind === 'locked' && id === 'cupboard' && !found;
  return (
    <Thing
      slot={def.spot.slot}
      label={id === 'hole' ? 'Dark corner' : id === 'picture' ? 'Picture' : 'Cupboard'}
      onTap={() => dispatch({ type: 'secret', id })}
      sparkle={hint?.kind === 'secret' && hint.id === id}
      className={shake ? 'animate-shake' : ''}
    >
      <SecretArt id={id} found={found} dark={!lit} />
      {found ? <FoundStar /> : null}
    </Thing>
  );
}

function Machine({ ctx }: { ctx: Ctx }) {
  const { state, dispatch } = ctx;
  const spot = HOUSES[state.house].machine;
  return (
    <Thing slot={spot.slot} label="Ice machine" onTap={() => dispatch({ type: 'machine' })}>
      <MachineArt color={ICE_COLORS[state.iceColor]} cube={state.cube} />
    </Thing>
  );
}

export function RoomThings({ room, ctx }: { room: RoomId; ctx: Ctx }) {
  const def = HOUSES[ctx.state.house];
  const spot = presentSpot(ctx.state);
  return (
    <>
      {spot?.room === room ? <Present ctx={ctx} /> : null}
      {def.machine.room === room ? <Machine ctx={ctx} /> : null}
      {def.secrets
        .filter((x) => x.spot.room === room)
        .map((x) => (
          <Secret key={x.id} id={x.id} ctx={ctx} />
        ))}
    </>
  );
}
