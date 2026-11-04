import type { Food } from './wiggle-food';
import { MIN_BOOST_MASS, radiusFor, type Snake, type Vec } from './wiggle-snake';

export const BOT_NAMES = [
  'Noodle',
  'Bubbles',
  'Sprinkles',
  'Ziggy',
  'Pickle',
  'Mango',
  'Squiggle',
  'Jellybean',
  'Twister',
  'Pebble',
  'Biscuit',
  'Wobble',
  'Peanut',
  'Sparkle',
  'Cupcake',
  'Zippy',
];

export type BotSurroundings = {
  snakes: Snake[];
  foods: Food[];
  arenaRadius: number;
  /** The player while the super button is glowing - every bot runs from it. */
  superSnake: Snake | null;
  rand: () => number;
};

const THINK_EVERY = 0.15;
const WALL_MARGIN = 260;
const FLEE_RANGE = 650;
const SEE_PREY = 420;
const SEE_FOOD = 480;

const angleTo = (from: Vec, to: Vec) => Math.atan2(to.y - from.y, to.x - from.x);

/** Re-plan a bot's heading a few times a second: wall, run, hunt, snack, then wander. */
export function thinkBot(bot: Snake, world: BotSurroundings, dt: number) {
  bot.thinkIn -= dt;
  if (bot.thinkIn > 0) return;
  bot.thinkIn = THINK_EVERY;
  bot.boosting = false;
  const head = bot.body[0];

  if (Math.hypot(head.x, head.y) > world.arenaRadius - WALL_MARGIN) {
    bot.targetAngle = Math.atan2(-head.y, -head.x);
    return;
  }
  const hero = world.superSnake?.body[0];
  if (hero && Math.hypot(hero.x - head.x, hero.y - head.y) < FLEE_RANGE) {
    bot.targetAngle = angleTo(hero, head);
    bot.boosting = bot.mass > MIN_BOOST_MASS * 2;
    return;
  }
  const danger = nearestDanger(bot, world.snakes);
  if (danger) {
    bot.targetAngle = angleTo(danger, head);
    return;
  }
  const prey = bot.bold ? nearestPrey(bot, world.snakes) : null;
  if (prey) {
    bot.targetAngle = angleTo(head, prey.body[0]);
    bot.boosting = bot.mass > 60 && world.rand() < 0.3;
    return;
  }
  const food = nearestFood(head, world.foods);
  if (food) {
    bot.targetAngle = angleTo(head, food);
    return;
  }
  bot.wander += (world.rand() - 0.5) * 0.9;
  bot.targetAngle = bot.wander;
}

/** Closest body point of any snake big enough to gobble this bot, if it is too close. */
export function nearestDanger(bot: Snake, snakes: Snake[]): Vec | null {
  const head = bot.body[0];
  const range = 110 + radiusFor(bot.mass) * 2;
  let best: Vec | null = null;
  let bestD = range;
  for (const other of snakes) {
    if (other === bot || !other.alive || other.mass <= bot.mass) continue;
    for (let i = 0; i < other.body.length; i += 3) {
      const p = other.body[i];
      const d = Math.abs(p.x - head.x) + Math.abs(p.y - head.y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
  }
  return best;
}

function nearestPrey(bot: Snake, snakes: Snake[]) {
  const head = bot.body[0];
  let best: Snake | null = null;
  let bestD = SEE_PREY;
  for (const other of snakes) {
    if (other === bot || !other.alive || other.mass * 1.2 > bot.mass) continue;
    const d = Math.hypot(other.body[0].x - head.x, other.body[0].y - head.y);
    if (d < bestD) {
      bestD = d;
      best = other;
    }
  }
  return best;
}

/** Bigger dots count as closer, so bots go for the leftovers of a gobbled snake. */
function nearestFood(head: Vec, foods: Food[]) {
  let best: Food | null = null;
  let bestScore = SEE_FOOD;
  for (const food of foods) {
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    if (Math.abs(dx) > SEE_FOOD || Math.abs(dy) > SEE_FOOD) continue;
    const score = Math.hypot(dx, dy) / Math.sqrt(food.value);
    if (score < bestScore) {
      bestScore = score;
      best = food;
    }
  }
  return best;
}
