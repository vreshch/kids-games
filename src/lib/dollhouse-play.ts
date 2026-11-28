import { HOUSES, SECRET_IDS, type IceColor, type SecretId, type Spot } from './dollhouse-data';
import { emit, type DollState, type Progress } from './dollhouse-state';

const withProgress = (s: DollState, p: Progress): DollState => {
  const progress: DollState['progress'] = [...s.progress];
  progress[s.house] = p;
  return { ...s, progress };
};

export const current = (s: DollState): Progress => s.progress[s.house];

export function tapPresent(s: DollState): DollState {
  const p = current(s);
  if (p.opened >= 3 || p.stage === 3) return s;
  const stage = (p.stage + 1) as Progress['stage'];
  if (stage < 3) return emit(withProgress(s, { ...p, stage }), stage === 1 ? 'wiggle' : 'grow');
  const gift = HOUSES[s.house].items[p.opened];
  return emit(withProgress(s, { ...p, stage, items: [...p.items, gift] }), 'open');
}

export function nextPresent(s: DollState): DollState {
  const p = current(s);
  if (p.stage !== 3) return s;
  return withProgress(s, { ...p, stage: 0, opened: p.opened + 1 });
}

export function tapSecret(s: DollState, id: SecretId): DollState {
  const p = current(s);
  const secret = HOUSES[s.house].secrets.find((x) => x.id === id);
  if (!secret || p.secrets.includes(id)) return s;
  if (secret.needs && !p.items.includes(secret.needs)) {
    return emit(s, id === 'hole' ? 'dark' : 'locked');
  }
  const next = withProgress(s, { ...p, secrets: [...p.secrets, id] });
  const all = s.house === 0 && p.secrets.length + 1 === SECRET_IDS.length;
  if (all && !s.unlocked) return emit({ ...next, unlocked: true }, 'unlock');
  return emit(next, 'secret');
}

export const tapMachine = (s: DollState): DollState => emit({ ...s, cube: true }, 'ice');

export const pickColor = (s: DollState, iceColor: IceColor): DollState =>
  emit({ ...s, iceColor }, 'select');

export const toggleNight = (s: DollState): DollState =>
  emit({ ...s, night: !s.night }, s.night ? 'day' : 'night');

export function switchHouse(s: DollState, index: 0 | 1): DollState {
  if (index === s.house || (index === 1 && !s.unlocked)) return s;
  return emit({ ...s, house: index }, 'house');
}

/** What to sparkle when the child has been looking for a while. */
export type Hint = { kind: 'secret'; id: SecretId } | { kind: 'present' } | null;

export function hintTarget(s: DollState): Hint {
  const p = current(s);
  const open = HOUSES[s.house].secrets.find(
    (x) => !p.secrets.includes(x.id) && (!x.needs || p.items.includes(x.needs))
  );
  if (open) return { kind: 'secret', id: open.id };
  return p.opened < 3 ? { kind: 'present' } : null;
}

export const presentSpot = (s: DollState): Spot | null => {
  const p = current(s);
  return p.opened < 3 ? HOUSES[s.house].presents[p.opened] : null;
};
