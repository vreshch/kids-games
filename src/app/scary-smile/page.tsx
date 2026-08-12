import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';
import { ScarySmile } from '@/components/scary-smile';

export const metadata = gameMetadata('scary-smile');

export default function ScarySmilePage() {
  return (
    <GameShell>
      <ScarySmile />
    </GameShell>
  );
}
