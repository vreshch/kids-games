import type { PointerEvent } from 'react';

import { ITEM_EMOJI, PLACES, type Item, type PlaceId } from '@/lib/secret-pet-land-data';

import { cn } from './cn';

export function TopBar({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex flex-none items-center justify-between bg-[#ff7eb6] px-3 py-1.5 text-white">
      <h1 className="text-[22px] font-extrabold tracking-wide [text-shadow:0_2px_0_#d94f8c]">
        ✨ Secret Pet Land
      </h1>
      <span className="rounded-full bg-white px-3 py-0.5 font-extrabold text-[#d94f8c]">
        🐾 {count}/{total}
      </span>
    </div>
  );
}

type HandProps = { item: Item; onDrop: () => void; onDrag: (e: PointerEvent) => void };

export function Hand({ item, onDrop, onDrag }: HandProps) {
  return (
    <button
      type="button"
      aria-label="Put it down"
      onClick={onDrop}
      onPointerDown={onDrag}
      className="absolute top-2 left-2 z-10 flex touch-none items-center gap-1.5 rounded-2xl border-[3px] border-[#ff7eb6] bg-white px-2.5 py-0.5 text-[26px] font-bold text-[#3a2460]"
    >
      {ITEM_EMOJI[item]}
      <small className="text-[13px]">in hand</small>
    </button>
  );
}

export function CardButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-label="Secret card"
      onClick={onOpen}
      className="absolute top-2 right-2 z-10 h-16 w-[52px] rounded-[10px] border-[3px] border-white bg-[linear-gradient(135deg,#8a5cf6,#ff7eb6)] text-3xl font-extrabold text-white shadow-[0_3px_0_#0003]"
    >
      ?
    </button>
  );
}

export function Bubble({ text, shown }: { text: string; shown: boolean }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'pointer-events-none absolute top-[60px] left-1/2 z-10 max-w-[86%] -translate-x-1/2 rounded-2xl bg-white px-3.5 py-1.5 text-center text-[17px] font-bold text-[#3a2460] shadow-[0_3px_0_#0002] transition-opacity duration-300',
        shown ? 'opacity-100' : 'opacity-0'
      )}
    >
      {text}
    </div>
  );
}

type NavProps = { place: PlaceId; onGo: (place: PlaceId) => void; onBook: () => void };

const NAV_BUTTON = 'flex-1 touch-manipulation pt-1 pb-1.5 text-2xl leading-tight font-bold';

export function PlaceNav({ place, onGo, onBook }: NavProps) {
  return (
    <nav className="flex flex-none border-t-[3px] border-[#eadcff] bg-white text-[#7a6a99]">
      {PLACES.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-current={place === p.id ? 'page' : undefined}
          onClick={() => onGo(p.id)}
          className={cn(NAV_BUTTON, place === p.id && 'bg-[#ffe3f0] text-[#d94f8c]')}
        >
          {p.emoji}
          <span className="block text-xs">{p.name}</span>
        </button>
      ))}
      <button type="button" onClick={onBook} className={NAV_BUTTON}>
        📖<span className="block text-xs">Pets</span>
      </button>
    </nav>
  );
}
