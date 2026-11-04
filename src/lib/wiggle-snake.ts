export type Vec = { x: number; y: number };

export type Snake = {
  id: number;
  name: string;
  skin: number;
  isPlayer: boolean;
  /** body[0] is the head; the rest are trail samples SEGMENT_SPACING apart. */
  body: Vec[];
  angle: number;
  targetAngle: number;
  mass: number;
  boosting: boolean;
  alive: boolean;
  dropTimer: number;
  /** Bots only: seconds until the next decision, and the drifting wander heading. */
  thinkIn: number;
  wander: number;
  bold: boolean;
};

export const START_MASS = 20;
export const MIN_BOOST_MASS = 15;
export const SEGMENT_SPACING = 6;
export const BASE_SPEED = 190;
export const BOOST_SPEED = 380;

export const radiusFor = (mass: number) => Math.min(40, 10 + Math.sqrt(mass) * 0.9);
export const segmentsFor = (mass: number) => Math.min(500, Math.round(10 + mass * 0.35));
/** Small snakes turn on a dime, big ones swing wide. */
export const turnRateFor = (mass: number) => 2 + 30 / radiusFor(mass);

type SnakeInit = Pick<Snake, 'id' | 'name' | 'skin' | 'isPlayer' | 'mass' | 'angle'> & Vec;

export function createSnake({ x, y, angle, mass, ...rest }: SnakeInit): Snake {
  const body: Vec[] = [];
  for (let i = 0; i <= segmentsFor(mass); i++) {
    body.push({
      x: x - Math.cos(angle) * i * SEGMENT_SPACING,
      y: y - Math.sin(angle) * i * SEGMENT_SPACING,
    });
  }
  return {
    ...rest,
    body,
    angle,
    targetAngle: angle,
    mass,
    boosting: false,
    alive: true,
    dropTimer: 0,
    thinkIn: 0,
    wander: angle,
    bold: false,
  };
}

/** Shortest signed turn from one heading to another, in (-PI, PI]. */
export function angleDelta(from: number, to: number) {
  const d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) return d - Math.PI * 2;
  if (d <= -Math.PI) return d + Math.PI * 2;
  return d;
}

export function canBoost(snake: Snake) {
  return snake.boosting && snake.mass > MIN_BOOST_MASS;
}

/** Turn toward the target, slide the head forward, and lay trail samples behind it. */
export function moveSnake(snake: Snake, dt: number, arenaRadius: number) {
  const maxTurn = turnRateFor(snake.mass) * dt;
  snake.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDelta(snake.angle, snake.targetAngle)));

  const speed = canBoost(snake) ? BOOST_SPEED : BASE_SPEED;
  const head = snake.body[0];
  head.x += Math.cos(snake.angle) * speed * dt;
  head.y += Math.sin(snake.angle) * speed * dt;

  // soft wall: the head slides along the edge instead of dying on it
  const limit = arenaRadius - radiusFor(snake.mass);
  const dist = Math.hypot(head.x, head.y);
  if (dist > limit) {
    head.x *= limit / dist;
    head.y *= limit / dist;
  }

  layTrail(snake.body);
  fitLength(snake.body, segmentsFor(snake.mass) + 1);
}

function layTrail(body: Vec[]) {
  const head = body[0];
  for (;;) {
    const neck = body[1];
    const dx = head.x - neck.x;
    const dy = head.y - neck.y;
    const d = Math.hypot(dx, dy);
    if (d < SEGMENT_SPACING) return;
    const k = SEGMENT_SPACING / d;
    body.splice(1, 0, { x: neck.x + dx * k, y: neck.y + dy * k });
  }
}

/** Growing leaves the tail parked while the head moves on; shrinking trims it. */
function fitLength(body: Vec[], count: number) {
  if (body.length > count) body.length = count;
  while (body.length < count) body.push({ ...body[body.length - 1] });
}
