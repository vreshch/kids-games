'use client';

import { Canvas } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';

import { playDoorOpen, playFanfare, playKeyChime, unlockCrystalAudio } from '@/lib/crystal-audio';
import { buildLevel, WORDS, type Level } from '@/lib/crystal-rooms-level';
import { primeSpeech, speakLetter, speakWord } from '@/lib/crystal-speech';

import { TouchJoystick, useKeyboardInput, type MoveInput } from './controls';
import { KeyCrystal } from './key-crystal';
import { Player } from './player';
import { World } from './world';

let lastWord = '';

function pickWord() {
  const pool = WORDS.filter((word) => word !== lastWord);
  lastWord = pool[Math.floor(Math.random() * pool.length)];
  return lastWord;
}

function LetterHud({ level, collected }: { level: Level; collected: number[] }) {
  return (
    <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
      {level.rooms.map((room) => {
        const found = collected.includes(room.id);
        return (
          <div
            key={room.id}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl font-bold transition-all duration-300 sm:h-12 sm:w-12 sm:text-2xl ${
              found ? 'scale-100' : 'scale-90 border-white/15 bg-black/30 text-white/25'
            }`}
            style={
              found
                ? { borderColor: room.color, background: `${room.color}33`, color: room.color }
                : undefined
            }
          >
            {room.letter}
          </div>
        );
      })}
    </div>
  );
}

function GameRun({ onRestart }: { onRestart: () => void }) {
  const input = useRef<MoveInput>({ x: 0, z: 0 });
  const [word, setWord] = useState<string | null>(null);
  const [collected, setCollected] = useState<number[]>([]);
  const started = word !== null;
  const level = useMemo(() => buildLevel(word ?? WORDS[0]), [word]);
  const won = started && collected.length === level.rooms.length;
  useKeyboardInput(input);

  const onCollect = useCallback(
    (roomId: number) => {
      setCollected((prev) => {
        if (prev.includes(roomId)) return prev;
        playKeyChime(prev.length);
        setTimeout(() => speakLetter(level.rooms[roomId].letter), 350);
        if (roomId < level.rooms.length - 1) setTimeout(playDoorOpen, 1000);
        if (prev.length + 1 === level.rooms.length) {
          setTimeout(playFanfare, 900);
          setTimeout(() => speakWord(level.word), 2400);
        }
        return [...prev, roomId];
      });
    },
    [level]
  );

  return (
    <div className="relative w-full flex-1 self-stretch overflow-hidden bg-[#0b1120]">
      <Canvas
        key={level.word}
        className="absolute inset-0"
        camera={{ position: [0, 6.5, 10.4], fov: 55 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <World level={level} unlockedDoors={collected} won={won} />
        {level.rooms.map((room) => (
          <KeyCrystal key={room.id} room={room} collected={collected.includes(room.id)} />
        ))}
        <Player
          level={level}
          input={input}
          collected={collected}
          onCollect={onCollect}
          frozen={!started || won}
        />
      </Canvas>

      <TouchJoystick input={input} />
      <LetterHud level={level} collected={collected} />

      {!started && (
        <button
          type="button"
          className="absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            unlockCrystalAudio();
            primeSpeech();
            setWord(pickWord());
          }}
        >
          <span className="text-3xl font-bold text-white sm:text-4xl">Crystal Rooms</span>
          <span className="max-w-xs px-6 text-center text-base text-neutral-300">
            Find the glowing letter crystals, open the doors, spell the secret word!
          </span>
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-teal-400/40 transition active:scale-90">
            ▶
          </span>
          <span className="text-sm text-neutral-400">drag to walk &middot; or use arrow keys</span>
        </button>
      )}

      {won && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40">
          <div className="flex gap-2">
            {level.rooms.map((room, i) => (
              <span
                key={i}
                className="animate-bounce text-5xl font-bold sm:text-6xl"
                style={{ color: room.color, animationDelay: `${i * 120}ms` }}
              >
                {room.letter}
              </span>
            ))}
          </div>
          <span className="text-2xl font-semibold text-white">You spelled {level.word}! 🎉</span>
          <button
            type="button"
            className="pointer-events-auto mt-2 touch-manipulation rounded-full bg-teal-400 px-8 py-3 text-lg font-semibold text-neutral-950 shadow-lg shadow-teal-400/40 transition active:scale-95"
            onClick={onRestart}
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}

export function CrystalRoomsGame() {
  const [runId, setRunId] = useState(0);
  return <GameRun key={runId} onRestart={() => setRunId((n) => n + 1)} />;
}
