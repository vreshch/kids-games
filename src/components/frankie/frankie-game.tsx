'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptySlot, FrankieCharacter } from '@/components/frankie/frankie-character';
import { FruitIcon } from '@/components/frankie/fruit-icon';
import { FrankieTray, type Held } from '@/components/frankie/frankie-tray';
import { type Loop, primeAudio, startVoice } from '@/lib/beat-audio';
import {
  characterById,
  fruitById,
  SLOT_COUNT,
  type Character,
  type Fruit,
  voiceOf,
} from '@/lib/frankie-cast';

type Occupant = { characterId: string; fruitId: string | null };

const EMPTY_STAGE: (Occupant | null)[] = Array.from({ length: SLOT_COUNT }, () => null);

export function FrankieGame() {
  const [stage, setStage] = useState<(Occupant | null)[]>(EMPTY_STAGE);
  const [drag, setDrag] = useState<{ held: NonNullable<Held>; x: number; y: number } | null>(null);
  const [held, setHeld] = useState<Held>(null);
  /** A tap fires pointerup before React commits the drag state, so the hand lives in a ref too. */
  const handRef = useRef<Held>(null);
  const loopsRef = useRef(new Map<number, Loop>());

  const sing = useCallback((slot: number, character: Character, fruit: Fruit | null) => {
    const loops = loopsRef.current;
    loops.get(slot)?.stop();
    loops.set(slot, startVoice(slot, voiceOf(character, fruit)));
  }, []);

  const place = useCallback(
    (slot: number, character: Character) => {
      primeAudio();
      sing(slot, character, null);
      setStage((current) =>
        current.map((spot, i) => (i === slot ? { characterId: character.id, fruitId: null } : spot))
      );
      setHeld(null);
    },
    [sing]
  );

  const feed = useCallback(
    (slot: number, fruit: Fruit) => {
      primeAudio();
      setStage((current) =>
        current.map((spot, i) => {
          if (i !== slot || !spot) return spot;
          const character = characterById(spot.characterId);
          if (character) sing(slot, character, fruit);
          return { ...spot, fruitId: fruit.id };
        })
      );
      setHeld(null);
    },
    [sing]
  );

  const sendHome = useCallback((slot: number) => {
    const loops = loopsRef.current;
    loops.get(slot)?.stop();
    loops.delete(slot);
    setStage((current) => current.map((spot, i) => (i === slot ? null : spot)));
  }, []);

  /** A tap on a slot means whatever the hand is holding - or "go home" when it is empty. */
  const tapSlot = useCallback(
    (slot: number) => {
      const occupant = stage[slot];
      if (held?.kind === 'fruit' && occupant) {
        const fruit = fruitById(held.id);
        if (fruit) feed(slot, fruit);
        return;
      }
      if (held?.kind === 'character' && !occupant) {
        const character = characterById(held.id);
        if (character) place(slot, character);
        return;
      }
      if (occupant) sendHome(slot);
    },
    [feed, held, place, sendHome, stage]
  );

  /** Pointer events cover both a finger and a mouse; pan-x still scrolls the tray. */
  const grab = useCallback((next: NonNullable<Held>, event: React.PointerEvent) => {
    primeAudio();
    event.currentTarget.setPointerCapture(event.pointerId);
    handRef.current = next;
    setDrag({ held: next, x: event.clientX, y: event.clientY });
  }, []);

  const moveDrag = useCallback((event: React.PointerEvent) => {
    setDrag((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : null));
  }, []);

  const dropDrag = useCallback(
    (event: React.PointerEvent) => {
      const hand = handRef.current;
      if (!hand) return;
      handRef.current = null;
      setDrag(null);
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-slot]');
      const slot = target ? Number(target.dataset.slot) : -1;
      const occupant = slot >= 0 ? stage[slot] : null;
      if (hand.kind === 'character' && target && !occupant) {
        const character = characterById(hand.id);
        if (character) place(slot, character);
        return;
      }
      if (hand.kind === 'fruit' && occupant) {
        const fruit = fruitById(hand.id);
        if (fruit) feed(slot, fruit);
        return;
      }
      setHeld(hand);
    },
    [feed, place, stage]
  );

  useEffect(() => {
    const loops = loopsRef.current;
    return () => {
      loops.forEach((loop) => loop.stop());
      loops.clear();
    };
  }, []);

  const heldFruit = held?.kind === 'fruit' ? fruitById(held.id) : null;
  const heldCharacter = held?.kind === 'character' ? characterById(held.id) : null;
  const dragCharacter = drag?.held.kind === 'character' ? characterById(drag.held.id) : null;
  const dragFruit = drag?.held.kind === 'fruit' ? fruitById(drag.held.id) : null;

  return (
    <div className="mx-auto flex w-full flex-col self-stretch select-none sm:max-w-[80vw]">
      <section className="flex min-h-0 flex-[7] flex-col items-center justify-center gap-3 px-2 py-3">
        <ul className="grid min-h-0 w-full flex-1 grid-cols-3 grid-rows-2 gap-1 sm:grid-cols-6 sm:grid-rows-1 sm:gap-3">
          {stage.map((spot, slot) => {
            const character = characterById(spot?.characterId);
            const fruit = fruitById(spot?.fruitId);
            const wanted = (heldCharacter && !spot) || (heldFruit && spot);
            return (
              <li key={slot} className="flex min-h-0 min-w-0 items-center justify-center">
                <button
                  type="button"
                  data-slot={slot}
                  onClick={() => tapSlot(slot)}
                  aria-label={
                    character
                      ? heldFruit
                        ? `Feed ${heldFruit.name} to ${character.name}`
                        : `Send ${character.name} home`
                      : `Empty spot ${slot + 1}`
                  }
                  className={`h-full w-full touch-manipulation rounded-2xl p-1 transition ${
                    character ? 'animate-bob' : ''
                  } ${wanted ? 'bg-neutral-800/70 ring-2 ring-neutral-500' : ''}`}
                  style={{
                    filter: character
                      ? `drop-shadow(0 0 12px ${fruit ? fruit.color : character.color})`
                      : 'none',
                  }}
                >
                  {character ? (
                    <FrankieCharacter character={character} fruit={fruit} singing />
                  ) : (
                    <EmptySlot />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="min-h-6 text-center text-sm text-neutral-500">
          {heldFruit
            ? `tap a singer to feed them the ${heldFruit.name.toLowerCase()}`
            : heldCharacter
              ? `tap an empty spot to drop ${heldCharacter.name}`
              : 'drag singers up here, then drop a fruit on one and watch'}
        </p>
      </section>

      <FrankieTray
        held={held}
        dragging={drag?.held ?? null}
        onGrab={grab}
        onMove={moveDrag}
        onDrop={dropDrag}
        onCancel={() => {
          handRef.current = null;
          setDrag(null);
        }}
      />

      {drag && (
        <div
          className="pointer-events-none fixed z-50 h-28 w-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          {dragCharacter && <FrankieCharacter character={dragCharacter} singing />}
          {dragFruit && <FruitIcon fruit={dragFruit} className="h-full w-full" />}
        </div>
      )}
    </div>
  );
}
