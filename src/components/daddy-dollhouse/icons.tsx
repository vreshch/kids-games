import type { ItemId } from '@/lib/dollhouse-data';

type IconProps = { className?: string };

export function StarIcon({ on, className }: IconProps & { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.3 5.9 20.9l1.5-6.8L2.2 9.5l6.9-.7z"
        fill={on ? '#facc15' : 'none'}
        stroke={on ? '#ca8a04' : '#94a3b8'}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x={5} y={11} width={14} height={10} rx={2.5} fill="#64748b" />
      <path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="#475569" strokeWidth={2.4} />
    </svg>
  );
}

export function HouseIcon({ className, tint }: IconProps & { tint: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="12,2.5 22,11 2,11" fill={tint} />
      <rect x={4.5} y={11} width={15} height={10} fill="#fef3c7" stroke={tint} strokeWidth={1.6} />
      <rect x={10.5} y={14} width={3} height={7} fill={tint} />
    </svg>
  );
}

const GOLD = '#f59e0b';
const SILVER = '#e2e8f0';

function KeyArt({ color }: { color: string }) {
  return (
    <>
      <circle cx={8} cy={9} r={5} fill="none" stroke={color} strokeWidth={3} />
      <path
        d="M12 13l9 9M17 18l3-3M20 21l2-2"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </>
  );
}

function ItemArt({ id }: { id: ItemId }) {
  if (id === 'key') return <KeyArt color={GOLD} />;
  if (id === 'gold-key') return <KeyArt color="#a855f7" />;
  if (id === 'flashlight')
    return (
      <>
        <rect
          x={9}
          y={3}
          width={11}
          height={7}
          rx={2}
          fill="#38bdf8"
          transform="rotate(45 12 12)"
        />
        <rect
          x={6}
          y={10}
          width={13}
          height={6}
          rx={2}
          fill={SILVER}
          transform="rotate(45 12 12)"
        />
        <path
          d="M3 3l3 3M2 8l3 1M8 2l1 3"
          stroke="#facc15"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </>
    );
  if (id === 'lantern')
    return (
      <>
        <path d="M8 5a4 4 0 018 0" fill="none" stroke="#475569" strokeWidth={2} />
        <rect
          x={6}
          y={7}
          width={12}
          height={13}
          rx={4}
          fill="#fde047"
          stroke={GOLD}
          strokeWidth={1.8}
        />
        <rect x={7} y={20} width={10} height={2.5} rx={1} fill="#475569" />
      </>
    );
  if (id === 'rocket')
    return (
      <>
        <path
          d="M12 2c4 3 5 8 4 13H8c-1-5 0-10 4-13z"
          fill={SILVER}
          stroke="#64748b"
          strokeWidth={1.4}
        />
        <circle cx={12} cy={9} r={2.2} fill="#38bdf8" />
        <path d="M8 13l-3 5 4-1M16 13l3 5-4-1" fill="#f43f5e" />
        <path d="M10 17l2 5 2-5z" fill="#fb923c" />
      </>
    );
  return (
    <>
      <circle cx={7} cy={6} r={3} fill="#b45309" />
      <circle cx={17} cy={6} r={3} fill="#b45309" />
      <circle cx={12} cy={11} r={7} fill="#d97706" />
      <circle cx={12} cy={17} r={5} fill="#d97706" />
      <circle cx={10} cy={10} r={1} fill="#1f2937" />
      <circle cx={14} cy={10} r={1} fill="#1f2937" />
    </>
  );
}

export function ItemIcon({ id, className }: { id: ItemId } & IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label={id.replace('-', ' ')}>
      <ItemArt id={id} />
    </svg>
  );
}

export function Cube({ color, className }: { color: string } & IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={4}
        fill={color}
        fillOpacity={0.75}
        stroke="#f0f9ff"
        strokeWidth={2}
      />
      <path d="M7 8l3-2" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
