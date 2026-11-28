import type { StaticImageData } from 'next/image';

import crystalRooms from '../../../docs/screenshots/crystal-rooms.png';
import daddyDollhouse from '../../../docs/screenshots/daddy-dollhouse.png';
import frankie from '../../../docs/screenshots/frankie.png';
import perot from '../../../docs/screenshots/perot.png';
import scarySmile from '../../../docs/screenshots/scary-smile.png';
import spranki from '../../../docs/screenshots/spranki.png';
import tankyTown from '../../../docs/screenshots/tanky-town.png';
import wiggleSnakes from '../../../docs/screenshots/wiggle-snakes.png';
import yummyPlan from '../../../docs/screenshots/yummy-plan.png';

/** The README phone captures double as the book pictures; a game without one shows its icon. */
export const BOOK_SHOTS: Record<string, StaticImageData> = {
  'scary-smile': scarySmile,
  perot,
  spranki,
  frankie,
  'crystal-rooms': crystalRooms,
  'wiggle-snakes': wiggleSnakes,
  'tanky-town': tankyTown,
  'yummy-plan': yummyPlan,
  'daddy-dollhouse': daddyDollhouse,
};
