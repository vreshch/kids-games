'use client';

import { useEffect, useRef, useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import { beep, playFound } from '@/lib/secret-pet-land-audio';
import type { PetId } from '@/lib/secret-pet-land-data';
import { dropItem } from '@/lib/secret-pet-land-puzzles';
import { saveWorld } from '@/lib/secret-pet-land-save';
import { allFound, resetWorld, type Outcome, type World } from '@/lib/secret-pet-land-world';

import type { Confetti, Overlay } from './overlays';

const GAME = { game: 'secret-pet-land' };
const BUBBLE_MS = 2600;

const makeConfetti = (): Confetti =>
  Array.from({ length: 26 }, () => ({ left: Math.random() * 100, delay: Math.random() * 0.8 }));

function useBubble() {
  const [bubble, setBubble] = useState({ text: '', shown: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (text: string) => {
    setBubble({ text, shown: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble((b) => ({ ...b, shown: false })), BUBBLE_MS);
  };
  return { bubble, say };
}

/** All game state plus the side effects (sound, save, analytics) of applying an outcome. */
export function usePetLand(initial: World) {
  const [world, setWorld] = useState(initial);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const started = useRef(false);
  const { bubble, say } = useBubble();

  useEffect(() => {
    const hello = setTimeout(
      () => say('Dress up, then look for 7 secret pets! Tap the ? card for a clue.'),
      400
    );
    return () => clearTimeout(hello);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (next: World) => {
    setWorld(next);
    saveWorld(next);
    if (!started.current) trackEvent('game_start', GAME);
    started.current = true;
  };

  const celebrate = (pet: PetId, next: World) => {
    playFound();
    const all = allFound(next);
    setOverlay({ kind: 'found', pet, all, confetti: makeConfetti() });
    if (all) trackEvent('game_complete', GAME);
  };

  const apply = (outcome: Outcome) => {
    commit(outcome.world);
    if (outcome.tone) beep(outcome.tone.freq, outcome.tone.length);
    if (outcome.say) say(outcome.say);
    if (outcome.found) celebrate(outcome.found, outcome.world);
  };

  const closeOverlay = () => {
    setOverlay(null);
    setResetArmed(false);
  };

  const reset = () => {
    if (!resetArmed) return setResetArmed(true);
    commit(resetWorld(world));
    closeOverlay();
  };

  const drop = () => apply(dropItem(world));
  return {
    world,
    overlay,
    setOverlay,
    resetArmed,
    bubble,
    apply,
    commit,
    drop,
    reset,
    closeOverlay,
  };
}
