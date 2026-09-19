import { FrankieGame } from '@/components/frankie/frankie-game';
import { GameShell } from '@/components/game-shell';
import { GameJsonLd } from '@/components/json-ld';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('frankie');

export default function FrankiePage() {
  return (
    <GameShell>
      <GameJsonLd slug="frankie" />
      <FrankieGame />
    </GameShell>
  );
}
