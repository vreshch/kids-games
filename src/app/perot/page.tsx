import type { Metadata } from 'next';

import { GameShell } from '@/components/game-shell';
import { PerotGame } from '@/components/perot-game';

export const metadata: Metadata = { title: 'Perot' };

export default function PerotPage() {
  return (
    <GameShell>
      <PerotGame />
    </GameShell>
  );
}
