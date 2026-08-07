'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptySlot, SprunkiCharacter } from '@/components/sprunki-character';
import { type Loop, primeAudio, startVoice } from '@/lib/spranki-audio';
import { CAST, type Character, SLOT_COUNT } from '@/lib/sprunki-cast';

type Drag = { character: Character; x: number; y: number };

const EMPTY_STAGE: (string | null)[] = Array.from({ length: SLOT_COUNT }, () => null);

function characterById(id: string | null) {
  return id ? (CAST.find((c) => c.id === id) ?? null) : null;
}

export function SprankiGame() {
  const [stage, setStage] = useState<(string | null)[]>(EMPTY_STAGE);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const loopsRef = useRef(new Map<number, Loop>());

  const fill = useCallback((slot: number, character: Character) => {
    primeAudio();
    const loops = loopsRef.current;
    loops.get(slot)?.stop();
    loops.set(slot, startVoice(slot, character));
    setStage((current) => current.map((id, i) => (i === slot ? character.id : id)));
    setPicked(null);
  }, []);

  const clear = useCallback((slot: number) => {
    const loops = loopsRef.current;
    loops.get(slot)?.stop();
    loops.delete(slot);
    setStage((current) => current.map((id, i) => (i === slot ? null : id)));
  }, []);

  /** Pointer events cover both a finger and a mouse; pan-x still scrolls the tray. */
  const startDrag = useCallback((character: Character, event: React.PointerEvent) => {
    primeAudio();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ character, x: event.clientX, y: event.clientY });
  }, []);

  const moveDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!drag) return;
      setDrag({ ...drag, x: event.clientX, y: event.clientY });
    },
    [drag]
  );

  const endDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!drag) return;
      const dropped = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-slot]');
      if (dropped) fill(Number(dropped.dataset.slot), drag.character);
      else setPicked(drag.character.id);
      setDrag(null);
    },
    [drag, fill]
  );

  useEffect(() => {
    const loops = loopsRef.current;
    return () => {
      loops.forEach((loop) => loop.stop());
      loops.clear();
    };
  }, []);

  const pickedCharacter = characterById(picked);

  return (
    <div className="mx-auto flex w-full flex-col self-stretch select-none sm:max-w-[80vw]">
      <section className="flex min-h-0 flex-[7] flex-col items-center justify-center gap-3 px-2 py-3">
        <ul className="grid min-h-0 w-full flex-1 grid-cols-4 grid-rows-2 gap-1 sm:grid-cols-7 sm:grid-rows-1 sm:gap-3">
          {stage.map((id, slot) => {
            const character = characterById(id);
            return (
              <li key={slot} className="flex min-h-0 min-w-0 items-center justify-center">
                <button
                  type="button"
                  data-slot={slot}
                  onClick={() =>
                    character ? clear(slot) : pickedCharacter && fill(slot, pickedCharacter)
                  }
                  aria-label={character ? `Remove ${character.name}` : `Empty spot ${slot + 1}`}
                  className={`h-full w-full touch-manipulation rounded-2xl p-1 transition ${
                    character ? 'animate-bob' : ''
                  } ${pickedCharacter && !character ? 'bg-neutral-800/70 ring-2 ring-neutral-500' : ''}`}
                  style={{
                    filter: character ? `drop-shadow(0 0 12px ${character.color})` : 'none',
                  }}
                >
                  {character ? <SprunkiCharacter character={character} singing /> : <EmptySlot />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="min-h-6 text-center text-sm text-neutral-500">
          {pickedCharacter
            ? `tap an empty spot to drop ${pickedCharacter.name}`
            : 'drag someone up here - tap them again to send them home'}
        </p>
      </section>

      <section className="flex min-h-0 flex-[3] border-t border-neutral-800 bg-neutral-900/40">
        <ul className="flex min-h-0 flex-1 items-stretch gap-3 overflow-x-auto px-4 py-2">
          {CAST.map((character) => (
            <li key={character.id} className="flex min-h-0 shrink-0">
              <button
                type="button"
                onPointerDown={(event) => startDrag(character, event)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={() => setDrag(null)}
                aria-label={`${character.name}, ${character.category}`}
                className={`flex h-full w-16 touch-pan-x flex-col items-center justify-center gap-1 rounded-xl p-1 transition ${
                  picked === character.id ? 'bg-neutral-700' : ''
                } ${drag?.character.id === character.id ? 'opacity-40' : ''}`}
              >
                <span className="flex min-h-0 flex-1 items-center">
                  <SprunkiCharacter character={character} />
                </span>
                <span className="truncate text-[10px] text-neutral-400">{character.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 h-28 w-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <SprunkiCharacter character={drag.character} singing />
        </div>
      )}
    </div>
  );
}
