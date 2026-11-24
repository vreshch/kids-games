export type Mood = 'calm' | 'happy' | 'giggle' | 'yuck' | 'dizzy';

const MOUTHS: Record<Mood, string> = {
  calm: 'M 40 66 Q 50 72 60 66',
  happy: 'M 34 62 Q 50 84 66 62 Z',
  giggle: 'M 36 62 Q 50 80 64 62 Z',
  yuck: 'M 38 70 Q 50 60 62 70',
  dizzy: 'M 34 68 Q 42 60 50 68 T 66 68',
};

function Eye({ cx, mood }: { cx: number; mood: Mood }) {
  if (mood === 'giggle')
    return (
      <path
        d={`M ${cx - 8} 48 Q ${cx} 38 ${cx + 8} 48`}
        fill="none"
        stroke="#111827"
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  if (mood === 'dizzy')
    return (
      <path
        d={`M ${cx - 7} 39 L ${cx + 7} 53 M ${cx + 7} 39 L ${cx - 7} 53`}
        stroke="#111827"
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  return (
    <>
      <circle cx={cx} cy={46} r={9} fill="#fffdf5" stroke="#111827" strokeWidth={1.5} />
      <circle cx={cx + (mood === 'yuck' ? -3 : 1)} cy={mood === 'happy' ? 44 : 47} r={4} />
    </>
  );
}

type Props = { emoji: string; mood: Mood; label: string; className?: string };

/** Any food picture with googly eyes and a mouth on top, so it can react. */
export function FoodFace({ emoji, mood, label, className = '' }: Props) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`relative inline-block leading-none ${className}`}
    >
      <span className={mood === 'dizzy' ? 'grayscale-[0.6]' : ''}>{emoji}</span>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <Eye cx={36} mood={mood} />
        <Eye cx={64} mood={mood} />
        <path
          d={MOUTHS[mood]}
          fill={mood === 'happy' || mood === 'giggle' ? '#7f1d1d' : 'none'}
          stroke="#111827"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {mood === 'yuck' && <ellipse cx={50} cy={74} rx={6} ry={8} fill="#fb7185" />}
      </svg>
    </span>
  );
}
