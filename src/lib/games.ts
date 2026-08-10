import type { ComponentType } from 'react';

import { ParrotIcon, SmileIcon, SprankiIcon } from '@/components/game-icons';

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
];
