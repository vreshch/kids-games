import { PETS } from '@/lib/secret-pet-land-data';
import { hasPet, type World } from '@/lib/secret-pet-land-world';

import { Character } from './character';
import { Spot } from './scene-parts';
import { Wardrobe, type WardrobeProps } from './wardrobe';

type HomeProps = Omit<WardrobeProps, 'look'> & { world: World; onGift: () => void };

export function HomeScene({ world, onGift, ...wardrobe }: HomeProps) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#ffe3ec]">
      <div className="relative flex min-h-0 flex-1 items-end justify-center bg-[linear-gradient(#ffe3ec_0_72%,#f5c58a_72%_100%)] pb-1.5">
        <Character look={world.look} className="h-[96%] max-w-[60%]" />
        <div className="absolute bottom-1.5 left-1.5 flex w-[22%] flex-wrap gap-0.5 text-[clamp(24px,8vw,40px)] leading-[1.1]">
          {PETS.filter((p) => hasPet(world, p.id)).map((p) => (
            <span key={p.id} role="img" aria-label={p.name}>
              {p.emoji}
            </span>
          ))}
        </div>
        {!hasPet(world, 'kitten') && (
          <Spot x={86} y={80} label="Present" onTap={onGift}>
            🎁
          </Spot>
        )}
      </div>
      <Wardrobe look={world.look} {...wardrobe} />
    </div>
  );
}
