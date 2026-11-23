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

/** Call from the Play tap so iOS lets sound through. */
export function unlockTankAudio() {
  void getContext();
}

type Tone = {
  type: OscillatorType;
  from: number;
  to: number;
  at?: number;
  len: number;
  peak: number;
};

function tone({ type, from, to, at = 0, len, peak }: Tone) {
  const ctx = getContext();
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + len);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + len);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + len + 0.05);
}

const melody = (notes: number[], gap: number) =>
  notes.forEach((freq, i) =>
    tone({ type: 'square', from: freq, to: freq * 1.02, at: i * gap, len: 0.18, peak: 0.05 })
  );

export const playShot = () => tone({ type: 'square', from: 620, to: 180, len: 0.09, peak: 0.04 });
export const playBrick = () => tone({ type: 'triangle', from: 240, to: 80, len: 0.12, peak: 0.1 });
export const playClang = () =>
  tone({ type: 'square', from: 1500, to: 1100, len: 0.05, peak: 0.03 });
export const playHurt = () => tone({ type: 'triangle', from: 500, to: 300, len: 0.1, peak: 0.08 });
export const playHeart = () => melody([659.25, 880, 1174.66], 0.08);
export const playClear = () => melody([523.25, 659.25, 783.99, 1046.5], 0.1);
export const playWon = () => melody([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5], 0.12);
export const playOver = () => tone({ type: 'sawtooth', from: 380, to: 70, len: 0.8, peak: 0.08 });

export function playBoom() {
  tone({ type: 'sawtooth', from: 220, to: 40, len: 0.35, peak: 0.12 });
  tone({ type: 'square', from: 90, to: 30, len: 0.3, peak: 0.08 });
}
