import { advance, callLift, moveTo } from './dollhouse-lift';
import {
  nextPresent,
  pickColor,
  switchHouse,
  tapMachine,
  tapPresent,
  tapSecret,
  toggleNight,
} from './dollhouse-play';
import { createState, emit, select, type Action, type DollState } from './dollhouse-state';

function cube(s: DollState): DollState {
  if (!s.cube) return s;
  if (s.selected) return select({ ...s, holding: true }, s.selected);
  return emit({ ...s, holding: !s.holding }, 'select');
}

export function reduce(s: DollState, a: Action): DollState {
  switch (a.type) {
    case 'select':
      return select(s, a.id);
    case 'room':
      return moveTo(s, a.room);
    case 'elevator':
      return callLift(s);
    case 'advance':
      return advance(s);
    case 'present':
      return tapPresent(s);
    case 'nextPresent':
      return nextPresent(s);
    case 'secret':
      return tapSecret(s, a.id);
    case 'machine':
      return tapMachine(s);
    case 'cube':
      return cube(s);
    case 'iceColor':
      return pickColor(s, a.color);
    case 'night':
      return toggleNight(s);
    case 'house':
      return switchHouse(s, a.index);
    case 'load':
      return createState(a.saved);
  }
}
