let context: AudioContext | null = null;

function getContext() {
  context ??= new AudioContext();
  void context.resume();
  return context;
}

/** Call from the first user tap so iOS lets sound through. */
export function unlockCrystalAudio() {
  void getContext();
}

function bell(ctx: AudioContext, freq: number, delay: number, peak = 0.16, duration = 0.7) {
  const start = ctx.currentTime + delay;
  for (const [ratio, level] of [
    [1, 1],
    [2, 0.35],
    [3, 0.12],
  ]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * ratio, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak * level, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
}

const PENTATONIC = [523.25, 659.25, 783.99, 880, 1046.5]; // C5 E5 G5 A5 C6

/** Sparkly pickup chime, rising with each letter found. */
export function playKeyChime(step: number) {
  const ctx = getContext();
  const freq = PENTATONIC[Math.min(step, PENTATONIC.length - 1)];
  bell(ctx, freq, 0);
  bell(ctx, freq * 2, 0.09, 0.07, 0.5);
}

/** Low rumble + rising arpeggio as a door slides open. */
export function playDoorOpen() {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(70, start);
  osc.frequency.exponentialRampToValueAtTime(140, start + 0.6);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.12, start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.75);
  [392, 523.25, 659.25].forEach((freq, i) => bell(ctx, freq, 0.12 + i * 0.09, 0.09, 0.4));
}

/** Big happy fanfare for spelling the whole name. */
export function playFanfare() {
  const ctx = getContext();
  const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  melody.forEach((freq, i) => bell(ctx, freq, i * 0.16, 0.15, 0.8));
  [261.63, 329.63, 392].forEach((freq) => bell(ctx, freq, 0.96, 0.1, 1.6));
  [523.25, 659.25, 783.99, 1046.5].forEach((freq) => bell(ctx, freq, 1.05, 0.09, 1.8));
}
