import {
  CHARS,
  CHAR_NAMES,
  HOUSES,
  ICE_COLORS,
  type CharId,
  type RoomId,
  sideOf,
} from '@/lib/dollhouse-data';

import { CharArt } from './characters';
import { Cube } from './icons';
import { RoomThings, type Ctx } from './room-things';

const CONFETTI = ['#f43f5e', '#facc15', '#22d3ee', '#a78bfa', '#4ade80', '#fb923c'];

function Character({ id, ctx, room }: { id: CharId; ctx: Ctx; room: RoomId }) {
  const { state, dispatch } = ctx;
  const selected = state.selected === id;
  const cheering = state.cheer?.id === id;
  const walking = state.lift.phase === 'walk' && state.lift.rider === id;
  const arriving = state.moved?.id === id;
  const dx = walking ? (sideOf(room) === 0 ? 70 : -70) : (state.moved?.from ?? 0) * 70;
  const anim = walking
    ? 'animate-dd-walk-out'
    : cheering
      ? 'animate-dd-cheer'
      : state.night
        ? 'animate-dd-dance'
        : arriving
          ? 'animate-dd-hop-in'
          : '';
  const treat = state.treats[id];
  return (
    <button
      type="button"
      aria-label={CHAR_NAMES[id]}
      aria-pressed={selected}
      onClick={() => dispatch({ type: 'select', id })}
      className="relative z-20 h-14 w-12 shrink-0 touch-manipulation"
      style={{ margin: '0 -3px' }}
    >
      <span
        key={`${arriving ? state.moved?.n : 0}-${cheering ? state.cheer?.n : 0}`}
        className={`block h-full w-full ${selected ? '-translate-y-1' : ''} ${anim}`}
        style={{ ['--dx' as string]: `${dx}px` }}
      >
        <CharArt id={id} happy={cheering || state.night || selected} />
        {treat ? (
          <Cube color={ICE_COLORS[treat]} className="absolute top-6 -right-1 h-4 w-4" />
        ) : null}
      </span>
      {selected ? (
        <span className="pointer-events-none absolute -inset-1 rounded-2xl border-4 border-amber-300 bg-amber-200/30 shadow-[0_0_14px_4px_rgba(252,211,77,0.9)]" />
      ) : null}
    </button>
  );
}

function Lights({ night }: { night: boolean }) {
  if (!night) return null;
  return (
    <>
      <span className="pointer-events-none absolute inset-0 bg-indigo-950/45" />
      <span className="pointer-events-none absolute top-1 left-1/2 size-16 -translate-x-1/2 rounded-full bg-amber-200/60 blur-lg" />
      <span className="animate-dd-flash pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#f472b6,transparent_45%),radial-gradient(circle_at_80%_60%,#22d3ee,transparent_45%)] mix-blend-screen" />
      {CONFETTI.map((color, i) => (
        <span
          key={color}
          className="animate-dd-fall pointer-events-none absolute z-30 h-2 w-1.5"
          style={{ background: color, left: `${12 + i * 15}%`, animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </>
  );
}

export function Room({ room, ctx }: { room: RoomId; ctx: Ctx }) {
  const { state, dispatch } = ctx;
  const def = HOUSES[state.house];
  const here = CHARS.filter((id) => state.at[id] === room);
  return (
    <div
      className="relative overflow-hidden rounded-md"
      style={{ background: def.roomColors[room] }}
    >
      <button
        type="button"
        aria-label={def.roomNames[room]}
        onClick={() => dispatch({ type: 'room', room })}
        className="absolute inset-0 touch-manipulation"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-black/15" />
      <span className="pointer-events-none absolute top-0 left-1/2 h-3 w-px bg-black/40" />
      <span className="pointer-events-none absolute top-3 left-1/2 size-3 -translate-x-1/2 rounded-full bg-amber-300" />
      <RoomThings room={room} ctx={ctx} />
      <button
        type="button"
        aria-label="Window"
        aria-pressed={state.night}
        onClick={() => dispatch({ type: 'night' })}
        className="absolute top-[3%] right-[6%] z-10 size-12 touch-manipulation rounded-md border-4 border-white/90 transition-colors duration-500"
        style={{ background: state.night ? '#1e1b4b' : '#7dd3fc' }}
      >
        <span className="text-sm leading-none text-yellow-200">{state.night ? '☾ ✦' : ''}</span>
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 bg-white/90" />
        <span className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 bg-white/90" />
      </button>
      <div className="pointer-events-none absolute inset-x-0 bottom-[2%] z-20 flex items-end justify-center">
        {here.map((id) => (
          <span key={id} className="pointer-events-auto">
            <Character id={id} ctx={ctx} room={room} />
          </span>
        ))}
      </div>
      <Lights night={state.night} />
    </div>
  );
}
