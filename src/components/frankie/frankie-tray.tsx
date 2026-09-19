'use client';

import { FrankieCharacter } from '@/components/frankie/frankie-character';
import { FruitIcon } from '@/components/frankie/fruit-icon';
import { CAST, FRUITS } from '@/lib/frankie-cast';

export type Held = { kind: 'character' | 'fruit'; id: string } | null;

type TrayProps = {
  held: Held;
  dragging: Held;
  onGrab: (held: NonNullable<Held>, event: React.PointerEvent) => void;
  onMove: (event: React.PointerEvent) => void;
  onDrop: (event: React.PointerEvent) => void;
  onCancel: () => void;
};

function isHeld(held: Held, kind: 'character' | 'fruit', id: string) {
  return held?.kind === kind && held.id === id;
}

export function FrankieTray({ held, dragging, onGrab, onMove, onDrop, onCancel }: TrayProps) {
  const grabProps = (kind: 'character' | 'fruit', id: string) => ({
    onPointerDown: (event: React.PointerEvent) => onGrab({ kind, id }, event),
    onPointerMove: onMove,
    onPointerUp: onDrop,
    onPointerCancel: onCancel,
  });

  return (
    <section className="flex min-h-0 flex-[3] flex-col border-t border-neutral-800 bg-neutral-900/40">
      <ul className="flex min-h-0 flex-1 items-stretch gap-3 overflow-x-auto px-4 py-2">
        {CAST.map((character) => (
          <li key={character.id} className="flex min-h-0 shrink-0">
            <button
              type="button"
              {...grabProps('character', character.id)}
              aria-label={`${character.name}, a singer`}
              className={`flex h-full w-16 touch-pan-x flex-col items-center justify-center gap-1 rounded-xl p-1 transition ${
                isHeld(held, 'character', character.id) ? 'bg-neutral-700' : ''
              } ${isHeld(dragging, 'character', character.id) ? 'opacity-40' : ''}`}
            >
              <span className="flex min-h-0 flex-1 items-center">
                <FrankieCharacter character={character} />
              </span>
              <span className="truncate text-[10px] text-neutral-400">{character.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <ul className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-neutral-800 px-4 py-2">
        {FRUITS.map((fruit) => (
          <li key={fruit.id} className="shrink-0">
            <button
              type="button"
              {...grabProps('fruit', fruit.id)}
              aria-label={`${fruit.name}, feed it to a singer`}
              className={`flex h-14 w-14 touch-pan-x items-center justify-center rounded-full p-1 transition ${
                isHeld(held, 'fruit', fruit.id) ? 'bg-neutral-700 ring-2 ring-neutral-400' : ''
              } ${isHeld(dragging, 'fruit', fruit.id) ? 'opacity-40' : ''}`}
            >
              <FruitIcon fruit={fruit} className="h-full w-full" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
