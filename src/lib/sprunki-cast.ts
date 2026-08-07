export type Category = 'beat' | 'effect' | 'melody' | 'vocal';

export type Character = {
  id: string;
  name: string;
  category: Category;
  color: string;
  /** Tone in Hz, picked from a pentatonic set so any mix stays in key. */
  frequency: number;
};

/** The 20 Sprunki characters, in game order, grouped as beats / effects / melodies / vocals. */
export const CAST: Character[] = [
  { id: 'oren', name: 'Oren', category: 'beat', color: '#f97316', frequency: 65.41 },
  { id: 'raddy', name: 'Raddy', category: 'beat', color: '#ef4444', frequency: 73.42 },
  { id: 'clukr', name: 'Clukr', category: 'beat', color: '#94a3b8', frequency: 82.41 },
  { id: 'fun-bot', name: 'Fun Bot', category: 'beat', color: '#cbd5e1', frequency: 98.0 },
  { id: 'vineria', name: 'Vineria', category: 'beat', color: '#16a34a', frequency: 110.0 },

  { id: 'gray', name: 'Gray', category: 'effect', color: '#6b7280', frequency: 130.81 },
  { id: 'brud', name: 'Brud', category: 'effect', color: '#92400e', frequency: 146.83 },
  { id: 'garnold', name: 'Garnold', category: 'effect', color: '#eab308', frequency: 164.81 },
  { id: 'owakcx', name: 'Owakcx', category: 'effect', color: '#84cc16', frequency: 196.0 },
  { id: 'sky', name: 'Sky', category: 'effect', color: '#38bdf8', frequency: 220.0 },

  { id: 'mr-sun', name: 'Mr. Sun', category: 'melody', color: '#facc15', frequency: 261.63 },
  { id: 'durple', name: 'Durple', category: 'melody', color: '#a855f7', frequency: 293.66 },
  { id: 'mr-tree', name: 'Mr. Tree', category: 'melody', color: '#22c55e', frequency: 329.63 },
  { id: 'simon', name: 'Simon', category: 'melody', color: '#fde047', frequency: 392.0 },
  { id: 'tunner', name: 'Tunner', category: 'melody', color: '#d6bd98', frequency: 440.0 },

  {
    id: 'mr-fun-computer',
    name: 'Mr. Fun Computer',
    category: 'vocal',
    color: '#06b6d4',
    frequency: 523.25,
  },
  { id: 'wenda', name: 'Wenda', category: 'vocal', color: '#f8fafc', frequency: 587.33 },
  { id: 'pinki', name: 'Pinki', category: 'vocal', color: '#f472b6', frequency: 659.25 },
  { id: 'jevin', name: 'Jevin', category: 'vocal', color: '#ec4899', frequency: 783.99 },
  { id: 'black', name: 'Black', category: 'vocal', color: '#334155', frequency: 880.0 },
];

/** How many characters can stand on the stage at once. */
export const SLOT_COUNT = 7;

export const VOICE: Record<
  Category,
  { wave: OscillatorType; pulsesPerSecond: number; level: number }
> = {
  beat: { wave: 'triangle', pulsesPerSecond: 2, level: 0.1 },
  effect: { wave: 'sawtooth', pulsesPerSecond: 4, level: 0.03 },
  melody: { wave: 'triangle', pulsesPerSecond: 1, level: 0.05 },
  vocal: { wave: 'sine', pulsesPerSecond: 0.5, level: 0.05 },
};
