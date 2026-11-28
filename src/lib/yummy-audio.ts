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
export function unlockYummyAudio() {
  void getContext();
}

type Tone = { type: OscillatorType; from: number; to: number; at?: number; len: number };

function tone({ type, from, to, at = 0, len }: Tone) {
  const ctx = getContext();
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + len);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + len);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + len + 0.05);
}

const melody = (notes: number[], gap: number) =>
  notes.forEach((freq, i) =>
    tone({ type: 'triangle', from: freq, to: freq * 1.02, at: i * gap, len: 0.2 })
  );

export const playPlop = () => tone({ type: 'sine', from: 520, to: 260, len: 0.12 });
export const playYuck = () => tone({ type: 'sawtooth', from: 180, to: 90, len: 0.25 });
export const playGiggle = () => melody([880, 1046.5, 880, 1174.66], 0.07);
export const playSecret = () => melody([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.09);
export const playPerfect = () => melody([659.25, 783.99, 1046.5, 1318.5], 0.1);
export const playGood = () => melody([659.25, 783.99, 1046.5], 0.1);
export const playOops = () => tone({ type: 'sawtooth', from: 500, to: 80, len: 0.6 });

/** Says a line out loud, so the game works for a child who cannot read yet. */
export function say(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.4;
  synth.speak(utterance);
}
