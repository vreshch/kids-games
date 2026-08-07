import type { Category, Character } from '@/lib/sprunki-cast';

/** Each sound group wears something different, so a full stage reads at a glance. */
function Crown({ category, color }: { category: Category; color: string }) {
  if (category === 'beat') {
    return (
      <g stroke={color} strokeWidth={4} strokeLinecap="round" fill={color}>
        <path d="M 40 20 L 34 4" />
        <path d="M 60 20 L 66 4" />
        <circle cx={34} cy={4} r={4.5} stroke="none" />
        <circle cx={66} cy={4} r={4.5} stroke="none" />
      </g>
    );
  }
  if (category === 'effect') {
    return <path d="M 28 24 L 38 6 L 50 22 L 62 6 L 72 24 Z" fill={color} />;
  }
  if (category === 'melody') {
    return (
      <g fill={color}>
        <path d="M 30 24 L 24 2 L 44 18 Z" />
        <path d="M 70 24 L 76 2 L 56 18 Z" />
      </g>
    );
  }
  return <rect x={30} y={10} width={40} height={10} rx={5} fill={color} />;
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
      <ellipse cx={50} cy={122} rx={30} ry={5} fill="#000" opacity={0.45} />
      <Crown category={character.category} color={character.color} />
      <path d="M 50 44 L 86 118 L 14 118 Z" fill={character.color} />
      <circle cx={50} cy={48} r={30} fill={character.color} />
      <circle cx={39} cy={44} r={9} fill="#fffdf5" />
      <circle cx={61} cy={44} r={9} fill="#fffdf5" />
      <circle cx={39} cy={44} r={singing ? 3.5 : 4.5} fill="#1a1a1a" />
      <circle cx={61} cy={44} r={singing ? 3.5 : 4.5} fill="#1a1a1a" />
      {singing ? (
        <ellipse cx={50} cy={66} rx={9} ry={11} fill="#1a1a1a" />
      ) : (
        <path
          d="M 41 66 Q 50 72 59 66"
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
      {/* One outline around head and body, so the dashes trace the character, not two shapes. */}
      <path
        d="M 14 118 L 35.3 74.2 A 30 30 0 1 1 64.7 74.2 L 86 118 Z"
        fill="none"
        stroke="#525252"
        strokeWidth={3}
        strokeDasharray="8 8"
        strokeLinejoin="round"
      />
      <circle cx={39} cy={44} r={4} fill="#525252" />
      <circle cx={61} cy={44} r={4} fill="#525252" />
    </svg>
  );
}
