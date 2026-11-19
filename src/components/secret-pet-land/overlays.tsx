import type { ReactNode } from 'react';

import { PETS, type PetId } from '@/lib/secret-pet-land-data';
import { hasPet, type World } from '@/lib/secret-pet-land-world';

import { cn } from './cn';

export type Confetti = { left: number; delay: number }[];
export type Overlay =
  | { kind: 'found'; pet: PetId; all: boolean; confetti: Confetti }
  | { kind: 'card'; text: string }
  | { kind: 'book' };

const BIG = 'animate-spl-pop text-8xl leading-tight';
const PILL = 'mt-2.5 rounded-[18px] px-6 py-2 font-extrabold';
const OK = `${PILL} bg-[#8a5cf6] text-xl text-white`;
const SPARKS = ['🎉', '⭐', '💖', '✨', '🎈'];

function Box({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-[#2b1d4fcc] p-[18px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-h-[90%] w-full max-w-[400px] overflow-auto rounded-3xl bg-white p-[18px] text-center text-[#3a2460]">
        {children}
      </div>
    </div>
  );
}

const Title = ({ children }: { children: ReactNode }) => (
  <h2 className="my-1 text-2xl font-extrabold text-[#d94f8c]">{children}</h2>
);
const Line = ({ children }: { children: ReactNode }) => (
  <p className="my-1.5 text-[19px] font-bold">{children}</p>
);

function Found({
  overlay,
  onClose,
}: {
  overlay: Extract<Overlay, { kind: 'found' }>;
  onClose: () => void;
}) {
  const pet = PETS.find((p) => p.id === overlay.pet)!;
  return (
    <>
      {overlay.confetti.map(({ left, delay }, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ left: `${left}%`, animationDelay: `${delay}s` }}
          className="animate-spl-fall pointer-events-none absolute -top-10 z-30 text-[28px]"
        >
          {SPARKS[i % SPARKS.length]}
        </span>
      ))}
      <Box onClose={onClose}>
        <div className={BIG}>{pet.emoji}</div>
        <Title>You found the {pet.name}!</Title>
        <Line>
          {overlay.all
            ? '🏆 WOW! You found ALL the secret pets!'
            : 'It will live in your Home now.'}
        </Line>
        <button type="button" className={OK} onClick={onClose}>
          Yay!
        </button>
      </Box>
    </>
  );
}

type BookProps = { world: World; resetArmed: boolean; onReset: () => void; onClose: () => void };

function Book({ world, resetArmed, onReset, onClose }: BookProps) {
  return (
    <Box onClose={onClose}>
      <Title>📖 My Secret Pets</Title>
      <div className="my-2.5 grid grid-cols-3 gap-2">
        {PETS.map((p) => (
          <div
            key={p.id}
            className={cn(
              'rounded-2xl bg-[#f6efff] px-0.5 py-1.5 text-[44px] leading-[1.1]',
              !hasPet(world, p.id) && 'opacity-45 grayscale'
            )}
          >
            {hasPet(world, p.id) ? p.emoji : '❔'}
            <b className="block text-sm">{hasPet(world, p.id) ? p.name : '???'}</b>
          </div>
        ))}
      </div>
      <button type="button" className={OK} onClick={onClose}>
        Close
      </button>
      <br />
      <button
        type="button"
        className={`${PILL} bg-[#eee] text-[15px] text-[#777]`}
        onClick={onReset}
      >
        {resetArmed ? 'Tap again to erase everything' : 'Start over'}
      </button>
    </Box>
  );
}

type OverlayProps = Omit<BookProps, 'onClose'> & { overlay: Overlay; onClose: () => void };

export function OverlayView({ overlay, onClose, ...book }: OverlayProps) {
  if (overlay.kind === 'found') return <Found overlay={overlay} onClose={onClose} />;
  if (overlay.kind === 'book') return <Book {...book} onClose={onClose} />;
  return (
    <Box onClose={onClose}>
      <div className={BIG}>🃏</div>
      <Title>Secret Card</Title>
      <Line>{overlay.text}</Line>
      <button type="button" className={OK} onClick={onClose}>
        OK
      </button>
    </Box>
  );
}
