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
