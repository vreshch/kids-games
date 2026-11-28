import type { Vec } from './wiggle-snake';

/** Every third body point goes over the wire; the friend fills in the ones between. */
export const STRIDE = 3;

/** Head first, then every STRIDE-th point, as whole-number steps from the one before. */
export function packBody(body: Vec[]) {
  const out: number[] = [];
  let px = 0;
  let py = 0;
  for (const i of sampleIndices(body.length)) {
    const x = Math.round(body[i].x);
    const y = Math.round(body[i].y);
    out.push(x - px, y - py);
    px = x;
    py = y;
  }
  return out;
}

/** The sampled indices: 0, STRIDE, 2 x STRIDE, ... and always the tail. */
function sampleIndices(length: number) {
  const out: number[] = [];
  for (let i = 0; i < length - 1; i += STRIDE) out.push(i);
  out.push(length - 1);
  return out;
}

/** The friend's side: the sampled points back, and the ones between filled in on a line. */
export function unpackBody(p: number[], length: number): Vec[] {
  const points: Vec[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < p.length; i += 2) {
    x += p[i];
    y += p[i + 1];
    points.push({ x, y });
  }
  if (length <= 1) return points;
  const at = sampleIndices(length);
  const body: Vec[] = [];
  for (let k = 0; k < at.length - 1; k++) {
    const a = points[k];
    const b = points[k + 1] ?? a;
    const span = at[k + 1] - at[k];
    for (let j = 0; j < span; j++) {
      body.push({ x: a.x + ((b.x - a.x) * j) / span, y: a.y + ((b.y - a.y) * j) / span });
    }
  }
  body.push(points[at.length - 1] ?? body[body.length - 1]);
  return body;
}
