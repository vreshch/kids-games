import type { Metadata } from 'next';
import type { ComponentType } from 'react';

import {
  CookieIcon,
  CrystalIcon,
  DollhouseIcon,
  FrankieIcon,
  MunchIcon,
  ParrotIcon,
  PetLandIcon,
  SmileIcon,
  SprankiIcon,
  TankIcon,
  WiggleIcon,
} from '@/components/game-icons';

export type Game = {
  slug: string;
  title: string;
  tagline: string;
  accent: string;
  Icon: ComponentType<{ className?: string }>;
};

/** Add a game here and it shows up on the home grid. */
export const GAMES: Game[] = [
  {
    slug: 'scary-smile',
    title: 'Scary Smile',
    tagline: 'Tap the smile until it turns into a monster.',
    accent: '#22c55e',
    Icon: SmileIcon,
  },
  {
    slug: 'perot',
    title: 'Perot',
    tagline: 'Tap the parrot, say something, it squawks it back.',
    accent: '#0ea5e9',
    Icon: ParrotIcon,
  },
  {
    slug: 'spranki',
    title: 'Spranki',
    tagline: 'Tap the characters, stack up a beat. Work in progress.',
    accent: '#a855f7',
    Icon: SprankiIcon,
  },
  {
    slug: 'frankie',
    title: 'Frankie',
    tagline: 'Feed the singers fruit and hear what they turn into.',
    accent: '#fbbf24',
    Icon: FrankieIcon,
  },
  {
    slug: 'crystal-rooms',
    title: 'Crystal Rooms',
    tagline: 'Walk the crystal caves, find the letter keys, spell the word.',
    accent: '#2dd4bf',
    Icon: CrystalIcon,
  },
  {
    slug: 'wiggle-snakes',
    title: 'Wiggle Snakes',
    tagline: 'Eat glowing dots, grow huge, tap the super button to gobble every snake.',
    accent: '#f472b6',
    Icon: WiggleIcon,
  },
  {
    slug: 'munch-maze',
    title: 'Munch Maze',
    tagline: 'Roll the die, count your steps, munch the berries, dodge the grumpy clouds.',
    accent: '#34d399',
    Icon: MunchIcon,
  },
  {
    slug: 'secret-pet-land',
    title: 'Secret Pet Land',
    tagline: 'Dress up your own kid, explore the farm, pond and forest, find 7 secret pets.',
    accent: '#ff7eb6',
    Icon: PetLandIcon,
  },
  {
    slug: 'tanky-town',
    title: 'Tanky Town',
    tagline: 'Drive a little tank, guard the birthday cake, beat the grumpy tanks on 25 levels.',
    accent: '#f59e0b',
    Icon: TankIcon,
  },
  {
    slug: 'yummy-plan',
    title: 'Yummy Plan',
    tagline: 'Tap the plan, fill the bowl, bake cookies and more. Find the secret recipe!',
    accent: '#f472b6',
    Icon: CookieIcon,
  },
  {
    slug: 'daddy-dollhouse',
    title: 'Daddy Dollhouse',
    tagline:
      'Send daddy, the girl, the baby and the cat around the house, ride the elevator, find 3 secrets.',
    accent: '#fbbf24',
    Icon: DollhouseIcon,
  },
];

/** Page metadata derived from the registry, so every game gets a description + OG card. */
export function gameMetadata(slug: string): Metadata {
  const game = GAMES.find((entry) => entry.slug === slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.tagline,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: game.title, description: game.tagline, url: `/${slug}` },
  };
}
