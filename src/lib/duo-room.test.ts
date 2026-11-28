import { describe, expect, it } from 'vitest';

import { isRoomId, newRoomId } from './duo-room';

describe('rooms', () => {
  it('makes room names the relay accepts', () => {
    expect(newRoomId(() => 0)).toBe('aaaaaa');
    expect(isRoomId(newRoomId())).toBe(true);
    expect(isRoomId('AB')).toBe(false);
    expect(isRoomId(null)).toBe(false);
  });
});
