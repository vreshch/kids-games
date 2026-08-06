import type { ComponentType } from 'react';

import { ParrotIcon, SmileIcon } from '@/components/game-icons';

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
    tagline: 'Click the smile until it turns into a monster.',
    accent: '#22c55e',
    Icon: SmileIcon,
  },
  {
    slug: 'perot',
    title: 'Perot',
    tagline: 'Hold space, say something, the parrot squawks it back.',
    accent: '#0ea5e9',
    Icon: ParrotIcon,
  },
];
