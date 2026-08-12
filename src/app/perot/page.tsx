import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';
import { GameJsonLd } from '@/components/json-ld';
import { PerotGame } from '@/components/perot-game';

export const metadata = gameMetadata('perot');

export default function PerotPage() {
  return (
    <GameShell>
      <GameJsonLd slug="perot" />
      <PerotGame />
    </GameShell>
  );
}
