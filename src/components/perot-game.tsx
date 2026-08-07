'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Parrot, type ParrotState } from '@/components/parrot';
import { playAsParrot, primeAudio, startRecording, type Recorder } from '@/lib/parrot-audio';

const THINK_DELAY_MS = 700;
const MIN_CLIP_BYTES = 1200;
const MAX_LISTEN_MS = 6000;

const HINTS: Record<ParrotState, string> = {
  idle: 'tap Perot and say something',
  listening: 'listening... tap again when you are done',
  thinking: 'Perot is thinking...',
  talking: 'Perot says it back!',
  denied: 'Perot needs the microphone - allow it, then try again',
};

export function PerotGame() {
  const [state, setState] = useState<ParrotState>('idle');
  const recorderRef = useRef<Recorder | null>(null);
  const holdingRef = useRef(false);
  const autoStopRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const speakBack = useCallback(
    async (clip: Blob) => {
      const seconds = await playAsParrot(clip);
      setState('talking');
      later(() => setState('idle'), seconds * 1000 + 250);
    },
    [later]
  );

  const finish = useCallback(async () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (!recorder) {
      setState((current) => (current === 'denied' ? current : 'idle'));
      return;
    }
    const clip = await recorder.stop();
    if (clip.size < MIN_CLIP_BYTES) {
      setState('idle');
      return;
    }
    setState('thinking');
    later(() => void speakBack(clip), THINK_DELAY_MS);
  }, [later, speakBack]);

  const begin = useCallback(async () => {
    holdingRef.current = true;
    setState('listening');
    try {
      const recorder = await startRecording();
      if (!holdingRef.current) {
        void recorder.stop();
        setState('idle');
        return;
      }
      recorderRef.current = recorder;
      autoStopRef.current = window.setTimeout(() => void finish(), MAX_LISTEN_MS);
    } catch {
      holdingRef.current = false;
      setState('denied');
    }
  }, [finish]);

  /** One tap starts listening, the next one hands it to the parrot. */
  const toggle = useCallback(() => {
    primeAudio();
    if (holdingRef.current) void finish();
    else if (state !== 'thinking' && state !== 'talking') void begin();
  }, [begin, finish, state]);

  useEffect(() => {
    const timers = timersRef.current;
    const onDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || holdingRef.current) return;
      event.preventDefault();
      primeAudio();
      void begin();
    };
    const onUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      void finish();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      timers.forEach(window.clearTimeout);
    };
  }, [begin, finish]);

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={toggle}
        aria-label={state === 'listening' ? 'Stop listening' : 'Talk to Perot'}
        aria-pressed={state === 'listening'}
        className="touch-manipulation rounded-full transition-transform duration-200 active:scale-95 [@media(hover:hover)]:hover:scale-105"
      >
        <Parrot state={state} listenMs={MAX_LISTEN_MS} />
      </button>
      <p className="min-h-14 max-w-xs px-4 text-center text-lg tracking-wide text-neutral-400 select-none">
        {HINTS[state]}
      </p>
    </div>
  );
}
