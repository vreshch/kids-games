import { HOUSES, SECRET_IDS, type SecretId } from './dollhouse-data';
import { type createState, type Progress, type Saved } from './dollhouse-state';

const STORAGE_KEY = 'daddy-dollhouse';

function cleanProgress(raw: unknown, house: 0 | 1): Progress {
  const data = (raw ?? {}) as { items?: unknown; secrets?: unknown };
  const count = Array.isArray(data.items) ? Math.min(data.items.length, 3) : 0;
  const secrets = Array.isArray(data.secrets)
    ? [...new Set(data.secrets.filter((id): id is SecretId => SECRET_IDS.includes(id)))]
    : [];
  return { opened: count, stage: 0, items: HOUSES[house].items.slice(0, count), secrets };
}

/** Anything odd in the stored text falls back to a fresh game. */
export function parseSave(raw: string | null): Saved | undefined {
  if (!raw) return undefined;
  try {
    const data = JSON.parse(raw) as { house?: unknown; unlocked?: unknown; progress?: unknown };
    const list = Array.isArray(data.progress) ? data.progress : [];
    const progress: Saved['progress'] = [cleanProgress(list[0], 0), cleanProgress(list[1], 1)];
    const unlocked = data.unlocked === true || progress[0].secrets.length === SECRET_IDS.length;
    return { progress, unlocked, house: unlocked && data.house === 1 ? 1 : 0 };
  } catch {
    return undefined;
  }
}

export function loadSave(): Saved | undefined {
  try {
    return parseSave(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

export function writeSave(state: ReturnType<typeof createState>) {
  const saved: Saved = { house: state.house, unlocked: state.unlocked, progress: state.progress };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // storage may be blocked (private mode) - the game still plays this run
  }
}
