import type { CharId } from '@/lib/dollhouse-data';

const SKIN = '#fcd5b0';
const INK = '#1f2937';

function Face({ cx, cy, happy }: { cx: number; cy: number; happy: boolean }) {
  return (
    <>
      <circle cx={cx - 4.5} cy={cy - 2} r={1.7} fill={INK} />
      <circle cx={cx + 4.5} cy={cy - 2} r={1.7} fill={INK} />
      {happy ? (
        <path
          d={`M ${cx - 4.5} ${cy + 3} Q ${cx} ${cy + 10} ${cx + 4.5} ${cy + 3} Z`}
          fill="#7f1d1d"
        />
      ) : (
        <path
          d={`M ${cx - 3.5} ${cy + 4} Q ${cx} ${cy + 7} ${cx + 3.5} ${cy + 4}`}
          fill="none"
          stroke={INK}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      )}
    </>
  );
}

function Daddy({ happy }: { happy: boolean }) {
  return (
    <>
      <rect x={14} y={52} width={7} height={10} rx={3} fill="#1e3a8a" />
      <rect x={27} y={52} width={7} height={10} rx={3} fill="#1e3a8a" />
      <rect x={10} y={30} width={28} height={26} rx={10} fill="#2563eb" />
      <circle cx={24} cy={20} r={12} fill={SKIN} />
      <path d="M 12 17 Q 14 4 24 6 Q 34 4 36 17 Q 30 9 24 11 Q 18 9 12 17 Z" fill="#78350f" />
      <Face cx={24} cy={19} happy={happy} />
      <path d="M 16 26 Q 24 22 32 26 Q 24 30 16 26 Z" fill="#78350f" opacity={0.9} />
    </>
  );
}

function Girl({ happy }: { happy: boolean }) {
  return (
    <>
      <rect x={16} y={52} width={5} height={10} rx={2} fill={SKIN} />
      <rect x={27} y={52} width={5} height={10} rx={2} fill={SKIN} />
      <polygon points="24,28 8,56 40,56" fill="#ec4899" />
      <circle cx={11} cy={12} r={6} fill="#7c2d12" />
      <circle cx={37} cy={12} r={6} fill="#7c2d12" />
      <circle cx={24} cy={20} r={11} fill={SKIN} />
      <path d="M 13 18 Q 24 2 35 18 Q 24 10 13 18 Z" fill="#7c2d12" />
      <Face cx={24} cy={21} happy={happy} />
      <circle cx={16} cy={26} r={2.2} fill="#fda4af" opacity={0.7} />
      <circle cx={32} cy={26} r={2.2} fill="#fda4af" opacity={0.7} />
    </>
  );
}

function Baby({ happy }: { happy: boolean }) {
  return (
    <>
      <ellipse cx={24} cy={52} rx={13} ry={9} fill="#86efac" />
      <ellipse cx={24} cy={58} rx={9} ry={4} fill="#ffffff" />
      <circle cx={24} cy={32} r={15} fill={SKIN} />
      <path
        d="M 24 17 Q 20 8 27 9"
        fill="none"
        stroke="#b45309"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Face cx={24} cy={33} happy={happy} />
      <circle cx={14} cy={38} r={2.6} fill="#fda4af" opacity={0.7} />
      <circle cx={34} cy={38} r={2.6} fill="#fda4af" opacity={0.7} />
    </>
  );
}

function Cat({ happy }: { happy: boolean }) {
  return (
    <>
      <path
        d="M 36 56 Q 50 52 44 36"
        fill="none"
        stroke="#fb923c"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <ellipse cx={24} cy={47} rx={13} ry={14} fill="#fb923c" />
      <polygon points="12,22 14,6 24,16" fill="#fb923c" />
      <polygon points="36,22 34,6 24,16" fill="#fb923c" />
      <circle cx={24} cy={26} r={12} fill="#fb923c" />
      <path d="M 20 15 L 24 21 L 28 15" fill="none" stroke="#c2410c" strokeWidth={1.6} />
      <Face cx={24} cy={26} happy={happy} />
      <circle cx={24} cy={29} r={1.6} fill="#f472b6" />
      <path
        d="M 7 28 L 15 29 M 7 33 L 15 31 M 41 28 L 33 29 M 41 33 L 33 31"
        stroke={INK}
        strokeWidth={0.9}
      />
    </>
  );
}

const DRAW = { daddy: Daddy, girl: Girl, baby: Baby, cat: Cat };

export function CharArt({ id, happy = false }: { id: CharId; happy?: boolean }) {
  const Draw = DRAW[id];
  return (
    <svg viewBox="0 0 48 64" className="h-full w-full" aria-hidden="true">
      <Draw happy={happy} />
    </svg>
  );
}
