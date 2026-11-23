import { LEVEL_DEFS } from '@/lib/tanky-town-level';
import type { Phase, World } from '@/lib/tanky-town-state';
import { enemiesLeft } from '@/lib/tanky-town-world';

/** The few numbers the score bar shows; a read-only copy of the world. */
export type View = { phase: Phase; level: number; left: number; score: number; lives: number };

export const viewOf = (w: World): View => ({
  phase: w.phase,
  level: w.levelIndex,
  left: enemiesLeft(w),
  score: w.score,
  lives: w.lives,
});

export const sameView = (a: View, b: View) =>
  a.phase === b.phase &&
  a.level === b.level &&
  a.left === b.left &&
  a.score === b.score &&
  a.lives === b.lives;

export function banner(view: View | null) {
  if (!view) return '';
  if (view.phase === 'clear') return `Level clear! 🎉 Next: ${LEVEL_DEFS[view.level + 1].name}`;
  if (view.phase !== 'play') return '';
  return `${LEVEL_DEFS[view.level].name}: ${view.left} grumpy tank${view.left === 1 ? '' : 's'} left`;
}
