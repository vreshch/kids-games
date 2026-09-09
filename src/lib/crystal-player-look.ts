export type HatId = 'wizard' | 'crown' | 'bow' | 'none';

export type PlayerLook = { outfit: string; hat: HatId };

export const OUTFITS = [
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

export const DEFAULT_LOOK: PlayerLook = { outfit: OUTFITS[0].color, hat: 'wizard' };

const STORAGE_KEY = 'crystal-rooms-look';

export function loadLook(): PlayerLook {
  if (typeof window === 'undefined') return DEFAULT_LOOK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOOK;
    const parsed = JSON.parse(raw) as Partial<PlayerLook>;
    const outfit = OUTFITS.find((o) => o.color === parsed.outfit)?.color ?? DEFAULT_LOOK.outfit;
    const hat = HATS.find((h) => h.id === parsed.hat)?.id ?? DEFAULT_LOOK.hat;
    return { outfit, hat };
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
