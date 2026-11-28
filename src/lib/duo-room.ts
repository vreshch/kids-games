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

/** Seat 0 is the host, seat 1 the friend. */
export type Seat = 0 | 1;
/** The part of `sessionStorage` the seat memory needs; tests pass a fake. */
export type SeatStore = Pick<Storage, 'getItem' | 'setItem'>;

const seatKey = (room: string) => `duo-seat:${room}`;

/** The seat this tab had in the room, so a reload or a relay restart keeps the roles. */
export function savedSeat(store: SeatStore | null, room: string): Seat | null {
  try {
    const value = store?.getItem(seatKey(room));
    return value === '0' ? 0 : value === '1' ? 1 : null;
  } catch {
    return null;
  }
}

export function saveSeat(store: SeatStore | null, room: string, seat: Seat) {
  try {
    store?.setItem(seatKey(room), String(seat));
  } catch {
    // private mode: the seat is only kept for this page
  }
}

/** A room from the link that this tab did not create, so it joins as the friend. */
export const inviteOf = (linkRoom: string | null, store: SeatStore | null) =>
  linkRoom && savedSeat(store, linkRoom) !== 0 ? linkRoom : null;

/** The room to play in and the seat to claim: the link's room, or a new one this tab hosts. */
export function roomToPlay(linkRoom: string | null, store: SeatStore | null, rng = Math.random) {
  if (!linkRoom) {
    const room = newRoomId(rng);
    saveSeat(store, room, 0);
    return { room, seat: 0 as Seat };
  }
  return { room: linkRoom, seat: savedSeat(store, linkRoom) ?? (1 as Seat) };
}
