import { CrystalRoomsGame } from '@/components/crystal-rooms/crystal-rooms-game';
import { GameShell } from '@/components/game-shell';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('crystal-rooms');

export default function CrystalRoomsPage() {
  return (
    <GameShell>
      <CrystalRoomsGame />
    </GameShell>
  );
}
