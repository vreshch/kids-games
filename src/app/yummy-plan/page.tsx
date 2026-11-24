import { GameShell } from '@/components/game-shell';
import { GameJsonLd } from '@/components/json-ld';
import { YummyPlanGame } from '@/components/yummy-plan/yummy-plan-game';
import { gameMetadata } from '@/lib/games';

export const metadata = gameMetadata('yummy-plan');

export default function YummyPlanPage() {
  return (
    <GameShell>
      <GameJsonLd slug="yummy-plan" />
      <YummyPlanGame />
    </GameShell>
  );
}
