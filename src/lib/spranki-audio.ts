import type { Character } from '@/lib/sprunki-cast';

const BPM = 100;
const STEPS = 16;
const STEP_SECONDS = 60 / BPM / 4;
const LOOKAHEAD_SECONDS = 0.15;
const TICK_MS = 25;

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let timer: number | null = null;
let step = 0;
let nextStepAt = 0;

/** Every character on stage plays off this one clock, so the bar always lines up. */
const playing = new Map<number, Character>();

function getContext() {
  context ??= new AudioContext();
  void context.resume();
  return context;
}

/** iOS only unlocks audio inside the tap itself, so call this from the handler. */
export function primeAudio() {
  getContext();
}

function noiseBuffer(ctx: AudioContext) {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return noise;
}

function envelope(ctx: AudioContext, at: number, peak: number, decay: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  gain.connect(ctx.destination);
  return gain;
}

function burst(ctx: AudioContext, at: number, cutoff: number, decay: number, peak: number) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = cutoff;
  source.connect(filter).connect(envelope(ctx, at, peak, decay));
  source.start(at);
  source.stop(at + decay);
}

function tone(
  ctx: AudioContext,
  at: number,
  wave: OscillatorType,
  frequency: number,
  decay: number,
  peak: number
) {
  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.setValueAtTime(frequency, at);
  osc.connect(envelope(ctx, at, peak, decay));
  osc.start(at);
  osc.stop(at + decay + 0.02);
  return osc;
}

/** One character's hit for this step. Each kind has its own shape, so voices stay apart. */
function playHit(ctx: AudioContext, character: Character, semitone: number, at: number) {
  const frequency = character.frequency * 2 ** ((semitone - 1) / 12);

  if (character.kind === 'kick') {
    const osc = tone(ctx, at, 'sine', character.frequency, 0.22, 0.9);
    osc.frequency.exponentialRampToValueAtTime(character.frequency * 0.4, at + 0.16);
    return;
  }
  if (character.kind === 'snare') {
    burst(ctx, at, 1400, 0.14, 0.35);
    tone(ctx, at, 'triangle', character.frequency, 0.09, 0.25);
    return;
  }
  if (character.kind === 'hat') {
    burst(ctx, at, 7000, 0.045, 0.16);
    return;
  }
  if (character.kind === 'blip') {
    tone(ctx, at, 'square', frequency, 0.1, 0.12);
    return;
  }
  if (character.kind === 'note') {
    tone(ctx, at, 'triangle', frequency, 0.32, 0.22);
    return;
  }
  tone(ctx, at, 'sine', frequency, 0.9, 0.16);
}

function tick() {
  const ctx = getContext();
  while (nextStepAt < ctx.currentTime + LOOKAHEAD_SECONDS) {
    playing.forEach((character) => {
      const semitone = character.pattern[step];
      if (semitone) playHit(ctx, character, semitone, nextStepAt);
    });
    step = (step + 1) % STEPS;
    nextStepAt += STEP_SECONDS;
  }
}

/** Puts a character on the clock; the returned stop() takes it off again. */
export function startVoice(slot: number, character: Character) {
  const ctx = getContext();
  playing.set(slot, character);

  if (timer === null) {
    step = 0;
    nextStepAt = ctx.currentTime + 0.1;
    timer = window.setInterval(tick, TICK_MS);
    tick();
  }

  return {
    stop: () => {
      playing.delete(slot);
      if (playing.size === 0 && timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    },
  };
}

export type Loop = ReturnType<typeof startVoice>;
