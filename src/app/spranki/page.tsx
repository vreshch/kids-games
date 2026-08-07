import type { Metadata } from 'next';

import { GameShell } from '@/components/game-shell';
import { SprankiGame } from '@/components/spranki-game';

export const metadata: Metadata = { title: 'Spranki' };

export default function SprankiPage() {
  return (
    <GameShell>
      <SprankiGame />
    </GameShell>
  );
}
