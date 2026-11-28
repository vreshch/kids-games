'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { trackEvent } from '@/lib/analytics';
import { playGobble, playMunch, playOops } from '@/lib/wiggle-audio';
import type { NetEvent } from '@/lib/wiggle-net';
import { loadBest, recordBest } from '@/lib/wiggle-skins';

import type { Ending } from './overlays';

const noSubscribe = () => () => {};

/** Sounds, the "you gobbled" toast and the ending, for the snake in seat `me()`. */
export function useFeedback(me: () => number, onOver: () => void) {
  // server and first client paint agree on the default; the saved value lands right after
  const savedBest = useSyncExternalStore(noSubscribe, loadBest, () => 0);
  const [newBest, setBest] = useState<number | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const onEvent = (event: NetEvent) => {
    const mine = (seat: number | null) => seat === me();
    if (event.type === 'munch') {
      if (mine(event.snake.seat)) playMunch();
      return;
    }
    if (mine(event.eater.seat)) {
      playGobble();
      setToast({ id: event.victim.id, text: `You gobbled ${event.victim.name}! 😋` });
    }
    if (mine(event.victim.seat)) {
      playOops();
      const length = Math.round(event.victim.mass);
      const record = length > loadBest();
      const topLength = recordBest(length);
      setBest(topLength);
      setEnding({ by: event.eater.name, length, best: topLength, record });
      onOver();
      trackEvent('game_over', { game: 'wiggle-snakes', length: String(length) });
    }
  };

  return { best: newBest ?? savedBest, ending, toast, onEvent, clearEnding: () => setEnding(null) };
}
