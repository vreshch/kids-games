import { GameShell } from '@/components/game-shell';
import { GameJsonLd } from '@/components/json-ld';
import { SecretPetLandGame } from '@/components/secret-pet-land/secret-pet-land-game';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('secret-pet-land');

export default function SecretPetLandPage() {
  return (
    <GameShell>
      <GameJsonLd slug="secret-pet-land" />
      <SecretPetLandGame />
    </GameShell>
  );
}
