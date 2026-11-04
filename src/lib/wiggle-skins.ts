export type Skin = { id: string; name: string; colors: readonly string[] };

export const SKINS: readonly Skin[] = [
  { id: 'berry', name: 'Berry', colors: ['#f472b6', '#fbcfe8'] },
  { id: 'ocean', name: 'Ocean', colors: ['#38bdf8', '#0369a1', '#e0f2fe'] },
  { id: 'lime', name: 'Lime', colors: ['#4ade80', '#15803d'] },
  { id: 'sunny', name: 'Sunny', colors: ['#facc15', '#fb923c'] },
  { id: 'grape', name: 'Grape', colors: ['#c084fc', '#6d28d9'] },
  {
    id: 'rainbow',
    name: 'Rainbow',
    colors: ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc'],
  },
  { id: 'tiger', name: 'Tiger', colors: ['#fb923c', '#292524'] },
  { id: 'mint', name: 'Mint', colors: ['#2dd4bf', '#ccfbf1'] },
];

const SKIN_KEY = 'wiggle-snakes-skin';
const BEST_KEY = 'wiggle-snakes-best';

function read(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // private mode: the game still works, it just forgets
  }
}

export function loadSkin() {
  const index = SKINS.findIndex((skin) => skin.id === read(SKIN_KEY));
  return index >= 0 ? index : 0;
}

export function saveSkin(index: number) {
  write(SKIN_KEY, SKINS[index].id);
}

export function loadBest() {
  const best = Number(read(BEST_KEY));
  return Number.isFinite(best) && best > 0 ? Math.round(best) : 0;
}

/** Keeps the longest snake ever grown; returns the (possibly new) record. */
export function recordBest(length: number) {
  const best = Math.max(loadBest(), Math.round(length));
  write(BEST_KEY, String(best));
  return best;
}
