import { declareAudioSession } from '@/lib/audio-session';

let context: AudioContext | null = null;

function getContext() {
  if (!context) {
    declareAudioSession('playback');
    context = new AudioContext();
  }
  void context.resume();
  return context;
}

/** Call from the first tap so iOS lets sound through. */
export function unlockDollhouseAudio() {
  void getContext();
}

type Tone = { type?: OscillatorType; from: number; to?: number; at?: number; len: number };

function tone({ type = 'sine', from, to = from, at = 0, len }: Tone) {
  const ctx = getContext();
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + len);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.06, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + len);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + len + 0.05);
}

const melody = (notes: number[], gap: number, type: OscillatorType = 'triangle') =>
  notes.forEach((from, i) => tone({ type, from, at: i * gap, len: 0.22 }));

export const SOUNDS = {
  select: () => tone({ from: 660, to: 880, len: 0.1 }),
  hop: () => tone({ from: 400, to: 700, len: 0.14 }),
  walk: () => melody([440, 494], 0.12),
  close: () => tone({ from: 300, to: 220, len: 0.2 }),
  ride: () => tone({ from: 140, to: 260, len: 1.1 }),
  ding: () => melody([1318.5, 1046.5], 0.16, 'sine'),
  wiggle: () => melody([523, 659, 523], 0.08),
  grow: () => tone({ from: 300, to: 700, len: 0.3 }),
  open: () => melody([523, 659, 784, 1046], 0.09),
  secret: () => melody([523, 659, 784, 1046, 1318], 0.09),
  unlock: () => melody([523, 659, 784, 1046, 1318, 1568], 0.1),
  locked: () => tone({ from: 220, to: 180, len: 0.2 }),
  dark: () => tone({ from: 200, to: 160, len: 0.25 }),
  ice: () => melody([1568, 2093], 0.06, 'sine'),
  cheer: () => melody([784, 988, 1175, 988, 1319], 0.07),
  night: () => melody([392, 330, 262], 0.14),
  day: () => melody([262, 330, 392], 0.14),
  house: () => melody([440, 554], 0.1),
};
