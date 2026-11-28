const ROOM_ID = /^[a-z0-9]{4,12}$/;
const ROOM_LETTERS = 'abcdefghjkmnpqrstuvwxyz23456789';

/** The room names the relay accepts. */
export const isRoomId = (value: unknown): value is string =>
  typeof value === 'string' && ROOM_ID.test(value);

/** Six letters that are easy to read aloud: no 0/o, 1/l/i. */
export function newRoomId(rng: () => number = Math.random) {
  const pick = () => ROOM_LETTERS[Math.floor(rng() * ROOM_LETTERS.length)];
  return Array.from({ length: 6 }, pick).join('');
}
