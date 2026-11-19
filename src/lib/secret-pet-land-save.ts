import { PETS, type PetId } from './secret-pet-land-data';
import { cleanLook, type Look } from './secret-pet-land-look';
import { createWorld, type World } from './secret-pet-land-world';

const STORAGE_KEY = 'secret-pet-land';

const isPet = (value: unknown): value is PetId => PETS.some((p) => p.id === value);

/** Only the look and the pets survive a reload; half-done puzzles start fresh. */
export function loadWorld(): World {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createWorld();
    const data = JSON.parse(raw) as { look?: unknown; found?: unknown };
    const found = Array.isArray(data.found) ? [...new Set(data.found.filter(isPet))] : [];
    return createWorld(cleanLook(data.look), found);
  } catch {
    return createWorld();
  }
}

export function saveWorld(world: { look: Look; found: PetId[] }) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ look: world.look, found: world.found })
    );
  } catch {
    // storage may be blocked (private mode) - the game still plays this run
  }
}
