import { declareAudioSession } from '@/lib/audio-session';

let context: AudioContext | null = null;
let lastMunch = 0;

function getContext() {
  if (!context) {
    declareAudioSession('playback');
    context = new AudioContext();
  }
  void context.resume();
  return context;
}

/** Call from the Play tap so iOS lets sound through. */
export function unlockWiggleAudio() {
  void getContext();
}

function tone(
  type: OscillatorType,
  from: number,
  to: number,
  delay: number,
  length: number,
  peak: number
) {
  const ctx = getContext();
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

/** Tiny pop per dot, throttled so a pile of dots is a crackle, not a roar. */
export function playMunch() {
  const now = performance.now();
  if (now - lastMunch < 70) return;
  lastMunch = now;
  const pitch = 700 + Math.random() * 500;
  tone('sine', pitch, pitch * 1.6, 0, 0.07, 0.05);
}

/** Big gulp when the player gobbles a whole snake. */
export function playGobble() {
  tone('triangle', 420, 120, 0, 0.25, 0.18);
  tone('sine', 900, 1400, 0.18, 0.12, 0.08);
}

/** Rising sparkle when the super button fires. */
export function playSuper() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone('square', freq, freq * 1.02, i * 0.07, 0.16, 0.05)
  );
}

/** Sad slide down when the player gets gobbled. */
export function playOops() {
  tone('sawtooth', 380, 90, 0, 0.6, 0.08);
}
