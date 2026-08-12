import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';
import { PerotGame } from '@/components/perot-game';

export const metadata = gameMetadata('perot');

export default function PerotPage() {
  return (
    <GameShell>
      <PerotGame />
    </GameShell>
  );
}
