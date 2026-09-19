import { FruitIcon } from '@/components/frankie/fruit-icon';
import type { Character, Face, Fruit } from '@/lib/frankie-cast';

/** The face a singer pulls once it has eaten - silly first, spooky second. */
function Mouth({ face, singing }: { face: Face | null; singing: boolean }) {
  if (!face) {
    return singing ? (
      <ellipse cx={50} cy={66} rx={9} ry={11} fill="#1a1a1a" />
    ) : (
      <path
        d="M 41 66 Q 50 72 59 66"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  }
  if (face === 'fangs') {
    return (
      <g>
        <path d="M 38 62 Q 50 76 62 62 Z" fill="#1a1a1a" />
        <path d="M 42 64 L 45 71 L 48 64 Z M 52 64 L 55 71 L 58 64 Z" fill="#fffdf5" />
      </g>
    );
  }
  if (face === 'wobble') {
    return (
      <path
        d="M 38 66 Q 44 60 50 66 Q 56 72 62 66"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  }
  if (face === 'stare') {
    return <ellipse cx={50} cy={68} rx={6} ry={8} fill="#1a1a1a" />;
  }
  return (
    <g>
      <path d="M 37 63 Q 50 78 63 63 Z" fill="#1a1a1a" />
      <path d="M 43 70 Q 50 76 57 70 Z" fill="#f472b6" />
    </g>
  );
}

function Eyes({ fed, singing }: { fed: boolean; singing: boolean }) {
  const white = fed ? 11 : 9;
  const pupil = fed ? 3 : singing ? 3.5 : 4.5;
  return (
    <g>
      <circle cx={39} cy={44} r={white} fill="#fffdf5" />
      <circle cx={61} cy={44} r={white} fill="#fffdf5" />
      <circle cx={fed ? 41 : 39} cy={fed ? 41 : 44} r={pupil} fill="#1a1a1a" />
      <circle cx={fed ? 63 : 61} cy={fed ? 41 : 44} r={pupil} fill="#1a1a1a" />
    </g>
  );
}

export function FrankieCharacter({
  character,
  fruit = null,
  singing = false,
}: {
  character: Character;
  fruit?: Fruit | null;
  singing?: boolean;
}) {
  const skin = fruit ? fruit.color : character.color;
  const label = fruit ? `${character.name} full of ${fruit.name}` : character.name;

  return (
    <svg viewBox="0 0 100 130" className="h-full w-full" role="img" aria-label={label}>
      <ellipse cx={50} cy={122} rx={30} ry={5} fill="#000" opacity={0.45} />
      {fruit ? (
        <g transform="translate(32 -8) scale(0.75)" stroke="#0a0a0a" strokeWidth={2.5}>
          {/* The eaten fruit rides a head of its own colour - outline it so the two stay apart. */}
          <FruitIcon fruit={fruit} />
        </g>
      ) : (
        <g stroke={character.color} strokeWidth={4} strokeLinecap="round" fill={character.color}>
          <path d="M 40 20 L 34 6" />
          <path d="M 60 20 L 66 6" />
          <circle cx={34} cy={6} r={4.5} stroke="none" />
          <circle cx={66} cy={6} r={4.5} stroke="none" />
        </g>
      )}
      <path d="M 50 44 L 86 118 L 14 118 Z" fill={skin} />
      <circle cx={50} cy={48} r={30} fill={skin} />
      {fruit && (
        <path
          d="M 24 60 Q 36 70 32 84 M 76 60 Q 64 70 68 84"
          fill="none"
          stroke={fruit.seed}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.7}
        />
      )}
      <Eyes fed={Boolean(fruit)} singing={singing} />
      <Mouth face={fruit ? fruit.face : null} singing={singing} />
    </svg>
  );
}

export function EmptySlot() {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full" aria-hidden="true">
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
