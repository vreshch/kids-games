export type ParrotState = 'idle' | 'listening' | 'thinking' | 'talking' | 'denied';

const BEAK_HINGE = { transformBox: 'view-box', transformOrigin: '68px 92px' } as const;

function Head({ talking }: { talking: boolean }) {
  return (
    <g>
      <circle cx={96} cy={78} r={44} fill="#22c55e" />
      <circle cx={84} cy={88} r={26} fill="#fde047" />
      <path d="M 96 34 Q 118 18 138 30 Q 120 34 112 46 Z" fill="#ef4444" />
      <circle cx={90} cy={68} r={11} fill="#fffdf5" />
      <circle cx={88} cy={68} r={5.5} fill="#1a1a1a" />
      <path d="M 70 74 Q 30 80 48 102 Q 64 98 72 88 Z" fill="#fb923c" />
      <path
        d="M 48 102 Q 62 110 72 96 L 70 88 Q 60 100 48 102 Z"
        fill="#ea580c"
        className={talking ? 'animate-beak' : ''}
        style={BEAK_HINGE}
      />
    </g>
  );
}

function Body() {
  return (
    <g>
      <path d="M 118 146 Q 150 168 170 194 L 142 188 Q 124 174 108 158 Z" fill="#0ea5e9" />
      <ellipse cx={100} cy={146} rx={44} ry={54} fill="#22c55e" />
      <ellipse cx={92} cy={156} rx={26} ry={36} fill="#86efac" />
      <ellipse cx={118} cy={142} rx={20} ry={36} fill="#15803d" />
    </g>
  );
}

function Perch() {
  return (
    <g>
      <path d="M 88 196 L 88 208 M 110 196 L 110 208" stroke="#a16207" strokeWidth={6} />
      <rect x={34} y={206} width={132} height={9} rx={4.5} fill="#92400e" />
    </g>
  );
}

export function Parrot({ state }: { state: ParrotState }) {
  const listening = state === 'listening';
  return (
    <svg viewBox="0 0 200 224" className="w-[40vmin]" role="img" aria-label="Perot the parrot">
      {listening && <circle cx={100} cy={130} r={96} fill="#22c55e" className="animate-listen" />}
      <g
        className={state === 'thinking' ? 'animate-bob' : ''}
        style={{
          transformBox: 'view-box',
          transformOrigin: '100px 190px',
          transform: listening ? 'rotate(-7deg)' : 'rotate(0deg)',
          transition: 'transform 220ms ease-out',
        }}
      >
        <Perch />
        <Body />
        <Head talking={state === 'talking'} />
      </g>
    </svg>
  );
}
