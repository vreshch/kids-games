import { GameShell } from '@/components/game-shell';
import { GameJsonLd } from '@/components/json-ld';
import { MunchMazeGame } from '@/components/munch-maze/munch-maze-game';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('munch-maze');

export default function MunchMazePage() {
  return (
    <GameShell>
      <GameJsonLd slug="munch-maze" />
      <MunchMazeGame />
    </GameShell>
  );
}
