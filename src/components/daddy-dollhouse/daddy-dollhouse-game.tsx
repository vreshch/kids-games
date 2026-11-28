'use client';

import { HouseView } from './house-view';
import { IceBar, TopBar } from './hud';
import { useDollhouse } from './use-dollhouse';

const STARS = [
  ['8%', '10%'],
  ['22%', '4%'],
  ['40%', '12%'],
  ['58%', '5%'],
  ['75%', '11%'],
  ['90%', '6%'],
];

export function DaddyDollhouseGame() {
  const { state, dispatch, hint, onFirstTap } = useDollhouse();
  const ctx = { state, dispatch, hint };
  return (
    <div
      onPointerDown={onFirstTap}
      className={`short:flex-row short:gap-3 short:max-w-3xl short:p-1 relative flex w-full max-w-md flex-1 flex-col items-center gap-3 self-stretch overflow-hidden rounded-3xl px-3 pt-3 pb-4 transition-colors duration-700 select-none ${
        state.night
          ? 'bg-gradient-to-b from-indigo-950 to-slate-900'
          : 'bg-gradient-to-b from-sky-300 to-sky-100'
      }`}
    >
      {state.night
        ? STARS.map(([left, top]) => (
            <span
              key={left}
              className="pointer-events-none absolute text-yellow-100"
              style={{ left, top }}
            >
              ✦
            </span>
          ))
        : null}
      <div className="short:w-32 short:shrink-0 w-full">
        <TopBar state={state} dispatch={dispatch} />
      </div>
      <HouseView ctx={ctx} />
      <div className="short:w-28 short:shrink-0 w-full">
        <IceBar state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
