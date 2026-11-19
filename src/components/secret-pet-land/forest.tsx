import { hasPet, mushroomVisible } from '@/lib/secret-pet-land-world';

import { cn } from './cn';
import type { SceneProps } from './farm-pond';
import { Deco, Spot } from './scene-parts';

function Tree({ world, onTap }: SceneProps) {
  const night = world.puzzles.night;
  const owl = hasPet(world, 'owl');
  return (
    <div className="pointer-events-none absolute top-[10%] left-[8%] h-[66%] w-[44%]">
      <div className="absolute inset-[0_0_42%_0] rounded-full bg-[#3c9a4a] shadow-[inset_-12px_-12px_0_#2f7f3c]" />
      <div className="absolute top-[48%] bottom-0 left-[34%] w-[32%] rounded-lg bg-[#8a5a2b]">
        <button
          type="button"
          aria-label="Tree hole"
          onClick={() => onTap('hole')}
          className="pointer-events-auto absolute top-[38%] left-1/2 flex aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-[#2b1a0c] text-[clamp(22px,7vw,38px)] leading-none"
        >
          {owl ? '🦉' : night ? '👀' : ''}
        </button>
      </div>
    </div>
  );
}

export function ForestScene(props: SceneProps) {
  const { world, onTap } = props;
  const night = world.puzzles.night;
  return (
    <div
      className={cn(
        'absolute inset-0',
        night
          ? 'bg-[linear-gradient(#1b2550_0_40%,#234a38_40%_100%)]'
          : 'bg-[linear-gradient(#bfe9ff_0_40%,#5fae5a_40%_100%)]'
      )}
    >
      <Spot x={84} y={9} label={night ? 'Moon' : 'Sun'} onTap={() => onTap('sun')}>
        {night ? '🌙' : '☀️'}
      </Spot>
      {night && (
        <>
          <Deco x={20} y={8} emoji="✨" />
          <Deco x={55} y={14} emoji="⭐" />
          <Deco x={70} y={26} emoji="✨" />
        </>
      )}
      <Deco x={86} y={36} emoji="🌲" size="big" />
      <Tree {...props} />
      <Spot
        x={72}
        y={64}
        label="Bush"
        onTap={() => onTap('bush')}
        className="h-[13%] w-[30%] rounded-[50%] bg-[#2f8f3f] shadow-[inset_-8px_-8px_0_#24742f]"
      />
      {mushroomVisible(world) && (
        <Spot x={90} y={76} label="Mushroom" onTap={() => onTap('mushroom')}>
          🍄
        </Spot>
      )}
      <Spot
        x={40}
        y={88}
        label="Log"
        onTap={() => onTap('log')}
        className="h-[9%] w-[38%] rounded-[30px] border-[3px] border-[#6f4a22] bg-[#9b6a35] after:absolute after:top-[12%] after:right-[3%] after:bottom-[12%] after:w-[16%] after:rounded-full after:bg-[#3a2410]"
      />
      {hasPet(world, 'hedgehog') && <Deco x={68} y={88} emoji="🦔" size="pet" />}
    </div>
  );
}
