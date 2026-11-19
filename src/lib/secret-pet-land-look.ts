import { CLOTH, HAIR_COLORS, HATS, SKIN } from './secret-pet-land-data';

export type Look = {
  skin: number;
  hair: number;
  hairColor: number;
  top: number;
  topColor: number;
  bottom: number;
  bottomColor: number;
  shoes: number;
  hat: number;
};
export type LookPart = keyof Look;
export type Kid = 'girl' | 'boy';
export type TabId = 'kid' | LookPart | 'random';

export const HAIR_NAMES = ['Short', 'Long', 'Pigtails', 'Curly', 'Spiky'];
export const TOP_NAMES = ['T-shirt', 'Dress', 'Hoodie'];
export const BOTTOM_NAMES = ['Pants', 'Shorts', 'Skirt'];

export const SWATCHES: Partial<Record<LookPart, readonly string[]>> = {
  skin: SKIN,
  hairColor: HAIR_COLORS,
  topColor: CLOTH,
  bottomColor: CLOTH,
  shoes: CLOTH,
};
export const NAMES: Partial<Record<LookPart, readonly string[]>> = {
  hair: HAIR_NAMES,
  top: TOP_NAMES,
  bottom: BOTTOM_NAMES,
  hat: HATS,
};

export const TABS: readonly { id: TabId; emoji: string; label: string }[] = [
  { id: 'kid', emoji: '👧', label: 'Girl or boy' },
  { id: 'skin', emoji: '🖐️', label: 'Skin' },
  { id: 'hair', emoji: '💇', label: 'Hair' },
  { id: 'hairColor', emoji: '🎨', label: 'Hair color' },
  { id: 'top', emoji: '👕', label: 'Top' },
  { id: 'topColor', emoji: '🌈', label: 'Top color' },
  { id: 'bottom', emoji: '👖', label: 'Bottom' },
  { id: 'bottomColor', emoji: '🩳', label: 'Bottom color' },
  { id: 'shoes', emoji: '👟', label: 'Shoes' },
  { id: 'hat', emoji: '👑', label: 'Hat' },
  { id: 'random', emoji: '🎲', label: 'Surprise me' },
];

export const DEFAULT_LOOK: Look = {
  skin: 0,
  hair: 1,
  hairColor: 1,
  top: 0,
  topColor: 0,
  bottom: 2,
  bottomColor: 4,
  shoes: 6,
  hat: 0,
};

/** The girl / boy switch only swaps the shape of the look; colors stay as picked. */
export const KID_PRESETS: Record<Kid, Pick<Look, 'hair' | 'top' | 'bottom'>> = {
  girl: { hair: 2, top: 1, bottom: 2 },
  boy: { hair: 0, top: 0, bottom: 0 },
};

export const optionCount = (part: LookPart) => (SWATCHES[part] ?? NAMES[part] ?? []).length;

export const setPart = (look: Look, part: LookPart, index: number): Look =>
  index >= 0 && index < optionCount(part) ? { ...look, [part]: index } : look;

export const applyKid = (look: Look, kid: Kid): Look => ({ ...look, ...KID_PRESETS[kid] });

export function kidOf(look: Look): Kid | null {
  const preset = (kid: Kid) => {
    const p = KID_PRESETS[kid];
    return p.hair === look.hair && p.top === look.top && p.bottom === look.bottom;
  };
  return preset('girl') ? 'girl' : preset('boy') ? 'boy' : null;
}

/** `random` returns 0..1 so tests can pin the dice. */
export function randomLook(random: () => number): Look {
  const look = { ...DEFAULT_LOOK };
  for (const part of Object.keys(look) as LookPart[]) {
    look[part] = Math.floor(random() * optionCount(part));
  }
  return look;
}

/** Any number out of range falls back to the default, so old or broken saves still load. */
export function cleanLook(raw: unknown): Look {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const look = { ...DEFAULT_LOOK };
  for (const part of Object.keys(look) as LookPart[]) {
    const value = source[part];
    if (Number.isInteger(value)) look[part] = setPart(look, part, value as number)[part];
  }
  return look;
}
