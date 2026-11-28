import { floorOf, roomAt, sideOf, type CharId, type Floor, type RoomId } from './dollhouse-data';
import { busy, emit, type DollState, type Lift, type Moved, type Phase } from './dollhouse-state';

function startTrip(s: DollState, rider: CharId | null, dest: RoomId): DollState {
  const from = rider ? (s.at[rider] as RoomId) : s.lift.floor * 2;
  const lift: Lift = {
    floor: floorOf(from as RoomId),
    phase: rider ? 'walk' : 'closing',
    rider,
    dest,
    destFloor: floorOf(dest),
  };
  return emit({ ...s, lift, selected: null }, rider ? 'walk' : 'close');
}

function hop(s: DollState, id: CharId, room: RoomId): DollState {
  const from = s.at[id] as RoomId;
  const dir = sideOf(room) === sideOf(from) ? 0 : sideOf(from) === 0 ? -1 : 1;
  const treats = { ...s.treats };
  delete treats[id];
  const moved: Moved = { id, from: dir, n: (s.moved?.n ?? 0) + 1 };
  return emit(
    { ...s, at: { ...s.at, [id]: room }, selected: null, moved, treats, cheer: null },
    'hop'
  );
}

export function moveTo(s: DollState, room: RoomId): DollState {
  const id = s.selected;
  if (!id || s.at[id] === 'lift') return s;
  const from = s.at[id] as RoomId;
  if (from === room) return emit({ ...s, selected: null }, 'select');
  if (floorOf(from) === floorOf(room)) return hop(s, id, room);
  return busy(s) ? s : startTrip(s, id, room);
}

export function callLift(s: DollState): DollState {
  if (busy(s)) return s;
  const id = s.selected;
  if (!id) return startTrip(s, null, roomAt((1 - s.lift.floor) as Floor, 0));
  const from = s.at[id] as RoomId;
  return startTrip(s, id, roomAt((1 - floorOf(from)) as Floor, sideOf(from)));
}

function arrive(s: DollState): DollState {
  const { rider, dest } = s.lift;
  if (!rider || dest === null) return emit(s, 'ding');
  const moved: Moved = { id: rider, from: sideOf(dest) === 0 ? 1 : -1, n: (s.moved?.n ?? 0) + 1 };
  return emit({ ...s, at: { ...s.at, [rider]: dest }, moved, cheer: null }, 'ding');
}

export function advance(s: DollState): DollState {
  const { phase } = s.lift;
  const to = (next: Phase, extra?: Partial<Lift>): DollState => ({
    ...s,
    lift: { ...s.lift, phase: next, ...extra },
  });
  if (phase === 'walk') {
    const rider = s.lift.rider as CharId;
    return emit({ ...to('closing'), at: { ...s.at, [rider]: 'lift' } }, 'close');
  }
  if (phase === 'closing') return emit(to('riding', { floor: s.lift.destFloor }), 'ride');
  if (phase === 'riding') return arrive(to('opening'));
  if (phase === 'opening') return to('idle', { rider: null, dest: null });
  return s;
}
