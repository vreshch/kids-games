import { GameShell } from '@/components/game-shell';
import { GameJsonLd } from '@/components/json-ld';
import { TankyTownGame } from '@/components/tanky-town/tanky-town-game';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('tanky-town');

export default function TankyTownPage() {
  return (
    <GameShell>
      <GameJsonLd slug="tanky-town" />
      <TankyTownGame />
    </GameShell>
  );
}
