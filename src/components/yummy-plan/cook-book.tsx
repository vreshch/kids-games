'use client';

import { RECIPES } from '@/lib/yummy-recipes';

type Props = {
  stars: number[];
  open: boolean[];
  current: number;
  onCook: (i: number) => void;
};

function label(index: number, open: boolean) {
  if (open) return `Cook ${RECIPES[index].name}`;
  return RECIPES[index].secret ? 'Secret recipe' : 'Locked recipe';
}

/** Every recipe as a small picture: made ones show stars, the rest a lock or a question mark. */
export function CookBook({ stars, open, current, onCook }: Props) {
  return (
    <div className="flex w-full justify-center gap-1" aria-label="Cookbook">
      {RECIPES.map((recipe, i) => (
        <button
          key={recipe.id}
          type="button"
          aria-label={label(i, open[i])}
          disabled={!open[i]}
          onClick={() => onCook(i)}
          className={`flex h-12 min-w-0 flex-1 flex-col items-center justify-center rounded-xl text-xl transition active:scale-90 ${
            i === current ? 'bg-pink-400/30 ring-2 ring-pink-300' : 'bg-neutral-800/70'
          }`}
        >
          <span className={open[i] ? '' : 'opacity-60'}>
            {open[i] ? recipe.emoji : recipe.secret ? '❓' : '🔒'}
          </span>
          <span className="h-2 text-[7px] leading-none">{'⭐'.repeat(stars[i])}</span>
        </button>
      ))}
    </div>
  );
}
