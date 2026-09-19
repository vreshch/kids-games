import type { Kind, Voice } from '@/lib/beat-audio';

export type Face = 'fangs' | 'wobble' | 'stare' | 'grin';

export type Character = {
  id: string;
  name: string;
  color: string;
  kind: Kind;
  frequency: number;
  /** 16 steps of one bar; 0 rests, other values are semitones above `frequency`. */
  pattern: number[];
};

export type Fruit = {
  id: string;
  name: string;
  color: string;
  seed: string;
  /** Semitones the fruit drops (or lifts) whoever eats it. */
  detune: number;
  /** Steps the fed character starts hitting on top of its own loop. */
  extra: number[];
  /** Some fruits change the voice shape entirely. */
  kind?: Kind;
  face: Face;
};

const x = 1;
const o = 0;

/** The eight singers. Plain and friendly until they eat something. */
export const CAST: Character[] = [
  {
    id: 'bam',
    name: 'Bam',
    color: '#f97316',
    kind: 'kick',
    frequency: 110,
    pattern: [x, o, o, o, x, o, o, o, x, o, o, o, x, o, o, o],
  },
  {
    id: 'tap',
    name: 'Tap',
    color: '#ef4444',
    kind: 'snare',
    frequency: 220,
    pattern: [o, o, o, o, x, o, o, o, o, o, o, o, x, o, x, o],
  },
  {
    id: 'tik',
    name: 'Tik',
    color: '#94a3b8',
    kind: 'hat',
    frequency: 440,
    pattern: [x, o, x, o, x, o, x, o, x, o, x, o, x, o, x, x],
  },
  {
    id: 'boop',
    name: 'Boop',
    color: '#84cc16',
    kind: 'blip',
    frequency: 196,
    pattern: [o, o, x, x, o, o, o, o, o, o, x, x, o, o, o, o],
  },
  {
    id: 'zizz',
    name: 'Zizz',
    color: '#38bdf8',
    kind: 'hat',
    frequency: 880,
    pattern: [o, o, o, x, o, o, o, x, o, o, o, x, x, o, x, o],
  },
  {
    id: 'lulu',
    name: 'Lulu',
    color: '#facc15',
    kind: 'note',
    frequency: 261.63,
    pattern: [1, o, o, 3, o, 5, o, o, 8, o, o, 5, o, 3, o, o],
  },
  {
    id: 'momo',
    name: 'Momo',
    color: '#a855f7',
    kind: 'note',
    frequency: 196,
    pattern: [8, o, 5, o, 3, o, o, o, 1, o, 3, o, 5, o, o, o],
  },
  {
    id: 'hums',
    name: 'Hums',
    color: '#f472b6',
    kind: 'pad',
    frequency: 293.66,
    pattern: [1, o, o, o, o, o, o, o, 8, o, o, o, o, o, o, o],
  },
];

/** Feed one to a singer on stage and it turns fruity - new colour, new face, new sound. */
export const FRUITS: Fruit[] = [
  {
    id: 'mango',
    name: 'Mango',
    color: '#fbbf24',
    seed: '#b45309',
    detune: 4,
    extra: [2, 10],
    face: 'grin',
  },
  {
    id: 'dragon-fruit',
    name: 'Dragon Fruit',
    color: '#ec4899',
    seed: '#134e4a',
    detune: -7,
    extra: [6, 7, 14],
    kind: 'pad',
    face: 'fangs',
  },
  {
    id: 'banana',
    name: 'Banana',
    color: '#fde047',
    seed: '#854d0e',
    detune: 7,
    extra: [3, 11],
    kind: 'blip',
    face: 'wobble',
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    color: '#34d399',
    seed: '#1f2937',
    detune: -5,
    extra: [4, 12],
    kind: 'kick',
    face: 'stare',
  },
  {
    id: 'cherry',
    name: 'Cherry',
    color: '#f43f5e',
    seed: '#4c0519',
    detune: 12,
    extra: [1, 5, 9, 13],
    face: 'grin',
  },
  {
    id: 'lime',
    name: 'Lime',
    color: '#a3e635',
    seed: '#365314',
    detune: -12,
    extra: [8],
    kind: 'note',
    face: 'stare',
  },
];

export function characterById(id: string | null | undefined): Character | null {
  return id ? (CAST.find((entry) => entry.id === id) ?? null) : null;
}

export function fruitById(id: string | null | undefined): Fruit | null {
  return id ? (FRUITS.find((entry) => entry.id === id) ?? null) : null;
}

/** What a singer sounds like right now: plain, or fruity once it has eaten. */
export function voiceOf(character: Character, fruit: Fruit | null): Voice {
  if (!fruit) {
    return { kind: character.kind, frequency: character.frequency, pattern: character.pattern };
  }
  return {
    kind: fruit.kind ?? character.kind,
    frequency: character.frequency * 2 ** (fruit.detune / 12),
    pattern: character.pattern.map((step, i) => (step ? step : fruit.extra.includes(i) ? 1 : 0)),
  };
}

/** How many singers can stand on the stage at once. */
export const SLOT_COUNT = 6;
