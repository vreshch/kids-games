import type { Metadata } from 'next';

import { CrystalRoomsGame } from '@/components/crystal-rooms/crystal-rooms-game';
import { GameShell } from '@/components/game-shell';

export const metadata: Metadata = { title: 'Crystal Rooms' };

export default function CrystalRoomsPage() {
  return (
    <GameShell>
      <CrystalRoomsGame />
    </GameShell>
  );
}
