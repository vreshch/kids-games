import type { Metadata } from 'next';

import { GameShell } from '@/components/game-shell';
import { ScarySmile } from '@/components/scary-smile';

export const metadata: Metadata = { title: 'Scary Smile' };

export default function ScarySmilePage() {
  return (
    <GameShell>
      <ScarySmile />
    </GameShell>
  );
}
