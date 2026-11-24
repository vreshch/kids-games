type IconProps = { className?: string };

export function SmileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx={24} cy={24} r={21} fill="#22c55e" />
      <circle cx={17} cy={19} r={4.5} fill="#fffdf5" />
      <circle cx={31} cy={19} r={4.5} fill="#fffdf5" />
      <circle cx={17} cy={19} r={2} fill="#14351f" />
      <circle cx={31} cy={19} r={2} fill="#14351f" />
      <path
        d="M 14 29 Q 24 39 34 29"
        fill="none"
        stroke="#2b0505"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SprankiIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x={3} y={14} width={18} height={30} rx={9} fill="#a855f7" />
      <rect x={27} y={8} width={18} height={36} rx={9} fill="#0ea5e9" />
      <circle cx={9} cy={24} r={3} fill="#fffdf5" />
      <circle cx={15} cy={24} r={3} fill="#fffdf5" />
      <circle cx={33} cy={19} r={3} fill="#fffdf5" />
      <circle cx={39} cy={19} r={3} fill="#fffdf5" />
      <circle cx={9} cy={24} r={1.4} fill="#1a1a1a" />
      <circle cx={15} cy={24} r={1.4} fill="#1a1a1a" />
      <circle cx={33} cy={19} r={1.4} fill="#1a1a1a" />
      <circle cx={39} cy={19} r={1.4} fill="#1a1a1a" />
      <ellipse cx={12} cy={33} rx={4} ry={5} fill="#1a1a1a" />
      <ellipse cx={36} cy={29} rx={4} ry={5} fill="#1a1a1a" />
    </svg>
  );
}

export function ParrotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M 30 28 Q 39 34 44 43 L 37 41 Q 30 36 26 31 Z" fill="#0ea5e9" />
      <ellipse cx={25} cy={30} rx={11} ry={13} fill="#22c55e" />
      <ellipse cx={23} cy={32} rx={6} ry={8} fill="#86efac" />
      <circle cx={24} cy={16} r={11} fill="#22c55e" />
      <circle cx={21} cy={19} r={6.5} fill="#fde047" />
      <path d="M 24 4 Q 30 1 35 4 Q 29 5 27 9 Z" fill="#ef4444" />
      <circle cx={22} cy={14} r={2.6} fill="#1a1a1a" />
      <path d="M 16 16 Q 6 18 11 24 Q 15 22 17 19 Z" fill="#fb923c" />
      <rect x={9} y={43} width={30} height={3} rx={1.5} fill="#92400e" />
    </svg>
  );
}

export function CrystalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M 24 3 L 38 14 L 33 43 L 15 43 L 10 14 Z" fill="#2dd4bf" />
      <path d="M 24 3 L 38 14 L 24 20 Z" fill="#5eead4" />
      <path d="M 24 3 L 10 14 L 24 20 Z" fill="#99f6e4" />
      <path d="M 10 14 L 15 43 L 24 20 Z" fill="#14b8a6" />
      <path d="M 38 14 L 33 43 L 24 20 Z" fill="#0d9488" />
      <text x={24} y={37} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fffdf5">
        A
      </text>
    </svg>
  );
}

export function FrankieIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <ellipse cx={24} cy={30} rx={17} ry={16} fill="#fbbf24" />
      <path d="M 24 15 Q 31 4 41 4 Q 35 13 27 16 Z" fill="#65a30d" />
      <circle cx={17} cy={27} r={5} fill="#fffdf5" />
      <circle cx={31} cy={27} r={5} fill="#fffdf5" />
      <circle cx={18} cy={25} r={2.2} fill="#1a1a1a" />
      <circle cx={32} cy={25} r={2.2} fill="#1a1a1a" />
      <path d="M 16 36 Q 24 45 32 36 Z" fill="#1a1a1a" />
      <path d="M 19 37 L 21 41 L 23 37 Z M 26 37 L 28 41 L 30 37 Z" fill="#fffdf5" />
    </svg>
  );
}

