import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';
import { SprankiGame } from '@/components/spranki-game';

export const metadata = gameMetadata('spranki');

export default function SprankiPage() {
  return (
    <GameShell>
      <SprankiGame />
    </GameShell>
  );
}
