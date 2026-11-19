import {
  findPet,
  hasPet,
  holding,
  PAD_ORDER,
  ROCK_TAPS,
  ROCK_WINDOW_MS,
  withPuzzles,
  type Outcome,
  type PadSize,
  type World,
} from './secret-pet-land-world';

export type Target =
  | 'gift'
  | 'seeds'
  | 'water'
  | 'soil'
  | 'rock'
  | 'bunny'
  | 'hay'
  | 'egg'
  | 'basket'
  | 'pad'
  | 'bubbles'
  | 'sun'
  | 'hole'
  | 'bush'
  | 'mushroom'
  | 'log';

type Ctx = { now: number; pad?: PadSize };
type Handler = (world: World, ctx: Ctx) => Outcome;

const tone = (freq: number, length?: number) => ({ freq, length });

function gift(world: World): Outcome {
  const knocks = world.puzzles.gift + 1;
  const next = withPuzzles(world, { gift: knocks });
  if (knocks >= 3) return findPet(next, 'kitten');
  const say = knocks === 1 ? 'Knock...' : 'Knock, knock... something said meow!';
  return { world: next, say, tone: tone(300 + knocks * 100) };
}

function soil(world: World): Outcome {
  const { soil: stage } = world.puzzles;
  if (stage === 0) {
    if (world.hand !== 'seeds') return { world, say: 'Empty soil. It needs seeds.' };
    const next = holding(withPuzzles(world, { soil: 1 }), null);
    return { world: next, say: 'Planted! Now it needs water.', tone: tone(500) };
  }
  if (stage === 1) {
    if (world.hand !== 'water') return { world, say: 'The baby plant is thirsty.' };
    const next = holding(withPuzzles(world, { soil: 2 }), null);
    return { world: next, say: 'A cabbage grew! Pick it.', tone: tone(800) };
  }
  const next = holding(withPuzzles(world, { soil: 0 }), 'cabbage');
  return { world: next, say: 'Yummy cabbage! Who is hungry?' };
}

function rock(world: World, { now }: Ctx): Outcome {
  if (hasPet(world, 'bunny') || world.puzzles.rockOpen) return { world, say: 'Just a rock now.' };
  const taps = [...world.puzzles.rockTaps.filter((t) => now - t < ROCK_WINDOW_MS), now];
  if (taps.length >= ROCK_TAPS) {
    const next = withPuzzles(world, { rockTaps: [], rockOpen: true });
    return { world: next, say: 'A bunny peeks out! He looks hungry...', tone: tone(900, 0.3) };
  }
  const say = taps.length === 1 ? 'The rock wiggled! Tap faster!' : undefined;
  return { world: withPuzzles(world, { rockTaps: taps }), say, tone: tone(200 + taps.length * 60) };
}

function hay(world: World): Outcome {
  const rustles = world.puzzles.hay + 1;
  const say = rustles === 3 ? 'An egg rolled out!' : rustles < 3 ? 'Rustle, rustle...' : undefined;
  return { world: withPuzzles(world, { hay: rustles }), say, tone: tone(400) };
}

function egg(world: World): Outcome {
  const cracks = world.puzzles.egg + 1;
  const next = withPuzzles(world, { egg: cracks });
  return cracks >= 3 ? findPet(next, 'chick') : { world: next, say: 'Crack...', tone: tone(500) };
}

function pad(world: World, { pad: size }: Ctx): Outcome {
  if (hasPet(world, 'frog')) return { world, say: 'Ribbit!' };
  const pads = world.puzzles.pads;
  if (size !== PAD_ORDER[pads.length]) {
    const say = 'Splash! Try a different order.';
    return { world: withPuzzles(world, { pads: [] }), say, tone: tone(150, 0.3) };
  }
  const next = withPuzzles(world, { pads: [...pads, size] });
  if (next.puzzles.pads.length === PAD_ORDER.length) return findPet(next, 'frog');
  return { world: next, say: 'Boing!', tone: tone(400 + next.puzzles.pads.length * 150) };
}

function sun(world: World): Outcome {
  const night = !world.puzzles.night;
  const say = night ? 'Good night, sun!' : 'Good morning!';
  return { world: withPuzzles(world, { night }), say, tone: tone(night ? 300 : 700, 0.3) };
}

function hole(world: World): Outcome {
  if (hasPet(world, 'owl')) return { world, say: 'Hoo hoo!' };
  if (world.puzzles.night) return findPet(world, 'owl');
  return { world, say: 'Zzz... somebody sleeps in here all day.' };
}

function bush(world: World): Outcome {
  const shakes = world.puzzles.bush + 1;
  const say =
    shakes === 3 ? 'A mushroom fell out!' : shakes < 3 ? 'Shake, shake...' : 'Just leaves.';
  return { world: withPuzzles(world, { bush: shakes }), say, tone: tone(350) };
}

const feed =
  (item: World['hand'], pet: Parameters<typeof findPet>[1], ask: string, done?: string) =>
  (world: World): Outcome => {
    if (done && hasPet(world, pet)) return { world, say: done };
    return world.hand === item ? findPet(world, pet) : { world, say: ask };
  };

const pick =
  (item: NonNullable<World['hand']>, say: string): Handler =>
  (world) => ({ world: holding(world, item), say });

const HANDLERS: Record<Target, Handler> = {
  gift,
  seeds: pick('seeds', 'You got seeds! Where can you plant them?'),
  water: pick('water', 'Water! Something small is thirsty.'),
  soil,
  rock,
  bunny: feed('cabbage', 'bunny', 'He wants something green and crunchy!'),
  hay,
  egg,
  basket: pick('bread', 'You took some bread!'),
  pad,
  bubbles: feed('bread', 'fish', 'Blub blub... someone is hungry down there.'),
  sun,
  hole,
  bush,
  mushroom: pick('mushroom', 'A mushroom! Who likes mushrooms?'),
  log: feed(
    'mushroom',
    'hedgehog',
    'Sniff, sniff... something in the log smells for mushrooms.',
    'The hedgehog is so happy!'
  ),
};

/** Every tap in a place goes through here; `now` is passed in so tests control the clock. */
export const tap = (world: World, target: Target, ctx: Ctx): Outcome =>
  HANDLERS[target](world, ctx);

export const dropItem = (world: World): Outcome => ({
  world: holding(world, null),
  say: 'You put it down.',
});
