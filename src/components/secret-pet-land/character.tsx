import { CLOTH, HAIR_COLORS, HATS, SKIN } from '@/lib/secret-pet-land-data';
import type { Look } from '@/lib/secret-pet-land-look';

const EDGE = { stroke: '#0002', strokeWidth: 1.5 };
const CURLS = [
  [60, 64],
  [72, 47],
  [91, 38],
  [109, 38],
  [128, 47],
  [140, 64],
  [57, 82],
  [143, 82],
];

function HairBack({ hair, color }: { hair: number; color: string }) {
  if (hair === 1)
    return (
      <path
        d="M54 80Q54 30 100 30Q146 30 146 80L150 175Q128 185 124 120L76 120Q72 185 50 175Z"
        fill={color}
      />
    );
  if (hair !== 2) return null;
  return (
    <>
      <circle cx={48} cy={92} r={18} fill={color} />
      <circle cx={152} cy={92} r={18} fill={color} />
    </>
  );
}

function HairFront({ hair, color }: { hair: number; color: string }) {
  if (hair === 3)
    return CURLS.map(([cx, cy]) => (
      <circle key={cx * 1000 + cy} cx={cx} cy={cy} r={15} fill={color} />
    ));
  if (hair === 4)
    return (
      <path
        d="M58 80L54 50L70 60L72 30L88 50L100 22L112 50L128 30L130 60L146 50L142 80Q130 56 100 58Q70 56 58 80Z"
        fill={color}
      />
    );
  return <path d="M57 82Q54 32 100 32Q146 32 143 82Q132 54 100 56Q68 54 57 82Z" fill={color} />;
}

function Bottom({ bottom, color }: { bottom: number; color: string }) {
  if (bottom === 2) return <path d="M68 198H132L150 250H50Z" fill={color} {...EDGE} />;
  const leg = bottom === 0 ? 66 : 30;
  return (
    <>
      <rect x={70} y={198} width={60} height={24} rx={6} fill={color} {...EDGE} />
      <rect x={76} y={210} width={22} height={leg} rx={6} fill={color} {...EDGE} />
      <rect x={102} y={210} width={22} height={leg} rx={6} fill={color} {...EDGE} />
    </>
  );
}

function Top({ top, color }: { top: number; color: string }) {
  if (top === 1) return <path d="M68 128H132L158 254H42Z" fill={color} {...EDGE} />;
  const hoodie = top === 2;
  return (
    <>
      <rect x={64} y={128} width={72} height={hoodie ? 84 : 78} rx={14} fill={color} {...EDGE} />
      {hoodie && (
        <>
          <path d="M82 128Q100 150 118 128" fill="none" stroke="#0003" strokeWidth={5} />
          <rect x={84} y={176} width={32} height={20} rx={6} fill="#0001" />
        </>
      )}
    </>
  );
}

function Face({ skin }: { skin: string }) {
  return (
    <>
      <circle cx={100} cy={80} r={42} fill={skin} />
      <circle cx={85} cy={80} r={5} fill="#2d2d3a" />
      <circle cx={115} cy={80} r={5} fill="#2d2d3a" />
      <circle cx={87} cy={78} r={1.6} fill="#fff" />
      <circle cx={117} cy={78} r={1.6} fill="#fff" />
      <circle cx={74} cy={94} r={7} fill="#ff7eb6" opacity={0.45} />
      <circle cx={126} cy={94} r={7} fill="#ff7eb6" opacity={0.45} />
      <path
        d="M87 97Q100 110 113 97"
        fill="none"
        stroke="#2d2d3a"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </>
  );
}

export function Character({ look, className }: { look: Look; className?: string }) {
  const skin = SKIN[look.skin];
  const hair = HAIR_COLORS[look.hairColor];
  const top = CLOTH[look.topColor];
  const shoe = CLOTH[look.shoes];
  const sleeve = look.top === 2 ? 64 : 28;
  return (
    <svg viewBox="0 0 200 300" role="img" aria-label="Your character" className={className}>
      <HairBack hair={look.hair} color={hair} />
      <rect x={78} y={205} width={18} height={74} rx={8} fill={skin} />
      <rect x={104} y={205} width={18} height={74} rx={8} fill={skin} />
      <ellipse cx={85} cy={284} rx={16} ry={9} fill={shoe} {...EDGE} />
      <ellipse cx={115} cy={284} rx={16} ry={9} fill={shoe} {...EDGE} />
      {look.top !== 1 && <Bottom bottom={look.bottom} color={CLOTH[look.bottomColor]} />}
      <rect x={45} y={132} width={18} height={74} rx={9} fill={skin} />
      <rect x={137} y={132} width={18} height={74} rx={9} fill={skin} />
      <rect x={92} y={110} width={16} height={24} fill={skin} />
      <Top top={look.top} color={top} />
      <rect x={45} y={130} width={18} height={sleeve} rx={9} fill={top} {...EDGE} />
      <rect x={137} y={130} width={18} height={sleeve} rx={9} fill={top} {...EDGE} />
      <Face skin={skin} />
      <HairFront hair={look.hair} color={hair} />
      {look.hat > 0 && (
        <text x={100} y={44} fontSize={46} textAnchor="middle">
          {HATS[look.hat]}
        </text>
      )}
    </svg>
  );
}
