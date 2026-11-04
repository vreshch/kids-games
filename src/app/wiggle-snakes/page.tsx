import { GameShell } from '@/components/game-shell';
import { GameJsonLd } from '@/components/json-ld';
import { WiggleSnakesGame } from '@/components/wiggle-snakes/wiggle-snakes-game';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('wiggle-snakes');

export default function WiggleSnakesPage() {
  return (
    <GameShell>
      <GameJsonLd slug="wiggle-snakes" />
      <WiggleSnakesGame />
    </GameShell>
  );
}
