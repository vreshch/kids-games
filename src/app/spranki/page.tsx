import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';
import { GameJsonLd } from '@/components/json-ld';
import { SprankiGame } from '@/components/spranki-game';

export const metadata = gameMetadata('spranki');

export default function SprankiPage() {
  return (
    <GameShell>
      <GameJsonLd slug="spranki" />
      <SprankiGame />
    </GameShell>
  );
}
