export type Category = 'beat' | 'effect' | 'melody' | 'vocal';
export type Kind = 'kick' | 'snare' | 'hat' | 'blip' | 'note' | 'pad';

export type Character = {
  id: string;
  name: string;
  category: Category;
  color: string;
  kind: Kind;
  /** 16 steps of one bar; 0 rests, other values are semitones above `frequency`. */
  pattern: number[];
  frequency: number;
};

const x = 1;
const o = 0;

/** The 20 Sprunki characters in game order, each with its own one-bar loop. */
export const CAST: Character[] = [
  {
    id: 'oren',
    name: 'Oren',
    category: 'beat',
    color: '#f97316',
    kind: 'kick',
    frequency: 110,
    pattern: [x, o, o, o, x, o, o, o, x, o, o, o, x, o, o, o],
  },
  {
    id: 'raddy',
    name: 'Raddy',
    category: 'beat',
    color: '#ef4444',
    kind: 'snare',
    frequency: 220,
    pattern: [o, o, o, o, x, o, o, o, o, o, o, o, x, o, x, o],
  },
  {
    id: 'clukr',
    name: 'Clukr',
    category: 'beat',
    color: '#94a3b8',
    kind: 'hat',
    frequency: 440,
    pattern: [x, o, x, o, x, o, x, o, x, o, x, o, x, o, x, x],
  },
  {
    id: 'fun-bot',
    name: 'Fun Bot',
    category: 'beat',
    color: '#cbd5e1',
    kind: 'kick',
    frequency: 98,
    pattern: [x, o, o, x, o, o, x, o, x, o, o, x, o, o, o, o],
  },
  {
    id: 'vineria',
    name: 'Vineria',
    category: 'beat',
    color: '#16a34a',
    kind: 'snare',
    frequency: 180,
    pattern: [o, o, x, o, o, o, o, x, o, o, x, o, o, x, o, o],
  },

  {
    id: 'gray',
    name: 'Gray',
    category: 'effect',
    color: '#6b7280',
    kind: 'hat',
    frequency: 660,
    pattern: [o, x, o, x, o, x, o, x, o, x, o, x, o, x, o, x],
  },
  {
    id: 'brud',
    name: 'Brud',
    category: 'effect',
    color: '#92400e',
    kind: 'blip',
    frequency: 146.83,
    pattern: [x, o, o, o, o, o, x, o, o, o, o, o, x, o, o, o],
  },
  {
    id: 'garnold',
    name: 'Garnold',
    category: 'effect',
    color: '#eab308',
    kind: 'blip',
    frequency: 196,
    pattern: [o, o, x, x, o, o, o, o, o, o, x, x, o, o, o, o],
  },
  {
    id: 'owakcx',
    name: 'Owakcx',
    category: 'effect',
    color: '#84cc16',
    kind: 'blip',
    frequency: 246.94,
    pattern: [o, o, o, o, x, o, o, x, o, o, o, o, o, x, o, o],
  },
  {
    id: 'sky',
    name: 'Sky',
    category: 'effect',
    color: '#38bdf8',
    kind: 'hat',
    frequency: 880,
    pattern: [o, o, o, x, o, o, o, x, o, o, o, x, x, o, x, o],
  },

  {
    id: 'mr-sun',
    name: 'Mr. Sun',
    category: 'melody',
    color: '#facc15',
    kind: 'note',
    frequency: 261.63,
    pattern: [1, o, o, 3, o, 5, o, o, 8, o, o, 5, o, 3, o, o],
  },
  {
    id: 'durple',
    name: 'Durple',
    category: 'melody',
    color: '#a855f7',
    kind: 'note',
    frequency: 196,
    pattern: [8, o, 5, o, 3, o, o, o, 1, o, 3, o, 5, o, o, o],
  },
  {
    id: 'mr-tree',
    name: 'Mr. Tree',
    category: 'melody',
    color: '#22c55e',
    kind: 'note',
    frequency: 329.63,
    pattern: [o, 3, o, o, 5, o, o, 8, o, o, 10, o, o, 8, o, 5],
  },
  {
    id: 'simon',
    name: 'Simon',
    category: 'melody',
    color: '#fde047',
    kind: 'blip',
    frequency: 392,
    pattern: [1, 1, o, 5, o, o, 3, o, 1, 1, o, 8, o, o, 5, o],
  },
  {
    id: 'tunner',
    name: 'Tunner',
    category: 'melody',
    color: '#d6bd98',
    kind: 'note',
    frequency: 220,
    pattern: [5, o, o, o, o, 3, o, o, 8, o, o, o, o, 10, o, o],
  },

  {
    id: 'mr-fun-computer',
    name: 'Mr. Fun Computer',
    category: 'vocal',
    color: '#06b6d4',
    kind: 'pad',
    frequency: 523.25,
    pattern: [1, o, o, o, o, o, o, o, 8, o, o, o, o, o, o, o],
  },
  {
    id: 'wenda',
    name: 'Wenda',
    category: 'vocal',
    color: '#f8fafc',
    kind: 'pad',
    frequency: 392,
    pattern: [o, o, o, o, 5, o, o, o, o, o, o, o, 3, o, o, o],
  },
  {
    id: 'pinki',
    name: 'Pinki',
    category: 'vocal',
    color: '#f472b6',
    kind: 'note',
    frequency: 587.33,
    pattern: [o, o, 8, o, o, o, o, o, o, o, 5, o, o, o, 3, o],
  },
  {
    id: 'jevin',
    name: 'Jevin',
    category: 'vocal',
    color: '#ec4899',
    kind: 'pad',
    frequency: 293.66,
    pattern: [8, o, o, o, o, o, o, o, o, o, o, o, o, o, o, o],
  },
  {
    id: 'black',
    name: 'Black',
    category: 'vocal',
    color: '#334155',
    kind: 'note',
    frequency: 174.61,
    pattern: [o, o, o, o, o, o, o, o, 1, o, o, 3, o, o, o, o],
  },
];

/** How many characters can stand on the stage at once. */
export const SLOT_COUNT = 7;
