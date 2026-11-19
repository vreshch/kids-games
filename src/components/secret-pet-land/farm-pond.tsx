import type { Target } from '@/lib/secret-pet-land-puzzles';
import { eggVisible, hasPet, type PadSize, type World } from '@/lib/secret-pet-land-world';

import { cn } from './cn';
import { Deco, Spot, Tag } from './scene-parts';
import type { DragApi } from './use-drag';

export type SceneProps = {
  world: World;
  onTap: (target: Target, pad?: PadSize) => void;
  drag: DragApi;
};

/** Props that make a spot a drop target, glowing while a matching item hovers it. */
export const dropZone = (drag: DragApi, target: Target) => ({
  drop: target,
  hot: drag.hot === target,
});

const SOIL = ['', '🌱', '🥬'];

function Rock({ world, onTap }: SceneProps) {
  const taps = world.puzzles.rockTaps;
  return (
    <Spot x={28} y={84} label="Rock" onTap={() => onTap('rock')} className="h-[12%] w-[26%]">
      <span
        key={taps.at(-1) ?? 0}
        className={cn(
          'h-full w-full rounded-[48%_52%_40%_45%/60%_62%_38%_40%] border-[3px] border-[#6d7282] bg-[radial-gradient(circle_at_35%_30%,#c9ccd6,#8a8f9f)]',
          taps.length > 0 && 'animate-spl-wobble'
        )}
      />
    </Spot>
  );
}

function Bunny({ world, onTap, drag }: SceneProps) {
  if (hasPet(world, 'bunny')) return <Deco x={50} y={80} emoji="🐰" size="pet" />;
  if (!world.puzzles.rockOpen) return null;
  return (
    <Spot
      x={50}
      y={80}
      label="Hungry bunny"
      onTap={() => onTap('bunny')}
      {...dropZone(drag, 'bunny')}
    >
      <span className="animate-spl-peek">🐰</span>
      <Tag>hungry!</Tag>
    </Spot>
  );
}

export function FarmScene(props: SceneProps) {
  const { world, onTap, drag } = props;
  return (
    <div className="absolute inset-0 bg-[linear-gradient(#aee3ff_0_42%,#8fd36b_42%_100%)]">
      <Deco x={84} y={8} emoji="☀️" />
      <Deco x={14} y={30} emoji="🌳" size="big" />
      <Deco x={52} y={32} emoji="🏡" size="big" />
      <Deco x={88} y={34} emoji="🌳" size="big" />
      <Spot x={15} y={54} label="Seeds" onTap={() => onTap('seeds')} onDrag={drag.start('seeds')}>
        🌰<Tag>seeds</Tag>
      </Spot>
      <Spot x={85} y={56} label="Water" onTap={() => onTap('water')} onDrag={drag.start('water')}>
        💧<Tag>water</Tag>
      </Spot>
      <Spot
        x={50}
        y={60}
        label="Soil"
        onTap={() => onTap('soil')}
        onDrag={world.puzzles.soil === 2 ? drag.start('soil') : undefined}
        {...dropZone(drag, 'soil')}
        className="h-[11%] w-[30%] rounded-[50%] border-4 border-[#5c3515] bg-[#7a4a22]"
      >
        {SOIL[world.puzzles.soil]}
      </Spot>
      <Rock {...props} />
      <Bunny {...props} />
      <Spot x={76} y={76} label="Hay" onTap={() => onTap('hay')}>
        🌾<Tag>hay</Tag>
      </Spot>
      {hasPet(world, 'chick') && <Deco x={88} y={90} emoji="🐥" size="pet" />}
      {eggVisible(world) && (
        <Spot x={88} y={90} label="Egg" onTap={() => onTap('egg')}>
          🥚
        </Spot>
      )}
    </div>
  );
}

const PADS: { size: PadSize; x: number; y: number; width: string }[] = [
  { size: 'm', x: 24, y: 60, width: 'w-[21%]' },
  { size: 'l', x: 50, y: 76, width: 'w-[30%]' },
  { size: 's', x: 76, y: 58, width: 'w-[14%]' },
];
const PAD_NAMES = { s: 'Small lily pad', m: 'Medium lily pad', l: 'Big lily pad' };

function Bubbles({ onTap, drag }: Pick<SceneProps, 'onTap' | 'drag'>) {
  const dots = [
    'left-[10%] top-[40%] size-[38%]',
    'left-[55%] top-[20%] size-[26%]',
    'left-[50%] top-[65%] size-[18%]',
  ];
  return (
    <Spot
      x={26}
      y={84}
      label="Bubbles"
      onTap={() => onTap('bubbles')}
      {...dropZone(drag, 'bubbles')}
      className="aspect-square w-[18%]"
    >
      {dots.map((place, i) => (
        <i
          key={place}
          style={{ animationDelay: `${i * 0.5}s` }}
          className={cn(
            'animate-spl-bubble absolute rounded-full border-[3px] border-white',
            place
          )}
        />
      ))}
    </Spot>
  );
}

export function PondScene({ world, onTap, drag }: SceneProps) {
  const frog = hasPet(world, 'frog');
  return (
    <div className="absolute inset-0 bg-[linear-gradient(#c9f0ff_0_36%,#9bdc7a_36%_100%)]">
      <Deco x={84} y={8} emoji="☀️" />
      <Deco x={88} y={28} emoji="🌳" size="big" />
      <Deco x={50} y={30} emoji="🌸" />
      <Spot
        x={16}
        y={30}
        label="Picnic basket"
        onTap={() => onTap('basket')}
        onDrag={drag.start('basket')}
      >
        🧺<Tag>picnic</Tag>
      </Spot>
      <div className="absolute top-[70%] left-1/2 h-1/2 w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[5px] border-[#d9c38a] bg-[radial-gradient(ellipse,#7fd6ff,#3aa6e6)]" />
      {PADS.map(({ size, x, y, width }) => (
        <Spot
          key={size}
          x={x}
          y={y}
          label={PAD_NAMES[size]}
          onTap={() => onTap('pad', size)}
          className={cn(
            'aspect-[1.25] rounded-[50%] border-4',
            width,
            frog || world.puzzles.pads.includes(size)
              ? 'border-[#f2b600] bg-[#ffe95e]'
              : 'border-[#2b8a3a] bg-[#3fae4f]'
          )}
        >
          {frog && size === 'l' ? '🐸' : ''}
        </Spot>
      ))}
      {hasPet(world, 'fish') ? (
        <Deco x={26} y={84} emoji="🐠" size="pet" />
      ) : (
        <Bubbles onTap={onTap} drag={drag} />
      )}
    </div>
  );
}