export function WiggleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M 8 40 Q 4 28 14 26 Q 24 24 22 15 Q 21 7 30 7"
        fill="none"
        stroke="#f472b6"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d="M 8 40 Q 4 28 14 26 Q 24 24 22 15 Q 21 7 30 7"
        fill="none"
        stroke="#fbcfe8"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray="5 7"
      />
      <circle cx={34} cy={9} r={8} fill="#f472b6" />
      <circle cx={33} cy={6} r={3} fill="#fffdf5" />
      <circle cx={38} cy={9} r={3} fill="#fffdf5" />
      <circle cx={34} cy={6} r={1.4} fill="#1a1a1a" />
      <circle cx={39} cy={9} r={1.4} fill="#1a1a1a" />
      <circle cx={42} cy={28} r={3} fill="#facc15" />
      <circle cx={30} cy={38} r={2.5} fill="#38bdf8" />
      <circle cx={40} cy={42} r={2} fill="#4ade80" />
    </svg>
  );
}

export function MunchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M 14 12 L 10 5 M 26 12 L 30 5"
        stroke="#34d399"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={10} cy={5} r={2.5} fill="#fde047" />
      <circle cx={30} cy={5} r={2.5} fill="#fde047" />
      <circle cx={20} cy={24} r={14} fill="#34d399" />
      <circle cx={15} cy={20} r={4} fill="#fffdf5" />
      <circle cx={25} cy={20} r={4} fill="#fffdf5" />
      <circle cx={16} cy={20} r={1.8} fill="#111827" />
      <circle cx={26} cy={20} r={1.8} fill="#111827" />
      <ellipse cx={20} cy={30} rx={6} ry={3} fill="#7f1d1d" />
      <circle cx={39} cy={24} r={2.5} fill="#fda4af" />
      <circle cx={39} cy={34} r={2.5} fill="#fda4af" />
      <circle cx={30} cy={42} r={2.5} fill="#fda4af" />
    </svg>
  );
}

export function PetLandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <ellipse cx={17} cy={11} rx={4.5} ry={10} fill="#fff1f7" />
      <ellipse cx={31} cy={11} rx={4.5} ry={10} fill="#fff1f7" />
      <ellipse cx={17} cy={12} rx={2} ry={6.5} fill="#ff7eb6" />
      <ellipse cx={31} cy={12} rx={2} ry={6.5} fill="#ff7eb6" />
      <circle cx={24} cy={29} r={14} fill="#fff1f7" />
      <circle cx={19} cy={27} r={2.2} fill="#2d2d3a" />
      <circle cx={29} cy={27} r={2.2} fill="#2d2d3a" />
      <circle cx={24} cy={32} r={2} fill="#ff7eb6" />
      <circle cx={15} cy={33} r={2.5} fill="#ff7eb6" opacity={0.45} />
      <circle cx={33} cy={33} r={2.5} fill="#ff7eb6" opacity={0.45} />
      <path
        d="M 40 6 l 1.5 3.5 l 3.5 1.5 l -3.5 1.5 l -1.5 3.5 l -1.5 -3.5 l -3.5 -1.5 l 3.5 -1.5 Z"
        fill="#fde047"
      />
    </svg>
  );
}

export function TankIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x={5} y={10} width={38} height={9} rx={4} fill="#1f2937" />
      <rect x={5} y={31} width={38} height={9} rx={4} fill="#1f2937" />
      <rect x={9} y={13} width={28} height={24} rx={6} fill="#f59e0b" />
      <rect x={24} y={22.5} width={22} height={5} rx={2} fill="#374151" />
      <circle cx={22} cy={25} r={8} fill="#fde68a" />
      <circle cx={24} cy={21.5} r={2.4} fill="#fffdf5" />
      <circle cx={24} cy={28.5} r={2.4} fill="#fffdf5" />
      <circle cx={24.8} cy={21.5} r={1.1} fill="#111827" />
      <circle cx={24.8} cy={28.5} r={1.1} fill="#111827" />
    </svg>
  );
}

export function CookieIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx={24} cy={24} r={20} fill="#d97706" />
      <circle cx={24} cy={24} r={20} fill="none" stroke="#92400e" strokeWidth={2} />
      <circle cx={13} cy={14} r={2.6} fill="#451a03" />
      <circle cx={36} cy={16} r={2.2} fill="#451a03" />
      <circle cx={11} cy={31} r={2.2} fill="#451a03" />
      <circle cx={37} cy={32} r={2.6} fill="#451a03" />
      <circle cx={18} cy={21} r={4.5} fill="#fffdf5" />
      <circle cx={30} cy={21} r={4.5} fill="#fffdf5" />
      <circle cx={19} cy={21} r={2} fill="#111827" />
      <circle cx={31} cy={21} r={2} fill="#111827" />
      <path d="M 16 29 Q 24 38 32 29 Z" fill="#7f1d1d" />
    </svg>
  );
}
