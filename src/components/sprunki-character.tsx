import type { Category, Character } from '@/lib/sprunki-cast';

/** Each sound group wears something different, so a full stage reads at a glance. */
function Crown({ category, color }: { category: Category; color: string }) {
  if (category === 'beat') {
    return (
      <g stroke={color} strokeWidth={4} strokeLinecap="round" fill={color}>
        <path d="M 38 26 L 32 10" />
        <path d="M 62 26 L 68 10" />
        <circle cx={32} cy={8} r={5} stroke="none" />
        <circle cx={68} cy={8} r={5} stroke="none" />
      </g>
    );
  }
  if (category === 'effect') {
    return <path d="M 26 28 L 38 12 L 50 28 L 62 12 L 74 28 Z" fill={color} />;
  }
  if (category === 'melody') {
    return (
      <g fill={color}>
        <path d="M 28 30 L 22 8 L 42 24 Z" />
        <path d="M 72 30 L 78 8 L 58 24 Z" />
      </g>
    );
  }
  return <rect x={24} y={14} width={52} height={12} rx={6} fill={color} />;
}

export function SprunkiCharacter({
  character,
  singing = false,
}: {
  character: Character;
  singing?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full" role="img" aria-label={character.name}>
      <ellipse cx={50} cy={122} rx={24} ry={5} fill="#000" opacity={0.45} />
      <Crown category={character.category} color={character.color} />
      <rect x={18} y={26} width={64} height={90} rx={30} fill={character.color} />
      <circle cx={38} cy={58} r={9} fill="#fffdf5" />
      <circle cx={62} cy={58} r={9} fill="#fffdf5" />
      <circle cx={38} cy={58} r={singing ? 3.5 : 4.5} fill="#1a1a1a" />
      <circle cx={62} cy={58} r={singing ? 3.5 : 4.5} fill="#1a1a1a" />
      {singing ? (
        <ellipse cx={50} cy={86} rx={11} ry={13} fill="#1a1a1a" />
      ) : (
        <path
          d="M 40 88 Q 50 94 60 88"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={4}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function EmptySlot() {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full" aria-hidden="true">
      <rect
        x={18}
        y={26}
        width={64}
        height={90}
        rx={30}
        fill="none"
        stroke="#525252"
        strokeWidth={3}
        strokeDasharray="8 8"
      />
      <circle cx={38} cy={58} r={4} fill="#525252" />
      <circle cx={62} cy={58} r={4} fill="#525252" />
    </svg>
  );
}
