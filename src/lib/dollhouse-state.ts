import {
  START_ROOMS,
  type CharId,
  type Floor,
  type IceColor,
  type ItemId,
  type RoomId,
  type SecretId,
} from './dollhouse-data';

export type Phase = 'idle' | 'walk' | 'closing' | 'riding' | 'opening';
export type Lift = {
  floor: Floor;
  phase: Phase;
  rider: CharId | null;
  dest: RoomId | null;
  destFloor: Floor;
};
export type Progress = {
  opened: number;
  stage: 0 | 1 | 2 | 3;
  items: ItemId[];
  secrets: SecretId[];
};
export type EventKind =
  | 'select'
  | 'hop'
  | 'walk'
  | 'close'
  | 'ride'
  | 'ding'
  | 'wiggle'
  | 'grow'
  | 'open'
  | 'secret'
  | 'locked'
  | 'dark'
  | 'ice'
  | 'cheer'
  | 'night'
  | 'day'
  | 'unlock'
  | 'house';
export type Moved = { id: CharId; from: -1 | 0 | 1; n: number };

export type DollState = {
  house: 0 | 1;
  unlocked: boolean;
  night: boolean;
  selected: CharId | null;
  at: Record<CharId, RoomId | 'lift'>;
  lift: Lift;
  moved: Moved | null;
  progress: [Progress, Progress];
  iceColor: IceColor;
  cube: boolean;
  holding: boolean;
  treats: Partial<Record<CharId, IceColor>>;
  cheer: { id: CharId; n: number } | null;
  event: { kind: EventKind; n: number };
};

export type Saved = Pick<DollState, 'house' | 'unlocked' | 'progress'>;

export type Action =
  | { type: 'select'; id: CharId }
  | { type: 'room'; room: RoomId }
  | { type: 'elevator' }
  | { type: 'advance' }
  | { type: 'present' }
  | { type: 'nextPresent' }
  | { type: 'secret'; id: SecretId }
  | { type: 'machine' }
  | { type: 'cube' }
  | { type: 'iceColor'; color: IceColor }
  | { type: 'night' }
  | { type: 'house'; index: 0 | 1 }
  | { type: 'load'; saved: Saved };

const fresh = (): Progress => ({ opened: 0, stage: 0, items: [], secrets: [] });

export function createState(saved?: Saved): DollState {
  return {
    house: saved?.house ?? 0,
    unlocked: saved?.unlocked ?? false,
    night: false,
    selected: null,
    at: { ...START_ROOMS },
    lift: { floor: 0, phase: 'idle', rider: null, dest: null, destFloor: 0 },
    moved: null,
    progress: saved?.progress ?? [fresh(), fresh()],
    iceColor: 'blue',
    cube: false,
    holding: false,
    treats: {},
    cheer: null,
    event: { kind: 'select', n: 0 },
  };
}

export const emit = (s: DollState, kind: EventKind): DollState => ({
  ...s,
  event: { kind, n: s.event.n + 1 },
});

export const busy = (s: DollState) => s.lift.phase !== 'idle';

function giveIce(s: DollState, id: CharId): DollState {
  const treats = { ...s.treats, [id]: s.iceColor };
  const cheer = { id, n: (s.cheer?.n ?? 0) + 1 };
  return emit(
    { ...s, cube: false, holding: false, selected: null, treats, cheer, moved: null },
    'cheer'
  );
}

export function select(s: DollState, id: CharId): DollState {
  if (s.cube && s.holding) return giveIce(s, id);
  if (s.at[id] === 'lift') return s;
  return emit({ ...s, selected: s.selected === id ? null : id }, 'select');
}
