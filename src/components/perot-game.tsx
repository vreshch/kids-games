'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Parrot, type ParrotState } from '@/components/parrot';
import { playAsParrot, startRecording, type Recorder } from '@/lib/parrot-audio';

const THINK_DELAY_MS = 700;
const MIN_CLIP_BYTES = 1200;

const HINTS: Record<ParrotState, string> = {
  idle: 'hold SPACE and say something',
  listening: 'listening... keep holding SPACE',
  thinking: 'Perot is thinking...',
  talking: 'Perot says it back!',
  denied: 'Perot needs the microphone - allow it, then try again',
};

export function PerotGame() {
  const [state, setState] = useState<ParrotState>('idle');
  const recorderRef = useRef<Recorder | null>(null);
  const holdingRef = useRef(false);
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
    } catch {
      setState('denied');
    }
  }, []);

  const finish = useCallback(async () => {
    holdingRef.current = false;
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

  useEffect(() => {
    const timers = timersRef.current;
    const onDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || holdingRef.current) return;
      event.preventDefault();
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
    <div className="flex flex-col items-center gap-8">
      <Parrot state={state} />
      <p className="h-6 text-lg tracking-wide text-neutral-400 select-none">{HINTS[state]}</p>
    </div>
  );
}
