import type { ReactNode } from 'react';

import { cn } from './cn';

const PLACE = 'absolute -translate-x-1/2 -translate-y-1/2';

type SpotProps = {
  x: number;
  y: number;
  label: string;
  onTap: () => void;
  className?: string;
  children?: ReactNode;
};

/** A tappable thing in a scene, centered on its x/y percent. */
export function Spot({ x, y, label, onTap, className, children }: SpotProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onTap}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn(
        PLACE,
        'flex touch-manipulation flex-col items-center justify-center text-[clamp(40px,13vw,68px)] leading-none transition-[scale] active:scale-90',
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
