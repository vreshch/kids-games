import { describe, expect, it } from 'vitest';

import { inviteOf, isRoomId, newRoomId, roomToPlay, saveSeat, savedSeat } from './duo-room';

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};
const broken = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('rooms', () => {
  it('makes room names the relay accepts', () => {
    expect(newRoomId(() => 0)).toBe('aaaaaa');
    expect(isRoomId(newRoomId())).toBe(true);
    expect(isRoomId('AB')).toBe(false);
    expect(isRoomId(null)).toBe(false);
  });
});

describe('seats', () => {
  it('hosts a new room and remembers it, so the own link is no invite', () => {
    const store = memory();
    expect(roomToPlay(null, store, () => 0)).toEqual({ room: 'aaaaaa', seat: 0 });
    expect(savedSeat(store, 'aaaaaa')).toBe(0);
    expect(inviteOf('aaaaaa', store)).toBeNull();
    expect(roomToPlay('aaaaaa', store)).toEqual({ room: 'aaaaaa', seat: 0 });
  });

  it('joins a link from someone else as the friend', () => {
    const store = memory();
    expect(inviteOf('bbbbbb', store)).toBe('bbbbbb');
    expect(roomToPlay('bbbbbb', store)).toEqual({ room: 'bbbbbb', seat: 1 });
    saveSeat(store, 'bbbbbb', 1);
    expect(inviteOf('bbbbbb', store)).toBe('bbbbbb');
    expect(inviteOf(null, store)).toBeNull();
  });

  it('still plays when storage is blocked or missing', () => {
    expect(savedSeat(broken, 'cccccc')).toBeNull();
    expect(() => saveSeat(broken, 'cccccc', 0)).not.toThrow();
    expect(roomToPlay(null, null, () => 0).seat).toBe(0);
    expect(roomToPlay('cccccc', broken).seat).toBe(1);
  });

  it('reads only the seats it wrote', () => {
    const store = memory();
    store.setItem('duo-seat:dddddd', 'x');
    expect(savedSeat(store, 'dddddd')).toBeNull();
  });
});
