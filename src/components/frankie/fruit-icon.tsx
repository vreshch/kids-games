import type { Fruit } from '@/lib/frankie-cast';

/** One fruit, drawn small enough to sit in the basket or on a singer's head. */
export function FruitIcon({ fruit, className }: { fruit: Fruit; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={fruit.name}>
      {fruit.id === 'banana' ? (
        <path
          d="M 10 12 Q 12 34 34 38 Q 40 38 40 32 Q 22 30 18 10 Z"
          fill={fruit.color}
          stroke={fruit.seed}
          strokeWidth={2}
        />
      ) : fruit.id === 'cherry' ? (
        <g>
          <path
            d="M 18 30 Q 24 14 34 10"
            fill="none"
            stroke="#4d7c0f"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={17} cy={34} r={9} fill={fruit.color} />
          <circle cx={33} cy={32} r={8} fill={fruit.seed} />
        </g>
      ) : fruit.id === 'watermelon' ? (
        <g>
          <path d="M 6 32 A 18 18 0 0 0 42 32 Z" fill="#f43f5e" />
          <path
            d="M 6 32 A 18 18 0 0 0 42 32"
            fill="none"
            stroke={fruit.color}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <circle cx={18} cy={36} r={2} fill={fruit.seed} />
          <circle cx={30} cy={36} r={2} fill={fruit.seed} />
          <circle cx={24} cy={41} r={2} fill={fruit.seed} />
        </g>
      ) : fruit.id === 'dragon-fruit' ? (
        <g>
          <ellipse cx={24} cy={27} rx={13} ry={16} fill={fruit.color} />
          <path d="M 11 18 L 3 12 L 13 11 Z" fill="#a3e635" />
          <path d="M 37 18 L 45 12 L 35 11 Z" fill="#a3e635" />
          <path d="M 24 40 L 18 46 L 30 46 Z" fill="#a3e635" />
          <circle cx={21} cy={24} r={1.6} fill={fruit.seed} />
          <circle cx={28} cy={29} r={1.6} fill={fruit.seed} />
          <circle cx={22} cy={33} r={1.6} fill={fruit.seed} />
        </g>
      ) : fruit.id === 'lime' ? (
        <g>
          <circle cx={24} cy={26} r={15} fill={fruit.color} />
          <path
            d="M 24 26 L 24 11 M 24 26 L 37 33 M 24 26 L 11 33"
            stroke={fruit.seed}
            strokeWidth={2.5}
          />
          <path d="M 22 8 Q 28 4 34 6" fill="none" stroke="#4d7c0f" strokeWidth={3} />
        </g>
      ) : (
        <g>
          <ellipse cx={24} cy={27} rx={15} ry={14} fill={fruit.color} />
          <path d="M 24 13 Q 30 5 38 5 Q 33 12 26 14 Z" fill="#65a30d" />
          <ellipse cx={18} cy={23} rx={4} ry={3} fill="#fff" opacity={0.5} />
        </g>
      )}
    </svg>
  );
}
