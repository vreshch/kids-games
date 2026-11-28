import {
  INGREDIENT_IDS,
  RECIPES,
  SECRET_INDEX,
  SHELF_SIZE,
  type IngredientId,
} from './yummy-recipes';

/** pick: fill the bowl. bake: tap at the right moment. oops: a funny miss. done: yummy! */
export type Phase = 'pick' | 'bake' | 'oops' | 'done';
export type Taste = 'perfect' | 'good' | 'oops';

export type KitchenEvent =
  | { type: 'plan'; ingredient: IngredientId | null }
  | { type: 'add' | 'yuck'; ingredient: IngredientId }
  | { type: 'bake' | 'giggle' | 'secret' | 'retry' }
  | { type: 'taste'; taste: Taste; stars: number };

/** The whole game. Only the functions in this file change it. */
export type Kitchen = {
  recipe: number;
  phase: Phase;
  bowl: IngredientId[];
  shelf: IngredientId[];
  /** The ingredient the plan is pointing at, until it is added. */
  hint: IngredientId | null;
  /** Where the star is on the bar, 0 to 1, and which way it slides. */
  star: number;
  starDir: 1 | -1;
  oopsLeft: number;
  /** Best stars per recipe; 0 means not made yet. */
  stars: number[];
  bowlTaps: number;
  secretFound: boolean;
  events: KitchenEvent[];
  rng: () => number;
};

const OOPS_PAUSE = 1.6;
/** The "good" spot is this many times wider than the "perfect" one. */
export const GOOD_ZONE = 1.8;
const SECRET_TAPS = 3;

function shuffled<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The recipe's own ingredients plus a few others, mixed up. */
function stockShelf(needs: IngredientId[], rng: () => number): IngredientId[] {
  const extras = shuffled(
    INGREDIENT_IDS.filter((id) => !needs.includes(id)),
    rng
  );
  return shuffled([...needs, ...extras.slice(0, SHELF_SIZE - needs.length)], rng);
}

export function startRecipe(kitchen: Kitchen, index: number) {
  if (!isUnlocked(kitchen, index)) return;
  Object.assign(kitchen, {
    recipe: index,
    phase: 'pick',
    bowl: [],
    shelf: stockShelf(RECIPES[index].needs, kitchen.rng),
    hint: null,
    star: 0,
    starDir: 1,
    oopsLeft: 0,
    bowlTaps: 0,
  });
}

export function createKitchen(rng: () => number = Math.random): Kitchen {
  const kitchen: Kitchen = {
    recipe: 0,
    phase: 'pick',
    bowl: [],
    shelf: [],
    hint: null,
    star: 0,
    starDir: 1,
    oopsLeft: 0,
    stars: RECIPES.map(() => 0),
    bowlTaps: 0,
    secretFound: false,
    events: [],
    rng,
  };
  startRecipe(kitchen, 0);
  return kitchen;
}

/** A recipe opens when the one before it was made; the secret one when it was found. */
export function isUnlocked(kitchen: Kitchen, index: number) {
  if (index === SECRET_INDEX) return kitchen.secretFound;
  return index === 0 || kitchen.stars[index - 1] > 0;
}

const missing = (kitchen: Kitchen) =>
  RECIPES[kitchen.recipe].needs.filter((id) => !kitchen.bowl.includes(id));

/** The Plan button: shows the next thing to add. The secret recipe keeps its secret. */
export function showPlan(kitchen: Kitchen) {
  if (kitchen.phase !== 'pick') return;
  kitchen.hint = RECIPES[kitchen.recipe].secret ? null : (missing(kitchen)[0] ?? null);
  kitchen.events.push({ type: 'plan', ingredient: kitchen.hint });
}

/** A right ingredient lands in the bowl in any order; a wrong one bounces out. */
export function addIngredient(kitchen: Kitchen, ingredient: IngredientId) {
  if (kitchen.phase !== 'pick') return;
  if (!missing(kitchen).includes(ingredient)) {
    kitchen.events.push({ type: 'yuck', ingredient });
    return;
  }
  kitchen.bowl.push(ingredient);
  kitchen.bowlTaps = 0;
  if (kitchen.hint === ingredient) kitchen.hint = null;
  kitchen.events.push({ type: 'add', ingredient });
  if (missing(kitchen).length > 0) return;
  kitchen.phase = 'bake';
  kitchen.events.push({ type: 'bake' });
}

/** Three taps on the empty bowl: it giggles twice, then shares the secret recipe. */
export function tapBowl(kitchen: Kitchen) {
  if (kitchen.phase !== 'pick' || kitchen.bowl.length > 0 || kitchen.secretFound) return;
  kitchen.bowlTaps += 1;
  if (kitchen.bowlTaps < SECRET_TAPS) {
    kitchen.events.push({ type: 'giggle' });
    return;
  }
  kitchen.secretFound = true;
  kitchen.events.push({ type: 'secret' });
  startRecipe(kitchen, SECRET_INDEX);
}

/** How good a tap would be right now: the middle of the bar is just right. */
export function tasteAt(kitchen: Kitchen): Taste {
  const off = Math.abs(kitchen.star - 0.5);
  const sweet = RECIPES[kitchen.recipe].sweet;
  if (off <= sweet) return 'perfect';
  return off <= sweet * GOOD_ZONE ? 'good' : 'oops';
}

/** The Bake button: a good tap finishes the food; a miss is funny and you try again. */
export function tapBake(kitchen: Kitchen) {
  if (kitchen.phase !== 'bake') return;
  const taste = tasteAt(kitchen);
  const stars = taste === 'perfect' ? 3 : taste === 'good' ? 2 : 0;
  kitchen.events.push({ type: 'taste', taste, stars });
  if (taste === 'oops') {
    kitchen.phase = 'oops';
    kitchen.oopsLeft = OOPS_PAUSE;
    return;
  }
  kitchen.phase = 'done';
  kitchen.stars[kitchen.recipe] = Math.max(kitchen.stars[kitchen.recipe], stars);
}

function slideStar(kitchen: Kitchen, dt: number) {
  kitchen.star += kitchen.starDir * RECIPES[kitchen.recipe].speed * dt;
  if (kitchen.star >= 1 || kitchen.star <= 0) {
    kitchen.star = Math.min(1, Math.max(0, kitchen.star));
    kitchen.starDir = kitchen.starDir === 1 ? -1 : 1;
  }
}

/** Time passing: the star slides while baking, and a miss clears by itself. */
export function tick(kitchen: Kitchen, dt: number) {
  if (kitchen.phase === 'bake') slideStar(kitchen, dt);
  if (kitchen.phase !== 'oops') return;
  kitchen.oopsLeft -= dt;
  if (kitchen.oopsLeft > 0) return;
  kitchen.phase = 'bake';
  kitchen.events.push({ type: 'retry' });
}

/** The next recipe that is open after this one, or the first when all are made. */
export function nextRecipe(kitchen: Kitchen) {
  const order = RECIPES.map((_, i) => (kitchen.recipe + 1 + i) % RECIPES.length);
  return order.find((i) => isUnlocked(kitchen, i) && kitchen.stars[i] === 0) ?? 0;
}

export const totalStars = (kitchen: Kitchen) => kitchen.stars.reduce((sum, n) => sum + n, 0);
