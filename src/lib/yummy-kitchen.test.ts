import { describe, expect, it } from 'vitest';

import {
  addIngredient,
  createKitchen,
  isUnlocked,
  nextRecipe,
  showPlan,
  startRecipe,
  tapBake,
  tapBowl,
  tasteAt,
  tick,
  totalStars,
  type Kitchen,
} from './yummy-kitchen';
import { INGREDIENTS, RECIPES, SECRET_INDEX, SHELF_SIZE } from './yummy-recipes';

const fixed = (value: number) => () => value;
const types = (kitchen: Kitchen) => kitchen.events.map((event) => event.type);
/** Fills the bowl with exactly what the recipe needs. */
const fill = (kitchen: Kitchen) => {
  for (const id of RECIPES[kitchen.recipe].needs) addIngredient(kitchen, id);
};
/** Fills the bowl and bakes with the star dead centre. */
const cook = (kitchen: Kitchen) => {
  fill(kitchen);
  kitchen.star = 0.5;
  tapBake(kitchen);
};

describe('recipes', () => {
  it('use only known ingredients, fit on the shelf, and have unique pictures', () => {
    for (const recipe of RECIPES) {
      expect(recipe.needs.length).toBeLessThanOrEqual(SHELF_SIZE);
      expect(new Set(recipe.needs).size).toBe(recipe.needs.length);
      for (const id of recipe.needs) expect(INGREDIENTS[id]).toBeDefined();
    }
    expect(new Set(RECIPES.map((recipe) => recipe.emoji)).size).toBe(RECIPES.length);
    expect(RECIPES.filter((recipe) => recipe.secret)).toHaveLength(1);
  });

  it('start easy: the first recipe has the slowest star and the widest sweet spot', () => {
    const open = RECIPES.filter((recipe) => !recipe.secret);
    expect(Math.min(...open.map((r) => r.speed))).toBe(open[0].speed);
    expect(Math.max(...open.map((r) => r.sweet))).toBe(open[0].sweet);
  });
});

describe('filling the bowl', () => {
  it('stocks a full shelf that always holds what the recipe needs', () => {
    for (const seed of [0, 0.3, 0.7, 0.99]) {
      const kitchen = createKitchen(fixed(seed));
      expect(kitchen.shelf).toHaveLength(SHELF_SIZE);
      expect(new Set(kitchen.shelf).size).toBe(SHELF_SIZE);
      for (const id of RECIPES[0].needs) expect(kitchen.shelf).toContain(id);
    }
  });

  it('takes the right ingredients in any order and bounces the wrong ones', () => {
    const kitchen = createKitchen(fixed(0.5));
    addIngredient(kitchen, 'chocolate');
    addIngredient(kitchen, 'tomato');
    addIngredient(kitchen, 'chocolate');
    expect(kitchen.bowl).toEqual(['chocolate']);
    expect(types(kitchen)).toEqual(['add', 'yuck', 'yuck']);
    addIngredient(kitchen, 'flour');
    addIngredient(kitchen, 'butter');
    expect(kitchen.phase).toBe('bake');
    expect(types(kitchen).at(-1)).toBe('bake');
    addIngredient(kitchen, 'egg');
    expect(kitchen.bowl).toHaveLength(3);
  });

  it('plans one step at a time and moves on when that step is done', () => {
    const kitchen = createKitchen(fixed(0.5));
    showPlan(kitchen);
    expect(kitchen.hint).toBe('flour');
    addIngredient(kitchen, 'butter');
    expect(kitchen.hint).toBe('flour');
    addIngredient(kitchen, 'flour');
    expect(kitchen.hint).toBeNull();
    showPlan(kitchen);
    expect(kitchen.hint).toBe('chocolate');
    fill(kitchen);
    kitchen.events.length = 0;
    showPlan(kitchen);
    expect(kitchen.events).toHaveLength(0);
  });
});

