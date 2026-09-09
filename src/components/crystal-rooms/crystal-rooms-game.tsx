'use client';

import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import { playDoorOpen, playFanfare, playKeyChime, unlockCrystalAudio } from '@/lib/crystal-audio';
import { HATS, loadLook, OUTFITS, saveLook, type PlayerLook } from '@/lib/crystal-player-look';
import { buildLevel, wordPoolForLevel, type Level } from '@/lib/crystal-rooms-level';
import { primeSpeech, speakLetter, speakWord } from '@/lib/crystal-speech';

import { TouchJoystick, useKeyboardInput, type MoveInput } from './controls';
import { KeyCrystal } from './key-crystal';
import { Player } from './player';
import { World } from './world';

let lastWord = '';

function pickWord(levelNum: number) {
  const all = wordPoolForLevel(levelNum);
  const pool = all.length > 1 ? all.filter((word) => word !== lastWord) : all;
  lastWord = pool[Math.floor(Math.random() * pool.length)];
  return lastWord;
}

function LetterHud({ level, collected }: { level: Level; collected: number[] }) {
  const compact = level.rooms.length > 6;
  return (
    <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
      {level.rooms.map((room) => {
        const found = collected.includes(room.id);
        return (
          <div
            key={room.id}
            className={`flex items-center justify-center rounded-xl border-2 font-bold transition-all duration-300 ${
              compact
                ? 'h-8 w-8 text-base sm:h-10 sm:w-10 sm:text-xl'
                : 'h-10 w-10 text-xl sm:h-12 sm:w-12 sm:text-2xl'
            } ${found ? 'scale-100' : 'scale-90 border-white/15 bg-black/30 text-white/25'}`}
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

function LookPicker({ look, onChange }: { look: PlayerLook; onChange: (l: PlayerLook) => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2.5">
        {OUTFITS.map((o) => (
          <button
            key={o.color}
            type="button"
            suppressHydrationWarning
            aria-label={`${o.name} outfit`}
            className={`h-9 w-9 touch-manipulation rounded-full border-2 transition active:scale-90 ${
              look.outfit === o.color ? 'scale-110 border-white' : 'border-white/25'
            }`}
            style={{ background: o.color }}
            onClick={() => onChange({ ...look, outfit: o.color })}
          />
        ))}
      </div>
      <div className="flex gap-2">
        {HATS.map((h) => (
          <button
            key={h.id}
            type="button"
            suppressHydrationWarning
            aria-label={h.name}
            className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl border-2 text-2xl transition active:scale-90 ${
              look.hat === h.id ? 'border-teal-300 bg-teal-300/20' : 'border-white/15 bg-white/5'
            }`}
            onClick={() => onChange({ ...look, hat: h.id })}
          >
            {h.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

const isTouchDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

type RunProps = {
  levelNum: number;
  look: PlayerLook;
  onLook: (l: PlayerLook) => void;
  onNext: () => void;
};

function GameRun({ levelNum, look, onLook, onNext }: RunProps) {
  const input = useRef<MoveInput>({ x: 0, z: 0 });
  const [word, setWord] = useState<string | null>(() => (levelNum > 1 ? pickWord(levelNum) : null));
  const [collected, setCollected] = useState<number[]>([]);
  const started = word !== null;
  const level = useMemo(
    () => buildLevel(word ?? wordPoolForLevel(levelNum)[0], levelNum),
    [word, levelNum]
  );
  const won = started && collected.length === level.rooms.length;
  const touch = useMemo(() => isTouchDevice(), []);
  useKeyboardInput(input);

  useEffect(() => {
    if (levelNum > 1 && word) {
      trackEvent('game_start', { game: 'crystal-rooms', word, level: String(levelNum) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          trackEvent('game_complete', {
            game: 'crystal-rooms',
            word: level.word,
            level: String(levelNum),
          });
        }
        return [...prev, roomId];
      });
    },
    [level, levelNum]
  );

  return (
    <div className="relative w-full flex-1 self-stretch overflow-hidden bg-[#0b1120]">
      <Canvas
        key={level.word}
        className="absolute inset-0"
        camera={{ position: [0, 6.5, 10.4], fov: 55 }}
        dpr={[1, touch ? 1.35 : 1.75]}
        gl={{ antialias: !touch, powerPreference: 'high-performance' }}
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
          look={look}
        />
      </Canvas>

      <TouchJoystick input={input} />
      <LetterHud level={level} collected={collected} />
      <div className="pointer-events-none absolute top-3 left-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-sm font-semibold text-white/80">
        Level {levelNum}
      </div>

      {!started && (
        <div className="absolute inset-0 flex touch-manipulation flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm">
          <span className="text-3xl font-bold text-white sm:text-4xl">Crystal Rooms</span>
          <span className="max-w-xs px-6 text-center text-base text-neutral-300">
            Find the glowing letter crystals, open the doors, spell the secret word!
          </span>
          <LookPicker look={look} onChange={onLook} />
          <button
            type="button"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-400 pl-1.5 text-4xl text-neutral-950 shadow-lg shadow-teal-400/40 transition active:scale-90"
            onClick={() => {
              unlockCrystalAudio();
              primeSpeech();
              const next = pickWord(levelNum);
              setWord(next);
              trackEvent('game_start', {
                game: 'crystal-rooms',
                word: next,
                level: String(levelNum),
              });
            }}
          >
            ▶
          </button>
          <span className="text-sm text-neutral-400">drag to walk &middot; or use arrow keys</span>
        </div>
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
          <span className="text-base text-teal-200">Level {levelNum} complete</span>
          <button
            type="button"
            className="pointer-events-auto mt-2 touch-manipulation rounded-full bg-teal-400 px-8 py-3 text-lg font-semibold text-neutral-950 shadow-lg shadow-teal-400/40 transition active:scale-95"
            onClick={onNext}
          >
            Next level ▶
          </button>
        </div>
      )}
    </div>
  );
}

export function CrystalRoomsGame() {
  const [run, setRun] = useState({ id: 0, levelNum: 1 });
  const [look, setLook] = useState<PlayerLook>(() => loadLook());

  const onLook = useCallback((next: PlayerLook) => {
    setLook(next);
    saveLook(next);
  }, []);

  return (
    <GameRun
      key={run.id}
      levelNum={run.levelNum}
      look={look}
      onLook={onLook}
      onNext={() => setRun((r) => ({ id: r.id + 1, levelNum: r.levelNum + 1 }))}
    />
  );
}
