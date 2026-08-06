let context: AudioContext | null = null;

function getContext() {
  context ??= new AudioContext();
  void context.resume();
  return context;
}

function createGain(ctx: AudioContext, peak: number, duration: number, delay = 0) {
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  gain.connect(ctx.destination);
  return gain;
}

type ToneOptions = {
  from: number;
  to: number;
  duration: number;
  peak: number;
  type: OscillatorType;
  delay?: number;
};

function playTone(ctx: AudioContext, { from, to, duration, peak, type, delay = 0 }: ToneOptions) {
  const osc = ctx.createOscillator();
  const start = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(28, to), start + duration);
  osc.connect(createGain(ctx, peak, duration, delay));
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function noiseBuffer(ctx: AudioContext, duration: number) {
  const frames = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  return buffer;
}

function playGrowl(ctx: AudioContext, duration: number, cutoff: number, peak: number) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, duration);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + duration);
  source.connect(filter).connect(createGain(ctx, peak, duration));
  source.start();
}

/** The roar of the final black face - the only sound in the game. */
export function playFinalRoar() {
  const ctx = getContext();
  playTone(ctx, { from: 320, to: 58, duration: 0.7, peak: 0.22, type: 'sawtooth' });
  playTone(ctx, { from: 130, to: 32, duration: 1.4, peak: 0.3, type: 'sawtooth', delay: 0.08 });
  playGrowl(ctx, 1.5, 620, 0.26);
}
