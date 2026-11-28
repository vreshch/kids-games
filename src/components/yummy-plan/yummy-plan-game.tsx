'use client';

import { INGREDIENTS, RECIPES } from '@/lib/yummy-recipes';

import { BakeBar } from './bake-bar';
import { CookBook } from './cook-book';
import { FoodFace, type Mood } from './food-face';
import { useKitchen, type KitchenView } from './use-kitchen';

const BIG = 'text-[110px] short:text-[80px]';

function StartPanel({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="short:flex-row short:gap-6 flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <span className="bg-gradient-to-r from-pink-300 via-amber-200 to-emerald-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
        Yummy Plan
      </span>
      <FoodFace
        emoji="🍪"
        mood="happy"
        label="A happy cookie"
        className="animate-bob short:text-[72px] text-[110px]"
      />
      <span className="max-w-xs text-base text-neutral-200">
        Tap the plan, fill the bowl, and bake yummy food!
      </span>
      <button
        type="button"
        aria-label="Play"
        onClick={onPlay}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-pink-400/40 transition active:scale-90"
      >
        ▶
      </button>
    </div>
  );
}

/** The bowl while picking, the food once it is baked, or a funny burnt one after a miss. */
function Stage({ view, onBowl }: { view: KitchenView; onBowl: () => void }) {
  const recipe = RECIPES[view.recipe];
  if (view.phase === 'done')
    return (
      <FoodFace
        emoji={recipe.emoji}
        mood="happy"
        label={`Yummy ${recipe.name}`}
        className={`animate-spl-pop ${BIG}`}
      />
    );
  if (view.phase === 'oops')
    return (
      <FoodFace
        emoji={recipe.emoji}
        mood="dizzy"
        label={`Funny burnt ${recipe.name}`}
        className={`animate-shake ${BIG}`}
      />
    );
  const flash = view.flash?.kind;
  const mood: Mood = flash === 'yuck' ? 'yuck' : flash === 'giggle' ? 'giggle' : 'calm';
  return (
    <button type="button" aria-label="Mixing bowl" onClick={onBowl} className="relative">
      <FoodFace
        key={view.flash?.n}
        emoji="🥣"
        mood={view.bowl.length > 0 && !flash ? 'calm' : mood}
        label="Bowl"
        className={`${flash ? 'animate-spl-wobble' : ''} ${BIG}`}
      />
      <span className="absolute inset-x-0 -top-3 flex justify-center gap-1 text-3xl">
        {view.bowl.map((id) => (
          <span key={id} className="animate-spl-pop">
            {INGREDIENTS[id].emoji}
          </span>
        ))}
      </span>
    </button>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-4xl" aria-label={`${count} stars`}>
      {'⭐'.repeat(count)}
    </span>
  );
}

type Game = ReturnType<typeof useKitchen>;
type ControlsProps = Pick<Game, 'plan' | 'add' | 'bake' | 'next' | 'starRef'> & {
  view: KitchenView;
};

function Controls({ view, plan, add, bake, next, starRef }: ControlsProps) {
  const recipe = RECIPES[view.recipe];
  if (view.phase === 'done')
    return (
      <div className="flex flex-col items-center gap-3">
        <Stars count={view.stars[view.recipe] === 0 ? 0 : view.taste === 'perfect' ? 3 : 2} />
        <button
          type="button"
          aria-label="Next recipe"
          onClick={next}
          className="min-h-16 rounded-full bg-emerald-400 px-10 text-3xl font-bold text-neutral-950 shadow-lg shadow-emerald-400/40 transition active:scale-95"
        >
          ▶
        </button>
      </div>
    );
  if (view.phase !== 'pick')
    return (
      <BakeBar
        sweet={recipe.sweet}
        starRef={starRef}
        resting={view.phase === 'oops'}
        onBake={bake}
      />
    );
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        aria-label="Plan"
        onClick={plan}
        className="flex min-h-14 items-center gap-3 rounded-full bg-sky-400 px-6 text-2xl font-bold text-neutral-950 shadow-lg shadow-sky-400/30 transition active:scale-95"
      >
        📋
        <span aria-label={view.hint ? `Plan says ${INGREDIENTS[view.hint].name}` : undefined}>
          {view.hint ? `➜ ${INGREDIENTS[view.hint].emoji}` : '?'}
        </span>
      </button>
      <div className="grid w-full grid-cols-3 gap-2">
        {view.shelf.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`Add ${INGREDIENTS[id].name}`}
            disabled={view.bowl.includes(id)}
            onClick={() => add(id)}
            className={`short:h-14 h-16 rounded-2xl bg-neutral-800 text-4xl transition active:scale-90 disabled:opacity-25 ${
              view.hint === id ? 'ring-4 ring-sky-300' : ''
            }`}
          >
            <span className={view.hint === id ? 'animate-bob inline-block' : 'inline-block'}>
              {INGREDIENTS[id].emoji}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function YummyPlanGame() {
  const { view, starRef, start, cook, bowl, ...actions } = useKitchen();
  if (!view) return <StartPanel onPlay={start} />;
  const recipe = RECIPES[view.recipe];
  return (
    <div className="short:grid short:max-w-3xl short:grid-cols-2 short:grid-rows-[auto_1fr] short:gap-x-6 flex w-full max-w-md flex-1 flex-col items-center gap-3 self-stretch px-3 select-none">
      <div className="short:col-span-2 w-full">
        <CookBook stars={view.stars} open={view.open} current={view.recipe} onCook={cook} />
      </div>
      <div className="short:min-h-0 flex min-h-[190px] w-full flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-b from-pink-950/50 to-amber-950/40 pt-4">
        <span
          className="flex items-center gap-2 text-lg font-semibold text-pink-100"
          aria-live="polite"
        >
          {view.phase === 'done' ? 'Yummy!' : view.phase === 'oops' ? 'Oopsie!' : "Let's make"}
          <span className="text-3xl">{recipe.emoji}</span>
        </span>
        <Stage view={view} onBowl={bowl} />
      </div>
      <div className="short:min-h-0 flex min-h-56 w-full flex-col items-center justify-center pb-3">
        <Controls view={view} starRef={starRef} {...actions} />
      </div>
    </div>
  );
}
