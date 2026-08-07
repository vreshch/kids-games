'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { type Loop, primeAudio, startLoop } from '@/lib/spranki-audio';

type Character = {
  id: string;
  name: string;
  color: string;
  frequency: number;
  pulsesPerSecond: number;
  level: number;
};

/** Placeholder cast - the real Spranki characters go here. */
const CAST: Character[] = [
  { id: 'boom', name: 'Boom', color: '#ef4444', frequency: 98, pulsesPerSecond: 1, level: 0.1 },
  { id: 'bass', name: 'Bass', color: '#a855f7', frequency: 147, pulsesPerSecond: 2, level: 0.08 },
  { id: 'hum', name: 'Hum', color: '#0ea5e9', frequency: 294, pulsesPerSecond: 4, level: 0.05 },
  { id: 'ping', name: 'Ping', color: '#facc15', frequency: 587, pulsesPerSecond: 8, level: 0.03 },
];

function Blob({ character, active }: { character: Character; active: boolean }) {
  return (
    <svg viewBox="0 0 100 120" className="w-full" role="img" aria-label={character.name}>
      <ellipse cx={50} cy={112} rx={26} ry={5} fill="#000" opacity={active ? 0.5 : 0.25} />
      <rect
        x={18}
        y={26}
        width={64}
        height={80}
        rx={30}
        fill={character.color}
        opacity={active ? 1 : 0.35}
      />
      <circle cx={38} cy={58} r={8} fill="#fffdf5" />
      <circle cx={62} cy={58} r={8} fill="#fffdf5" />
      <circle cx={38} cy={58} r={active ? 3.5 : 4} fill="#1a1a1a" />
      <circle cx={62} cy={58} r={active ? 3.5 : 4} fill="#1a1a1a" />
      {active ? (
        <ellipse cx={50} cy={82} rx={10} ry={12} fill="#1a1a1a" />
      ) : (
        <path d="M 40 84 Q 50 90 60 84" fill="none" stroke="#1a1a1a" strokeWidth={4} />
      )}
    </svg>
  );
}

export function SprankiGame() {
  const [active, setActive] = useState<string[]>([]);
  const loopsRef = useRef(new Map<string, Loop>());

  const toggle = useCallback((character: Character) => {
    primeAudio();
    const loops = loopsRef.current;
    const running = loops.get(character.id);
    if (running) {
      running.stop();
      loops.delete(character.id);
      setActive((current) => current.filter((id) => id !== character.id));
      return;
    }
    loops.set(
      character.id,
      startLoop(character.frequency, character.pulsesPerSecond, character.level)
    );
    setActive((current) => [...current, character.id]);
  }, []);

  useEffect(() => {
    const loops = loopsRef.current;
    return () => {
      loops.forEach((loop) => loop.stop());
      loops.clear();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <ul className="grid w-[min(88vw,26rem)] grid-cols-2 gap-4 sm:grid-cols-4">
        {CAST.map((character) => {
          const isActive = active.includes(character.id);
          return (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => toggle(character)}
                aria-pressed={isActive}
                className={`w-full touch-manipulation rounded-2xl p-2 transition-transform duration-200 active:scale-95 [@media(hover:hover)]:hover:scale-105 ${
                  isActive ? 'animate-bob' : ''
                }`}
                style={{ filter: isActive ? `drop-shadow(0 0 14px ${character.color})` : 'none' }}
              >
                <Blob character={character} active={isActive} />
                <span className="mt-1 block text-sm text-neutral-400">{character.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="max-w-xs px-4 text-center text-lg tracking-wide text-neutral-400 select-none">
        {active.length === 0
          ? 'tap a character to start the beat'
          : 'stack them up - tap again to stop one'}
      </p>
      <p className="text-sm text-neutral-600 select-none">placeholder - the real game comes next</p>
    </div>
  );
}
