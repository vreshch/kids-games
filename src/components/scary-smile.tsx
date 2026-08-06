'use client';

import { useState } from 'react';

const MAX_LEVEL = 5;

const FACE_COLORS = ['#ffd93d', '#ffc233', '#ff9d33', '#ff6f33', '#dc3f28', '#8f1414'];
const EYE_COLORS = ['#1a1a1a', '#1a1a1a', '#2b1010', '#5c1010', '#8a0f0f', '#ff1a1a'];
const HINTS = [
  'click me',
  'ooh...',
  'are you sure?',
  'getting spooky!',
  'RUN!',
  'click to start over',
];

function mouthPath(level: number) {
  if (level <= 2) {
    const curve = [158, 130, 104][level];
    return `M 62 118 Q 100 ${curve} 138 118`;
  }
  const open = [40, 56, 72][level - 3];
  return `M 58 114 Q 100 106 142 114 Q 100 ${114 + open} 58 114 Z`;
}

function teethPaths(level: number) {
  const count = (level - 2) * 2;
  const step = 72 / count;
  const length = 8 + level * 3;
  return Array.from({ length: count }, (_, i) => {
    const x = 64 + i * step;
    return `M ${x} 112 L ${x + step * 0.7} 112 L ${x + step * 0.35} ${112 + length} Z`;
  });
}

function Eye({ cx, level }: { cx: number; level: number }) {
  const scleraR = 21 - level * 1.6;
  const pupilR = Math.max(3, 9 - level * 1.2);
  return (
    <g>
      <circle cx={cx} cy={80} r={scleraR} fill="#fffdf5" />
      <circle cx={cx} cy={80} r={pupilR} fill={EYE_COLORS[level]} />
    </g>
  );
}

function Brow({ x, level, flip }: { x: number; level: number; flip?: boolean }) {
  const drop = (level - 1) * 5;
  const [x1, x2] = flip ? [x + 30, x] : [x, x + 30];
  return (
    <path
      d={`M ${x1} ${52 - drop / 2} L ${x2} ${58 + drop}`}
      stroke="#3a0d0d"
      strokeWidth={5 + level}
      strokeLinecap="round"
    />
  );
}

export function ScarySmile() {
  const [level, setLevel] = useState(0);
  const isOpenMouth = level >= 3;

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={() => setLevel((l) => (l >= MAX_LEVEL ? 0 : l + 1))}
        aria-label={level >= MAX_LEVEL ? 'Start over' : 'Make the face scarier'}
        className={`cursor-pointer rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 ${
          level >= 4 ? 'animate-shake' : ''
        }`}
        style={{ filter: `drop-shadow(0 0 ${level * 12}px rgba(255, 30, 30, ${level * 0.16}))` }}
      >
        <svg viewBox="0 0 200 200" className="h-[40vmin] w-[40vmin]" role="img">
          <circle
            cx={100}
            cy={100}
            r={92}
            fill={FACE_COLORS[level]}
            stroke="#00000022"
            strokeWidth={4}
          />
          <Eye cx={68} level={level} />
          <Eye cx={132} level={level} />
          {level >= 2 && <Brow x={50} level={level} />}
          {level >= 2 && <Brow x={120} level={level} flip />}
          <path
            d={mouthPath(level)}
            fill={isOpenMouth ? '#2b0505' : 'none'}
            stroke="#2b0505"
            strokeWidth={isOpenMouth ? 4 : 9}
            strokeLinecap="round"
          />
          {isOpenMouth && teethPaths(level).map((d, i) => <path key={i} d={d} fill="#fffdf5" />)}
        </svg>
      </button>
      <p className="text-lg tracking-wide text-neutral-400 select-none">{HINTS[level]}</p>
    </div>
  );
}
