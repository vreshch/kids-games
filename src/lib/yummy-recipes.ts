/** Everything on the shelf. Each one is a picture a child knows without reading. */
export const INGREDIENTS = {
  flour: { emoji: '🌾', name: 'flour' },
  egg: { emoji: '🥚', name: 'egg' },
  butter: { emoji: '🧈', name: 'butter' },
  milk: { emoji: '🥛', name: 'milk' },
  sugar: { emoji: '🍬', name: 'sugar' },
  chocolate: { emoji: '🍫', name: 'chocolate' },
  strawberry: { emoji: '🍓', name: 'strawberry' },
  lemon: { emoji: '🍋', name: 'lemon' },
  tomato: { emoji: '🍅', name: 'tomato' },
  cheese: { emoji: '🧀', name: 'cheese' },
  bread: { emoji: '🍞', name: 'bread' },
  ice: { emoji: '🧊', name: 'ice' },
} as const;

export type IngredientId = keyof typeof INGREDIENTS;
export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as IngredientId[];

export type Recipe = {
  id: string;
  name: string;
  emoji: string;
  needs: IngredientId[];
  /** How fast the star slides, in trips across the bar per second. */
  speed: number;
  /** Half the width of the "just right" spot, as a share of the bar. */
  sweet: number;
  secret?: boolean;
};

/** In cooking order: each one made unlocks the next. The last one is hidden. */
export const RECIPES: Recipe[] = [
  {
    id: 'cookie',
    name: 'cookie',
    emoji: '🍪',
    needs: ['flour', 'butter', 'chocolate'],
    speed: 0.45,
    sweet: 0.2,
  },
  {
    id: 'pancakes',
    name: 'pancakes',
    emoji: '🥞',
    needs: ['flour', 'egg', 'milk'],
    speed: 0.5,
    sweet: 0.18,
  },
  {
    id: 'cupcake',
    name: 'cupcake',
    emoji: '🧁',
    needs: ['flour', 'egg', 'strawberry'],
    speed: 0.55,
    sweet: 0.16,
  },
  {
    id: 'pizza',
    name: 'pizza',
    emoji: '🍕',
    needs: ['flour', 'tomato', 'cheese'],
    speed: 0.6,
    sweet: 0.15,
  },
  {
    id: 'ice-cream',
    name: 'ice cream',
    emoji: '🍦',
    needs: ['milk', 'strawberry', 'ice'],
    speed: 0.65,
    sweet: 0.14,
  },
  {
    id: 'sandwich',
    name: 'sandwich',
    emoji: '🥪',
    needs: ['bread', 'cheese', 'tomato'],
    speed: 0.7,
    sweet: 0.13,
  },
  {
    id: 'donut',
    name: 'donut',
    emoji: '🍩',
    needs: ['flour', 'milk', 'sugar', 'chocolate'],
    speed: 0.8,
    sweet: 0.12,
  },
  {
    id: 'cake',
    name: 'birthday cake',
    emoji: '🎂',
    needs: ['flour', 'egg', 'butter', 'strawberry'],
    speed: 0.9,
    sweet: 0.11,
  },
  {
    id: 'lollipop',
    name: 'rainbow lollipop',
    emoji: '🍭',
    needs: ['sugar', 'strawberry', 'lemon'],
    speed: 0.7,
    sweet: 0.14,
    secret: true,
  },
];

export const SECRET_INDEX = RECIPES.findIndex((recipe) => recipe.secret);
export const SHELF_SIZE = 6;
