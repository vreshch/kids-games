import type { Item } from './secret-pet-land-data';
import { tap, type Target } from './secret-pet-land-puzzles';
import { hasPet, holding, withPuzzles, type Outcome, type World } from './secret-pet-land-world';

/** Where a drag can start: a scene thing that hands out an item, or the item already in hand. */
export type DragSource = 'seeds' | 'water' | 'soil' | 'basket' | 'mushroom' | 'hand';

export const DROP_TARGET: Record<Item, Target> = {
  seeds: 'soil',
  water: 'soil',
  cabbage: 'bunny',
  bread: 'bubbles',
  mushroom: 'log',
};

const HINTS: Record<Item, string> = {
  seeds: 'Seeds go in the empty soil!',
  water: 'Plant the seeds first, then water the soil!',
  cabbage: 'The hungry bunny wants this cabbage!',
  bread: 'Bread is for the bubbles in the pond!',
  mushroom: 'Somebody in the log loves mushrooms!',
};

const BOOP = { freq: 180, length: 0.12 };
const TARGETS = new Set<string>(Object.values(DROP_TARGET));

export const asTarget = (value: string | null | undefined): Target | null =>
  value && TARGETS.has(value) ? (value as Target) : null;

export function dragItem(world: World, source: DragSource): Item | null {
  if (source === 'hand') return world.hand;
  if (source === 'soil') return world.puzzles.soil === 2 ? 'cabbage' : null;
  if (source === 'basket') return 'bread';
  return source;
}

export function canDrop(world: World, item: Item, target: Target): boolean {
  if (DROP_TARGET[item] !== target) return false;
  if (item === 'seeds') return world.puzzles.soil === 0;
  if (item === 'water') return world.puzzles.soil === 1;
  if (item === 'cabbage') return world.puzzles.rockOpen && !hasPet(world, 'bunny');
  return true;
}

function pickUp(world: World, source: DragSource, item: Item): World {
  if (source === 'hand') return world;
  const picked = holding(world, item);
  return source === 'soil' ? withPuzzles(picked, { soil: 0 }) : picked;
}

/** A drag from the scene never changes what is in hand; a bad drop changes nothing at all. */
export function dropDragged(
  world: World,
  source: DragSource,
  target: Target | null,
  now: number
): Outcome {
  const item = dragItem(world, source);
  if (!item) return { world };
  if (!target || !canDrop(world, item, target)) return { world, say: HINTS[item], tone: BOOP };
  const outcome = tap(pickUp(world, source, item), target, { now });
  if (source === 'hand') return outcome;
  return { ...outcome, world: holding(outcome.world, world.hand) };
}