describe('baking', () => {
  it('slides the star back and forth across the bar', () => {
    const kitchen = createKitchen(fixed(0.5));
    tick(kitchen, 1);
    expect(kitchen.star).toBe(0);
    fill(kitchen);
    tick(kitchen, 1);
    expect(kitchen.star).toBeCloseTo(RECIPES[0].speed);
    tick(kitchen, 2);
    expect(kitchen.star).toBe(1);
    expect(kitchen.starDir).toBe(-1);
    tick(kitchen, 5);
    expect(kitchen.star).toBe(0);
    expect(kitchen.starDir).toBe(1);
  });

  it('gives three stars in the middle, two near it, and a funny miss far away', () => {
    const kitchen = createKitchen(fixed(0.5));
    fill(kitchen);
    kitchen.star = 0.5 + RECIPES[0].sweet * 1.5;
    expect(tasteAt(kitchen)).toBe('good');
    kitchen.star = 0.02;
    expect(tasteAt(kitchen)).toBe('oops');
    tapBake(kitchen);
    expect(kitchen.phase).toBe('oops');
    expect(kitchen.stars[0]).toBe(0);
    tapBake(kitchen);
    tick(kitchen, 1);
    expect(kitchen.phase).toBe('oops');
    tick(kitchen, 1);
    expect(kitchen.phase).toBe('bake');
    expect(types(kitchen).at(-1)).toBe('retry');
    kitchen.star = 0.5;
    tapBake(kitchen);
    expect(kitchen.phase).toBe('done');
    expect(kitchen.stars[0]).toBe(3);
  });

  it('keeps the best stars when a recipe is cooked again', () => {
    const kitchen = createKitchen(fixed(0.5));
    cook(kitchen);
    startRecipe(kitchen, 0);
    fill(kitchen);
    kitchen.star = 0.5 + RECIPES[0].sweet * 1.5;
    tapBake(kitchen);
    expect(kitchen.stars[0]).toBe(3);
    expect(totalStars(kitchen)).toBe(3);
  });
});

describe('the cookbook', () => {
  it('opens the next recipe only after the one before it is made', () => {
    const kitchen = createKitchen(fixed(0.5));
    expect(isUnlocked(kitchen, 1)).toBe(false);
    startRecipe(kitchen, 1);
    expect(kitchen.recipe).toBe(0);
    cook(kitchen);
    expect(isUnlocked(kitchen, 1)).toBe(true);
    expect(nextRecipe(kitchen)).toBe(1);
    startRecipe(kitchen, 1);
    expect(kitchen.recipe).toBe(1);
    expect(kitchen.bowl).toEqual([]);
    expect(kitchen.phase).toBe('pick');
  });

  it('can be cooked from the first recipe to the last, then starts over', () => {
    const kitchen = createKitchen(fixed(0.5));
    for (let i = 0; i < SECRET_INDEX; i++) {
      expect(kitchen.recipe).toBe(i);
      cook(kitchen);
      startRecipe(kitchen, nextRecipe(kitchen));
    }
    expect(kitchen.recipe).toBe(0);
    expect(totalStars(kitchen)).toBe(SECRET_INDEX * 3);
    expect(isUnlocked(kitchen, SECRET_INDEX)).toBe(false);
  });
});

describe('the secret', () => {
  it('hides behind three taps on the empty bowl, and the plan will not tell', () => {
    const kitchen = createKitchen(fixed(0.5));
    tapBowl(kitchen);
    tapBowl(kitchen);
    expect(types(kitchen)).toEqual(['giggle', 'giggle']);
    expect(kitchen.secretFound).toBe(false);
    tapBowl(kitchen);
    expect(kitchen.secretFound).toBe(true);
    expect(kitchen.recipe).toBe(SECRET_INDEX);
    for (const id of RECIPES[SECRET_INDEX].needs) expect(kitchen.shelf).toContain(id);
    showPlan(kitchen);
    expect(kitchen.hint).toBeNull();
    expect(kitchen.events.at(-1)).toEqual({ type: 'plan', ingredient: null });
    cook(kitchen);
    expect(kitchen.stars[SECRET_INDEX]).toBe(3);
    expect(nextRecipe(kitchen)).toBe(0);
  });

  it('does not count taps once something is in the bowl, or after it was found', () => {
    const kitchen = createKitchen(fixed(0.5));
    tapBowl(kitchen);
    tapBowl(kitchen);
    addIngredient(kitchen, 'flour');
    tapBowl(kitchen);
    expect(kitchen.secretFound).toBe(false);
    startRecipe(kitchen, 0);
    tapBowl(kitchen);
    tapBowl(kitchen);
    expect(kitchen.secretFound).toBe(false);
    tapBowl(kitchen);
    kitchen.events.length = 0;
    tapBowl(kitchen);
    expect(kitchen.events).toHaveLength(0);
  });
});
