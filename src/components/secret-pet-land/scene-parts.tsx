import type { PointerEvent, ReactNode } from 'react';

import type { Target } from '@/lib/secret-pet-land-puzzles';

import { cn } from './cn';

const PLACE = 'absolute -translate-x-1/2 -translate-y-1/2';

type SpotProps = {
  x: number;
  y: number;
  label: string;
  onTap: () => void;
  className?: string;
  children?: ReactNode;
  /** Starts a drag of the item this spot hands out. */
  onDrag?: (e: PointerEvent) => void;
  /** Marks the spot as a place to drop items on. */
  drop?: Target;
  hot?: boolean;
};

const HOT = 'scale-110 outline-4 outline-offset-4 outline-[#fde047] outline-dashed';

/** A tappable thing in a scene, centered on its x/y percent. */
export function Spot(props: SpotProps) {
  const { x, y, label, onTap, className, children, onDrag, drop, hot } = props;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onTap}
      onPointerDown={onDrag}
      data-drop={drop}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn(
        PLACE,
        'flex flex-col items-center justify-center text-[clamp(40px,13vw,68px)] leading-none transition-[scale] active:scale-90',
        onDrag ? 'touch-none' : 'touch-manipulation',
        hot && HOT,
        className
      )}
    >
      {children}
    </button>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <small className="mt-0.5 rounded-lg bg-white px-2 text-[13px] font-bold text-[#3a2460]">
      {children}
    </small>
  );
}

type DecoProps = { x: number; y: number; emoji: string; size?: 'small' | 'big' | 'pet' };

const SIZES = {
  small: 'text-[clamp(30px,10vw,52px)]',
  big: 'text-[clamp(60px,22vw,110px)]',
  pet: 'text-[clamp(46px,15vw,76px)]',
};

export function Deco({ x, y, emoji, size = 'small' }: DecoProps) {
  return (
    <span
      aria-hidden="true"
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn(PLACE, 'pointer-events-none leading-none', SIZES[size])}
    >
      <span className={cn('inline-block', size === 'pet' && 'animate-spl-hop')}>{emoji}</span>
    </span>
  );
}

/** The dragged item, bigger and just above the finger so it stays visible. */
export function Ghost({ ghost }: { ghost: { emoji: string; x: number; y: number } }) {
  return (
    <span
      aria-hidden="true"
      style={{ left: ghost.x, top: ghost.y }}
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[120%] text-[72px] leading-none drop-shadow-[0_6px_6px_#0005]"
    >
      {ghost.emoji}
    </span>
  );
}
