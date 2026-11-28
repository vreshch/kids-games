import type { SecretId } from '@/lib/dollhouse-data';

import { StarIcon } from './icons';

export function Sparkle() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {['left-0 top-0', 'right-0 top-1', 'left-1/2 bottom-0'].map((pos, i) => (
        <span
          key={pos}
          className={`animate-dd-sparkle absolute text-lg text-yellow-300 ${pos}`}
          style={{ animationDelay: `${i * 0.35}s` }}
        >
          ✦
        </span>
      ))}
    </span>
  );
}

export function PresentArt({ stage }: { stage: number }) {
  const open = stage === 3;
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full overflow-visible" aria-hidden="true">
      <rect x={6} y={18} width={28} height={20} rx={3} fill="#f43f5e" />
      <rect x={18} y={18} width={4} height={20} fill="#fde047" />
      <g transform={open ? 'translate(7 -9) rotate(24 20 14)' : undefined}>
        <rect x={4} y={11} width={32} height={9} rx={3} fill="#fb7185" />
        <rect x={18} y={11} width={4} height={9} fill="#fde047" />
        <path
          d="M20 11c-8-9-14 0-6 0M20 11c8-9 14 0 6 0"
          fill="none"
          stroke="#fde047"
          strokeWidth={2.4}
        />
      </g>
    </svg>
  );
}

export function SecretArt({ id, found, dark }: { id: SecretId; found: boolean; dark: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible" aria-hidden="true">
      {id === 'picture' ? <PictureArt found={found} /> : null}
      {id === 'cupboard' ? <CupboardArt found={found} /> : null}
      {id === 'hole' ? <HoleArt found={found} dark={dark} /> : null}
    </svg>
  );
}

function PictureArt({ found }: { found: boolean }) {
  return (
    <>
      <rect x={6} y={6} width={36} height={36} rx={4} fill="#3f2a14" />
      {found ? <circle cx={24} cy={24} r={8} fill="#facc15" /> : null}
      <g transform={found ? 'rotate(28 6 6)' : undefined} style={{ transition: 'transform 0.4s' }}>
        <rect x={6} y={6} width={36} height={36} rx={4} fill="#92400e" />
        <rect x={10} y={10} width={28} height={28} fill="#bae6fd" />
        <polygon points="10,38 20,22 28,32 33,26 38,38" fill="#22c55e" />
        <circle cx={31} cy={16} r={4} fill="#fde047" />
      </g>
    </>
  );
}

function CupboardArt({ found }: { found: boolean }) {
  return (
    <>
      <rect x={6} y={4} width={36} height={42} rx={3} fill="#78350f" />
      <rect x={10} y={8} width={28} height={34} fill="#451a03" />
      {found ? <circle cx={24} cy={26} r={7} fill="#facc15" /> : null}
      <rect x={10} y={8} width={found ? 5 : 14} height={34} fill="#b45309" />
      <rect x={found ? 33 : 24} y={8} width={found ? 5 : 14} height={34} fill="#b45309" />
      {found ? null : <circle cx={24} cy={26} r={2.6} fill="#fde68a" />}
    </>
  );
}

function HoleArt({ found, dark }: { found: boolean; dark: boolean }) {
  return (
    <>
      {dark ? null : <circle cx={24} cy={30} r={22} fill="#fde047" fillOpacity={0.45} />}
      <path d="M8 44V28a16 16 0 0132 0v16z" fill="#1c1209" fillOpacity={0.88} />
      {found ? <circle cx={24} cy={34} r={7} fill="#facc15" /> : null}
    </>
  );
}

export function FoundStar() {
  return (
    <StarIcon on className="animate-spl-pop absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2" />
  );
}

export function MachineArt({ color, cube }: { color: string; cube: boolean }) {
  return (
    <svg viewBox="0 0 40 52" className="h-full w-full" aria-hidden="true">
      <rect
        x={3}
        y={2}
        width={34}
        height={46}
        rx={6}
        fill="#cbd5e1"
        stroke="#64748b"
        strokeWidth={2}
      />
      <rect
        x={8}
        y={8}
        width={24}
        height={18}
        rx={4}
        fill="#e0f2fe"
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
      {cube ? <rect x={14} y={12} width={12} height={12} rx={3} fill={color} /> : null}
      <circle cx={13} cy={33} r={3.5} fill={color} />
      <circle cx={25} cy={33} r={3.5} fill="#f472b6" />
      <rect x={10} y={40} width={20} height={5} rx={2} fill="#475569" />
    </svg>
  );
}
