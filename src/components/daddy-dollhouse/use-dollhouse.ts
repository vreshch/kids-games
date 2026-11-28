'use client';

import { useEffect, useReducer, useRef, useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import { SOUNDS, unlockDollhouseAudio } from '@/lib/dollhouse-audio';
import { current, hintTarget } from '@/lib/dollhouse-play';
import { reduce } from '@/lib/dollhouse-reducer';
import { loadSave, writeSave } from '@/lib/dollhouse-save';
import { createState, type EventKind, type Phase } from '@/lib/dollhouse-state';

const GAME = { game: 'daddy-dollhouse' };
const PHASE_MS: Record<Phase, number> = {
  idle: 0,
  walk: 650,
  closing: 550,
  riding: 1300,
  opening: 700,
};
const HINT_MS = 20_000;
const TRACKED: Partial<Record<EventKind, string>> = {
  secret: 'secret_found',
  unlock: 'house_unlocked',
  open: 'present_opened',
  night: 'party_start',
};

export function useDollhouse() {
  const [state, dispatch] = useReducer(reduce, undefined, () => createState());
  const [hintFor, setHintFor] = useState('');
  const started = useRef(false);
  const { phase } = state.lift;
  const progress = current(state);
  const progressKey = `${state.house}:${progress.secrets.length}:${progress.opened}:${progress.stage}`;

  useEffect(() => {
    const saved = loadSave();
    if (saved) dispatch({ type: 'load', saved });
  }, []);

  useEffect(() => writeSave(state), [state.house, state.unlocked, state.progress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const { kind, n } = state.event;
    if (n === 0) return;
    SOUNDS[kind === 'hop' ? 'hop' : kind]();
    const tracked = TRACKED[kind];
    if (tracked) trackEvent(tracked, GAME);
  }, [state.event]);

  useEffect(() => {
    if (phase === 'idle') return;
    const timer = setTimeout(() => dispatch({ type: 'advance' }), PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (progress.stage !== 3) return;
    const timer = setTimeout(() => dispatch({ type: 'nextPresent' }), 2200);
    return () => clearTimeout(timer);
  }, [progress.stage]);

  useEffect(() => {
    const timer = setTimeout(() => setHintFor(progressKey), HINT_MS);
    return () => clearTimeout(timer);
  }, [progressKey]);

  const onFirstTap = () => {
    unlockDollhouseAudio();
    if (started.current) return;
    started.current = true;
    trackEvent('game_start', GAME);
  };

  return { state, dispatch, hint: hintFor === progressKey ? hintTarget(state) : null, onFirstTap };
}
