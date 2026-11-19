import {
  kidOf,
  NAMES,
  SWATCHES,
  TABS,
  type Kid,
  type Look,
  type LookPart,
  type TabId,
} from '@/lib/secret-pet-land-look';

import { cn } from './cn';

export type WardrobeProps = {
  look: Look;
  tab: TabId;
  onTab: (tab: TabId) => void;
  onPick: (part: LookPart, index: number) => void;
  onKid: (kid: Kid) => void;
};

const ROW = 'flex gap-1.5 overflow-x-auto p-0.5 [scrollbar-width:none]';
const CHIP =
  'h-11 flex-none rounded-full border-[3px] px-3.5 text-[17px] font-bold text-[#3a2460] touch-manipulation';
const chipState = (on: boolean) =>
  on ? 'border-[#8a5cf6] bg-[#e3d4ff]' : 'border-[#eadcff] bg-[#f6efff]';

function KidChips({ look, onKid }: Pick<WardrobeProps, 'look' | 'onKid'>) {
  const kid = kidOf(look);
  const kids: [Kid, string][] = [
    ['girl', '👧 Girl'],
    ['boy', '👦 Boy'],
  ];
  return kids.map(([id, text]) => (
    <button
      key={id}
      type="button"
      className={cn(CHIP, chipState(kid === id))}
      onClick={() => onKid(id)}
    >
      {text}
    </button>
  ));
}

function Options({ look, tab, onPick, onKid }: Omit<WardrobeProps, 'onTab'>) {
  if (tab === 'kid') return <KidChips look={look} onKid={onKid} />;
  if (tab === 'random') return null;
  const swatches = SWATCHES[tab];
  if (swatches)
    return swatches.map((color, i) => (
      <button
        key={color}
        type="button"
        aria-label={`Color ${i + 1}`}
        style={{ background: color }}
        onClick={() => onPick(tab, i)}
        className={cn(
          'size-11 flex-none touch-manipulation rounded-full border-[3px] border-white',
          look[tab] === i ? 'shadow-[0_0_0_4px_#8a5cf6]' : 'shadow-[0_0_0_2px_#cdb8f5]'
        )}
      />
    ));
  return (NAMES[tab] ?? []).map((name, i) => (
    <button
      key={name}
      type="button"
      onClick={() => onPick(tab, i)}
      className={cn(CHIP, chipState(look[tab] === i))}
    >
      {name}
    </button>
  ));
}

export function Wardrobe(props: WardrobeProps) {
  const { tab, onTab } = props;
  return (
    <div className="flex-none border-t-4 border-[#ff7eb6] bg-white p-1.5">
      <div className={ROW}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-label={t.label}
            aria-pressed={tab === t.id}
            onClick={() => onTab(t.id)}
            className={cn(
              'size-[46px] flex-none touch-manipulation rounded-2xl border-[3px] text-2xl',
              tab === t.id ? 'border-[#8a5cf6] bg-[#e3d4ff]' : 'border-[#eadcff] bg-[#f6efff]'
            )}
          >
            {t.emoji}
          </button>
        ))}
      </div>
      <div className={cn(ROW, 'mt-1.5 min-h-[52px] items-center')}>
        <Options {...props} />
      </div>
    </div>
  );
}
