'use client';

import { useEffect, useRef, useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import * as audio from '@/lib/yummy-audio';
import {
  addIngredient,
  createKitchen,
  isUnlocked,
  nextRecipe,
  showPlan,
  startRecipe,
  tapBake,
  tapBowl,
  tick,
  type Kitchen,
  type KitchenEvent,
  type Phase,
  type Taste,
} from '@/lib/yummy-kitchen';
import { INGREDIENTS, RECIPES, type IngredientId } from '@/lib/yummy-recipes';

const GAME = { game: 'yummy-plan' };

/** A short reaction on screen; `n` changes every time so the animation plays again. */
type Flash = { kind: 'add' | 'yuck' | 'giggle' | 'secret'; ingredient?: IngredientId; n: number };

/** A read-only copy of the kitchen for drawing. The live one stays in the hook. */
export type KitchenView = {
  recipe: number;
  phase: Phase;
  bowl: IngredientId[];
  shelf: IngredientId[];
  hint: IngredientId | null;
  stars: number[];
  open: boolean[];
  taste: Taste | null;
  flash: Flash | null;
};

const snapshot = (k: Kitchen, taste: Taste | null, flash: Flash | null): KitchenView => ({
  recipe: k.recipe,
  phase: k.phase,
  bowl: [...k.bowl],
  shelf: [...k.shelf],
  hint: k.hint,
  stars: [...k.stars],
  open: RECIPES.map((_, i) => isUnlocked(k, i)),
  taste,
  flash,
});

/** Sound and speech for one event. */
function react(event: KitchenEvent, kitchen: Kitchen) {
  const food = RECIPES[kitchen.recipe].name;
  if (event.type === 'add') audio.playPlop();
  else if (event.type === 'yuck') {
    audio.playYuck();
    audio.say(`Yuck! Not the ${INGREDIENTS[event.ingredient].name}!`);
  } else if (event.type === 'plan') {
    audio.say(
      event.ingredient
        ? `Add the ${INGREDIENTS[event.ingredient].name}!`
        : 'It is a secret! Try things!'
    );
  } else if (event.type === 'bake') audio.say('Now tap when the star is on the button!');
  else if (event.type === 'giggle') audio.playGiggle();
  else if (event.type === 'secret') {
    audio.playSecret();
    audio.say('You found the secret recipe!');
    trackEvent('secret_found', GAME);
  } else if (event.type === 'taste') tasteSound(event.taste, food, event.stars);
}

function tasteSound(taste: Taste, food: string, stars: number) {
  if (taste === 'oops') {
    audio.playOops();
    return audio.say('Oopsie! Try again!');
  }
  (taste === 'perfect' ? audio.playPerfect : audio.playGood)();
  audio.say(taste === 'perfect' ? `Perfect! Yummy ${food}!` : `Yummy ${food}!`);
  trackEvent('recipe_done', { ...GAME, recipe: food, stars: String(stars) });
}

/** Folds the new events into what the screen shows. */
function reduceView(k: Kitchen, prev: KitchenView | null, events: KitchenEvent[]): KitchenView {
  let taste = k.phase === 'pick' ? null : (prev?.taste ?? null);
  let flash = prev?.flash ?? null;
  const n = (flash?.n ?? 0) + 1;
  for (const event of events) {
    if (event.type === 'taste') taste = event.taste;
    else if (event.type === 'add' || event.type === 'yuck')
      flash = { kind: event.type, ingredient: event.ingredient, n };
    else if (event.type === 'giggle' || event.type === 'secret') flash = { kind: event.type, n };
  }
  return snapshot(k, taste, flash);
}

/** Owns the kitchen, moves time on, and turns taps into game actions. */
export function useKitchen() {
  const kitchenRef = useRef<Kitchen>(null);
  const starRef = useRef<HTMLSpanElement>(null);
  const [view, setView] = useState<KitchenView | null>(null);

  const flush = (k: Kitchen) => {
    const events = k.events.splice(0);
    for (const event of events) react(event, k);
    setView((prev) => reduceView(k, prev, events));
  };
  /** One tap: change the kitchen, then show and sound what happened. */
  const run = (change: (k: Kitchen) => void) => {
    const k = kitchenRef.current;
    if (!k) return;
    change(k);
    flush(k);
  };
  const begin = (k: Kitchen, index: number) => {
    startRecipe(k, index);
    if (k.recipe === index) audio.say(`Let's make a ${RECIPES[index].name}!`);
  };

  const started = view !== null;
  useEffect(() => {
    if (!started) return;
    let last = 0;
    let raf = 0;
    const frame = (now: number) => {
      const k = kitchenRef.current!;
      tick(k, Math.min(0.05, (now - (last || now)) / 1000));
      last = now;
      if (starRef.current) starRef.current.style.left = `${k.star * 100}%`;
      if (k.events.length > 0) {
        const events = k.events.splice(0);
        for (const event of events) react(event, k);
        setView((prev) => reduceView(k, prev, events));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  const start = () => {
    audio.unlockYummyAudio();
    kitchenRef.current = createKitchen();
    setView(snapshot(kitchenRef.current, null, null));
    audio.say(`Let's make a ${RECIPES[0].name}! Tap the plan!`);
    trackEvent('game_start', GAME);
  };

  return {
    view,
    starRef,
    start,
    plan: () => run(showPlan),
    bake: () => run(tapBake),
    bowl: () => run(tapBowl),
    add: (id: IngredientId) => run((k) => addIngredient(k, id)),
    cook: (index: number) => run((k) => begin(k, index)),
    next: () => run((k) => begin(k, nextRecipe(k))),
  };
}
