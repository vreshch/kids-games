import { declareAudioSession } from '@/lib/audio-session';

export type Recorder = {
  stop: () => Promise<Blob>;
};

export type MicPermission = 'granted' | 'prompt' | 'denied' | 'unknown';

export type MicFailure = 'denied' | 'no-mic' | 'mic-busy' | 'unsupported';

let context: AudioContext | null = null;

function getContext() {
  if (!context) {
    declareAudioSession('play-and-record');
    context = new AudioContext();
  }
  void context.resume();
  return context;
}

/** iOS only unlocks audio inside the tap itself, so call this from the handler. */
export function primeAudio() {
  getContext();
}

/** Firefox does not know the 'microphone' permission name, hence 'unknown'. */
export async function queryMicPermission(): Promise<MicPermission> {
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return status.state;
  } catch {
    return 'unknown';
  }
}

export function recordingFailure(error: unknown): MicFailure {
  if (error instanceof Error && error.message === 'unsupported') return 'unsupported';
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-mic';
  if (name === 'NotReadableError' || name === 'AbortError') return 'mic-busy';
  return 'denied';
}

/** Starts capturing the microphone; resolve the returned stop() to get the clip. */
export async function startRecording(): Promise<Recorder> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  recorder.start();

  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };
        recorder.stop();
      }),
  };
}

function squawkCurve() {
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i += 1) {
    const x = (i / 255) * 2 - 1;
    curve[i] = Math.tanh(x * 2.6);
  }
  return curve;
}

function buildSquawkChain(ctx: AudioContext) {
  const shaper = ctx.createWaveShaper();
  shaper.curve = squawkCurve();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1700;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.value = 1.6;
  shaper.connect(filter).connect(gain).connect(ctx.destination);
  return shaper;
}

/** Plays a recorded clip back as a parrot would: higher, faster, a bit squawky. */
export async function playAsParrot(clip: Blob): Promise<number> {
  const ctx = getContext();
  const buffer = await ctx.decodeAudioData(await clip.arrayBuffer());
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 1.45;
  source.connect(buildSquawkChain(ctx));
  source.start();
  return buffer.duration / source.playbackRate.value;
}
