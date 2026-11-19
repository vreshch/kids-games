export type PetId = 'kitten' | 'bunny' | 'chick' | 'frog' | 'fish' | 'owl' | 'hedgehog';
export type PlaceId = 'home' | 'farm' | 'pond' | 'forest';
export type Item = 'seeds' | 'water' | 'cabbage' | 'bread' | 'mushroom';

export type Pet = { id: PetId; emoji: string; name: string; place: PlaceId; hint: string };

export const PETS: readonly Pet[] = [
  {
    id: 'kitten',
    emoji: '🐱',
    name: 'Kitten',
    place: 'home',
    hint: 'What is inside the present? Knock, knock, knock!',
  },
  {
    id: 'bunny',
    emoji: '🐰',
    name: 'Bunny',
    place: 'farm',
    hint: 'Somebody hides under the rock. He is hungry for cabbage. Grow one, then tap the rock super FAST!',
  },
  {
    id: 'chick',
    emoji: '🐥',
    name: 'Chick',
    place: 'farm',
    hint: 'The hay is hiding something round. Tap, tap, tap!',
  },
  {
    id: 'frog',
    emoji: '🐸',
    name: 'Frog',
    place: 'pond',
    hint: 'Jump on the lily pads: small, then medium, then BIG.',
  },
  {
    id: 'fish',
    emoji: '🐠',
    name: 'Fish',
    place: 'pond',
    hint: 'Bubbles mean somebody is hungry. Is there bread in the picnic basket?',
  },
  {
    id: 'owl',
    emoji: '🦉',
    name: 'Owl',
    place: 'forest',
    hint: 'This friend only wakes up at night. Can you put the sun to sleep?',
  },
  {
    id: 'hedgehog',
    emoji: '🦔',
    name: 'Hedgehog',
    place: 'forest',
    hint: 'Shake the bush! Somebody in the log loves mushrooms.',
  },
];

export const ITEM_EMOJI: Record<Item, string> = {
  seeds: '🌰',
  water: '💧',
  cabbage: '🥬',
  bread: '🍞',
  mushroom: '🍄',
};

export const PLACES: readonly { id: PlaceId; emoji: string; name: string }[] = [
  { id: 'home', emoji: '🏠', name: 'Home' },
  { id: 'farm', emoji: '🚜', name: 'Farm' },
  { id: 'pond', emoji: '🌊', name: 'Pond' },
  { id: 'forest', emoji: '🌲', name: 'Forest' },
];

export const SKIN = ['#ffd9b8', '#f5c193', '#d99a6c', '#a8704a', '#6f4428'];
export const HAIR_COLORS = [
  '#3b2416',
  '#8a5a2b',
  '#f2c14e',
  '#e2552d',
  '#1d1d2b',
  '#ff7eb6',
  '#8a5cf6',
  '#38b6ff',
];
export const CLOTH = [
  '#ff5d8f',
  '#ff9f1c',
  '#ffd93d',
  '#4cc970',
  '#38b6ff',
  '#8a5cf6',
  '#ffffff',
  '#2d2d3a',
];
export const HATS = ['✖️', '👑', '🎩', '🧢', '🎀', '🌸'];
