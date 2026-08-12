'use client';

import { Canvas } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';

import { playDoorOpen, playFanfare, playKeyChime, unlockCrystalAudio } from '@/lib/crystal-audio';
import { LETTERS, ROOMS } from '@/lib/crystal-rooms-level';

import { TouchJoystick, useKeyboardInput, type MoveInput } from './controls';
import { KeyCrystal } from './key-crystal';
import { Player } from './player';
import { World } from './world';

function LetterHud({ collected }: { collected: number[] }) {
  return (
    <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
      {ROOMS.map((room) => {
        const found = collected.includes(room.id);
        return (
          <div
            key={room.id}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl font-bold transition-all duration-300 sm:h-12 sm:w-12 sm:text-2xl ${
              found ? 'scale-100 text-white' : 'scale-90 border-white/15 bg-black/30 text-white/25'
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
  const [started, setStarted] = useState(false);
  const [collected, setCollected] = useState<number[]>([]);
  const won = collected.length === ROOMS.length;
  useKeyboardInput(input);

  const onCollect = useCallback((roomId: number) => {
    setCollected((prev) => {
      if (prev.includes(roomId)) return prev;
      playKeyChime(prev.length);
      if (roomId < ROOMS.length - 1) setTimeout(playDoorOpen, 450);
      if (prev.length + 1 === ROOMS.length) setTimeout(playFanfare, 500);
      return [...prev, roomId];
    });
  }, []);

  return (
    <div className="relative w-full flex-1 self-stretch overflow-hidden bg-[#0b1120]">
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 6.5, 10.4], fov: 55 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <World unlockedDoors={collected} won={won} />
        {ROOMS.map((room) => (
          <KeyCrystal key={room.id} room={room} collected={collected.includes(room.id)} />
        ))}
        <Player
          input={input}
          collected={collected}
          onCollect={onCollect}
          frozen={!started || won}
        />
      </Canvas>

      <TouchJoystick input={input} />
      <LetterHud collected={collected} />

      {!started && (
        <button
          type="button"
          className="absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            unlockCrystalAudio();
            setStarted(true);
          }}
        >
          <span className="text-3xl font-bold text-white sm:text-4xl">Crystal Rooms</span>
          <span className="max-w-xs px-6 text-center text-base text-neutral-300">
            Find the glowing letter crystals to open the doors and spell your name!
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
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className="animate-bounce text-5xl font-bold sm:text-6xl"
                style={{ color: ROOMS[i].color, animationDelay: `${i * 120}ms` }}
              >
                {letter}
              </span>
            ))}
          </div>
          <span className="text-2xl font-semibold text-white">You did it! 🎉</span>
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
