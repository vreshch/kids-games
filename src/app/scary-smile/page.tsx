import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';
import { GameJsonLd } from '@/components/json-ld';
import { ScarySmile } from '@/components/scary-smile';

export const metadata = gameMetadata('scary-smile');

export default function ScarySmilePage() {
  return (
    <GameShell>
      <GameJsonLd slug="scary-smile" />
      <ScarySmile />
    </GameShell>
  );
}
