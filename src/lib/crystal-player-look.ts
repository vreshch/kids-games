export type HatId = 'wizard' | 'crown' | 'bow' | 'none';
export type OutfitId = 'dress' | 'shirt' | 'cape';

export type PlayerLook = { outfit: OutfitId; color: string; hat: HatId };

export const OUTFIT_STYLES = [
  { id: 'dress', emoji: '👗', name: 'Dress' },
  { id: 'shirt', emoji: '👕', name: 'Shirt' },
  { id: 'cape', emoji: '🦸', name: 'Cape' },
] as const satisfies readonly { id: OutfitId; emoji: string; name: string }[];

export const OUTFIT_COLORS = [
  { color: '#f472b6', name: 'Pink' },
  { color: '#38bdf8', name: 'Blue' },
  { color: '#4ade80', name: 'Green' },
  { color: '#c084fc', name: 'Purple' },
  { color: '#f59e0b', name: 'Orange' },
  { color: '#f87171', name: 'Red' },
] as const;

export const HATS = [
  { id: 'wizard', emoji: '🧙', name: 'Wizard' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'bow', emoji: '🎀', name: 'Bow' },
  { id: 'none', emoji: '✨', name: 'No hat' },
] as const satisfies readonly { id: HatId; emoji: string; name: string }[];

export const DEFAULT_LOOK: PlayerLook = {
  outfit: 'dress',
  color: OUTFIT_COLORS[0].color,
  hat: 'wizard',
};

const STORAGE_KEY = 'crystal-rooms-look';

export function loadLook(): PlayerLook {
  if (typeof window === 'undefined') return DEFAULT_LOOK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOOK;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // v1 stored the color under "outfit"
    const legacyColor = OUTFIT_COLORS.find((c) => (c.color as string) === parsed.outfit)?.color;
    const outfit = OUTFIT_STYLES.find((o) => o.id === parsed.outfit)?.id ?? DEFAULT_LOOK.outfit;
    const color =
      OUTFIT_COLORS.find((c) => c.color === parsed.color)?.color ??
      legacyColor ??
      DEFAULT_LOOK.color;
    const hat = HATS.find((h) => h.id === parsed.hat)?.id ?? DEFAULT_LOOK.hat;
    return { outfit, color, hat };
  } catch {
    return DEFAULT_LOOK;
  }
}

export function saveLook(look: PlayerLook) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(look));
  } catch {
    // storage may be unavailable (private mode) - the pick still applies this run
  }
}
