import { describe, expect, it } from 'vitest';

import { HOUSES, type CharId, type RoomId } from './dollhouse-data';
import { createState, type Action, type DollState } from './dollhouse-state';
import { hintTarget, presentSpot } from './dollhouse-play';
import { reduce } from './dollhouse-reducer';

const run = (s: DollState, ...actions: Action[]) => actions.reduce(reduce, s);
const settle = (s: DollState) => {
  let next = s;
  for (let i = 0; i < 6 && next.lift.phase !== 'idle'; i++)
    next = reduce(next, { type: 'advance' });
  return next;
};
const send = (s: DollState, id: CharId, room: RoomId) =>
  run(s, { type: 'select', id }, { type: 'room', room });
const openPresent = (s: DollState) =>
  run(s, { type: 'present' }, { type: 'present' }, { type: 'present' }, { type: 'nextPresent' });

describe('select and move', () => {
  it('selects and deselects a character', () => {
    const s = run(createState(), { type: 'select', id: 'cat' });
    expect(s.selected).toBe('cat');
    expect(reduce(s, { type: 'select', id: 'cat' }).selected).toBeNull();
  });

  it('hops to a room on the same floor', () => {
    const s = send(createState(), 'daddy', 1);
    expect(s.at.daddy).toBe(1);
    expect(s.selected).toBeNull();
    expect(s.moved?.from).toBe(-1);
  });

  it('ignores a room tap without a selection', () => {
    const s = createState();
    expect(reduce(s, { type: 'room', room: 1 })).toBe(s);
  });

  it('rides the elevator to another floor in phases', () => {
    let s = send(createState(), 'daddy', 3);
    expect(s.lift.phase).toBe('walk');
    expect(s.at.daddy).toBe(0);
    s = reduce(s, { type: 'advance' });
    expect(s.at.daddy).toBe('lift');
    s = reduce(s, { type: 'advance' });
    expect(s.lift.floor).toBe(1);
    s = reduce(s, { type: 'advance' });
    expect(s.at.daddy).toBe(3);
    expect(s.event.kind).toBe('ding');
    expect(settle(s).lift.phase).toBe('idle');
  });

  it('rides when the elevator is tapped with a selection', () => {
    const s = settle(run(createState(), { type: 'select', id: 'daddy' }, { type: 'elevator' }));
    expect(s.at.daddy).toBe(2);
  });

  it('runs an empty cabin when nothing is selected', () => {
    const s = settle(reduce(createState(), { type: 'elevator' }));
    expect(s.lift.floor).toBe(1);
  });

  it('does not start a second trip while the cabin is busy', () => {
    const busyState = send(createState(), 'daddy', 3);
    expect(send(busyState, 'girl', 2).at.girl).toBe(1);
    expect(reduce(busyState, { type: 'elevator' })).toBe(busyState);
  });
});

describe('presents and secrets', () => {
  it('opens a present in three taps and gives the next item', () => {
    let s = run(createState(), { type: 'present' });
    expect(s.event.kind).toBe('wiggle');
    s = reduce(s, { type: 'present' });
    expect(s.event.kind).toBe('grow');
    s = reduce(s, { type: 'present' });
    expect(s.progress[0].items).toEqual(['key']);
    s = reduce(s, { type: 'present' });
    expect(s.progress[0].stage).toBe(3);
    s = reduce(s, { type: 'nextPresent' });
    expect(presentSpot(s)).toEqual(HOUSES[0].presents[1]);
  });

  it('keeps the cupboard locked until the key arrives', () => {
    const locked = reduce(createState(), { type: 'secret', id: 'cupboard' });
    expect(locked.event.kind).toBe('locked');
    expect(locked.progress[0].secrets).toEqual([]);
    const found = reduce(openPresent(createState()), { type: 'secret', id: 'cupboard' });
    expect(found.progress[0].secrets).toEqual(['cupboard']);
    expect(reduce(createState(), { type: 'secret', id: 'hole' }).event.kind).toBe('dark');
  });

  it('unlocks the second house after exactly three secrets', () => {
    let s = openPresent(openPresent(createState()));
    s = run(s, { type: 'secret', id: 'picture' }, { type: 'secret', id: 'cupboard' });
    expect(s.unlocked).toBe(false);
    s = reduce(s, { type: 'secret', id: 'hole' });
    expect(s.unlocked).toBe(true);
    expect(s.event.kind).toBe('unlock');
    expect(reduce(s, { type: 'secret', id: 'hole' })).toBe(s);
  });

  it('hints the first findable secret, else the present', () => {
    expect(hintTarget(createState())).toEqual({ kind: 'secret', id: 'picture' });
    const s = reduce(createState(), { type: 'secret', id: 'picture' });
    expect(hintTarget(s)).toEqual({ kind: 'present' });
    const done = openPresent(openPresent(openPresent(s)));
    expect(hintTarget(done)).toEqual({ kind: 'secret', id: 'cupboard' });
  });
});

describe('ice, night and houses', () => {
  it('makes a cube and gives it to a character', () => {
    let s = run(createState(), { type: 'iceColor', color: 'pink' }, { type: 'machine' });
    expect(s.cube).toBe(true);
    s = run(s, { type: 'cube' }, { type: 'select', id: 'baby' });
    expect(s.cube).toBe(false);
    expect(s.treats.baby).toBe('pink');
    expect(s.cheer?.id).toBe('baby');
  });

  it('gives the cube to the selected character in one more tap', () => {
    const s = run(
      createState(),
      { type: 'select', id: 'cat' },
      { type: 'machine' },
      { type: 'cube' }
    );
    expect(s.treats.cat).toBe('blue');
  });

  it('ignores the cube button when there is no cube', () => {
    const s = createState();
    expect(reduce(s, { type: 'cube' })).toBe(s);
  });

  it('toggles night and day', () => {
    const night = reduce(createState(), { type: 'night' });
    expect(night.night).toBe(true);
    expect(reduce(night, { type: 'night' }).night).toBe(false);
  });

  it('keeps the second house locked until it is earned', () => {
    const s = createState();
    expect(reduce(s, { type: 'house', index: 1 })).toBe(s);
    const open = reduce(createState({ ...createState(), unlocked: true }), {
      type: 'house',
      index: 1,
    });
    expect(open.house).toBe(1);
    expect(reduce(open, { type: 'present' }).progress[1].stage).toBe(1);
  });
});
