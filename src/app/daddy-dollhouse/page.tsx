import { GameShell } from '@/components/game-shell';
import { DaddyDollhouseGame } from '@/components/daddy-dollhouse/daddy-dollhouse-game';
import { GameJsonLd } from '@/components/json-ld';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('daddy-dollhouse');

export default function DaddyDollhousePage() {
  return (
    <GameShell>
      <GameJsonLd slug="daddy-dollhouse" />
      <DaddyDollhouseGame />
    </GameShell>
  );
}
