import { PETS, type Item, type PetId, type PlaceId } from './secret-pet-land-data';
import { DEFAULT_LOOK, type Look } from './secret-pet-land-look';

export type PadSize = 's' | 'm' | 'l';

export type Puzzles = {
  gift: number;
  soil: 0 | 1 | 2;
  rockTaps: number[];
  rockOpen: boolean;
  hay: number;
  egg: number;
  pads: PadSize[];
  night: boolean;
  bush: number;
};

export type World = { look: Look; found: PetId[]; hand: Item | null; puzzles: Puzzles };

/** What the screen should do after a tap: speak, beep, or celebrate a pet. */
export type Outcome = {
  world: World;
  say?: string;
  tone?: { freq: number; length?: number };
  found?: PetId;
};

export const PET_COUNT = PETS.length;
export const PAD_ORDER: readonly PadSize[] = ['s', 'm', 'l'];
export const ROCK_TAPS = 5;
export const ROCK_WINDOW_MS = 2000;

export const freshPuzzles = (): Puzzles => ({
  gift: 0,
  soil: 0,
  rockTaps: [],
  rockOpen: false,
  hay: 0,
  egg: 0,
  pads: [],
  night: false,
  bush: 0,
});

export const createWorld = (look: Look = DEFAULT_LOOK, found: PetId[] = []): World => ({
  look,
  found,
  hand: null,
  puzzles: freshPuzzles(),
});

/** Start over keeps nothing, not even the outfit. */
export const resetWorld = (): World => createWorld();

export const hasPet = (world: World, id: PetId) => world.found.includes(id);
export const allFound = (world: World) => world.found.length >= PET_COUNT;

export function clueFor(world: World, place: PlaceId): string {
  const pet = PETS.find((p) => p.place === place && !hasPet(world, p.id));
  return pet ? pet.hint : 'No more secrets here! Try another place.';
}

export function findPet(world: World, id: PetId): Outcome {
  if (hasPet(world, id)) return { world };
  return { world: { ...world, found: [...world.found, id], hand: null }, found: id };
}

export const withPuzzles = (world: World, patch: Partial<Puzzles>): World => ({
  ...world,
  puzzles: { ...world.puzzles, ...patch },
});

export const holding = (world: World, hand: Item | null): World => ({ ...world, hand });

/** The mushroom shows until it is in hand, so dropping it never loses it. */
export const mushroomVisible = (world: World) =>
  world.puzzles.bush >= 3 && world.hand !== 'mushroom' && !hasPet(world, 'hedgehog');

export const eggVisible = (world: World) => world.puzzles.hay >= 3 && !hasPet(world, 'chick');
