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

/** One soft triangle blip; every sound in the game is built from these. */
export function beep(freq: number, length = 0.15) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length);
    osc.stop(ctx.currentTime + length);
  } catch {
    // no WebAudio (old browser, test runner) - the game stays silent
  }
}

export function playFound() {
  [523, 659, 784, 1047].forEach((freq, i) => setTimeout(() => beep(freq, 0.25), i * 130));
}
