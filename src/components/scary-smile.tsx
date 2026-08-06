'use client';

import { useState } from 'react';

const MAX_LEVEL = 6;

const FACE_COLORS = ['#22c55e', '#7ede4a', '#ffd93d', '#ff8c1a', '#e02424', '#7a0c0c', '#050505'];
const BROW_COLORS = ['#14351f', '#2b4a12', '#5c4406', '#6b2f00', '#4a0d0d', '#2e0505', '#8a1414'];
const SCLERA_COLORS = ['#fffdf5', '#fffdf5', '#fffdf5', '#fff6d5', '#ffeaa8', '#ffd166', '#ffcf3d'];
const PUPIL_COLORS = ['#14351f', '#14351f', '#2b1010', '#4a1010', '#5c1010', '#8a0f0f', '#ff1a1a'];
const HINTS = [
  'click me',
  'ooh...',
  'hmm...',
  'are you sure?',
  'getting spooky!',
  'RUN!',
  'click to start over',
];

const TONGUE_PATH = 'M 86 146 Q 100 138 114 146 L 111 206 L 104 228 L 100 212 L 96 228 L 89 206 Z';

function mouthPath(level: number) {
  if (level <= 2) {
    const curve = [158, 142, 118][level];
    return `M 62 118 Q 100 ${curve} 138 118`;
  }
  const open = [36, 48, 60, 72][level - 3];
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
      <circle cx={cx} cy={80} r={scleraR} fill={SCLERA_COLORS[level]} />
      <circle cx={cx} cy={80} r={pupilR} fill={PUPIL_COLORS[level]} />
    </g>
  );
}

function Brow({ x, level, flip }: { x: number; level: number; flip?: boolean }) {
  const drop = Math.min(16, (level - 1) * 4);
  const [x1, x2] = flip ? [x + 30, x] : [x, x + 30];
  return (
    <path
      d={`M ${x1} ${46 - drop / 2} L ${x2} ${52 + drop}`}
      stroke={BROW_COLORS[level]}
      strokeWidth={5 + level}
      strokeLinecap="round"
    />
  );
}

export function ScarySmile() {
  const [level, setLevel] = useState(0);
  const isOpenMouth = level >= 3;
  const isFinal = level === MAX_LEVEL;
  const glowClass = isFinal ? 'animate-creep-glow' : '';

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={() => setLevel((l) => (l >= MAX_LEVEL ? 0 : l + 1))}
        aria-label={isFinal ? 'Start over' : 'Make the face scarier'}
        className={`cursor-pointer rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 ${
          level >= 5 ? 'animate-shake' : ''
        }`}
        style={{ filter: `drop-shadow(0 0 ${level * 12}px rgba(255, 40, 40, ${level * 0.16}))` }}
      >
        <svg viewBox="0 0 200 240" className="w-[40vmin]" role="img">
          <circle
            cx={100}
            cy={100}
            r={92}
            fill={FACE_COLORS[level]}
            stroke={isFinal ? '#2a0000' : '#00000022'}
            strokeWidth={4}
          />
          <path
            d={mouthPath(level)}
            fill={isOpenMouth ? (isFinal ? '#2e0206' : '#2b0505') : 'none'}
            stroke={isFinal ? '#2e0206' : '#2b0505'}
            strokeWidth={isOpenMouth ? 4 : 9}
            strokeLinecap="round"
          />
          {isFinal && (
            <path
              d={TONGUE_PATH}
              fill="#ff2d55"
              className={glowClass}
              style={{ color: '#ff2d55' }}
            />
          )}
          {isOpenMouth && teethPaths(level).map((d, i) => <path key={i} d={d} fill="#fffdf5" />)}
          <g className={glowClass} style={isFinal ? { color: '#ffcf3d' } : undefined}>
            <Eye cx={68} level={level} />
            <Eye cx={132} level={level} />
          </g>
          {level >= 2 && <Brow x={50} level={level} />}
          {level >= 2 && <Brow x={120} level={level} flip />}
        </svg>
      </button>
      <p className="text-lg tracking-wide text-neutral-400 select-none">{HINTS[level]}</p>
    </div>
  );
}
