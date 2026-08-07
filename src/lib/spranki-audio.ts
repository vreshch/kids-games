export type Loop = { stop: () => void };

let context: AudioContext | null = null;

function getContext() {
  context ??= new AudioContext();
  void context.resume();
  return context;
}

/** iOS only unlocks audio inside the tap itself, so call this from the handler. */
export function primeAudio() {
  getContext();
}

/**
 * One voice: a tone whose volume is swung by a slow oscillator, so it pulses on
 * its own with no scheduler. Every voice starts on the same beat grid, which is
 * what makes two of them sound like one track.
 */
export function startLoop(frequency: number, pulsesPerSecond: number, level: number): Loop {
  const ctx = getContext();

  const tone = ctx.createOscillator();
  tone.type = 'triangle';
  tone.frequency.value = frequency;

  const swell = ctx.createGain();
  swell.gain.value = level;

  const pulse = ctx.createOscillator();
  pulse.type = 'triangle';
  pulse.frequency.value = pulsesPerSecond;
  const depth = ctx.createGain();
  depth.gain.value = level;
  pulse.connect(depth).connect(swell.gain);

  const out = ctx.createGain();
  out.gain.value = 0;
  tone.connect(swell).connect(out).connect(ctx.destination);

  const start = Math.ceil(ctx.currentTime * pulsesPerSecond) / pulsesPerSecond;
  tone.start(start);
  pulse.start(start);
  out.gain.setTargetAtTime(1, start, 0.05);

  return {
    stop: () => {
      const end = ctx.currentTime + 0.12;
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      tone.stop(end);
      pulse.stop(end);
    },
  };
}
