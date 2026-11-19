'use client';

import { useState, useSyncExternalStore } from 'react';

import { beep } from '@/lib/secret-pet-land-audio';
import type { PlaceId } from '@/lib/secret-pet-land-data';
import { applyKid, randomLook, setPart, type TabId } from '@/lib/secret-pet-land-look';
import { tap, type Target } from '@/lib/secret-pet-land-puzzles';
import { loadWorld } from '@/lib/secret-pet-land-save';
import { clueFor, PET_COUNT, type PadSize, type World } from '@/lib/secret-pet-land-world';

import { FarmScene, PondScene } from './farm-pond';
import { ForestScene } from './forest';
import { HomeScene } from './home';
import { Bubble, CardButton, Hand, PlaceNav, TopBar } from './hud';
import { OverlayView } from './overlays';
import { usePetLand } from './use-pet-land';

const SCENES = { farm: FarmScene, pond: PondScene, forest: ForestScene };
const FRAME =
  'flex w-full max-w-[560px] flex-1 flex-col self-stretch overflow-hidden rounded-2xl bg-[#2b1d4f] select-none';
const noSubscribe = () => () => {};

function Land({ initial }: { initial: World }) {
  const game = usePetLand(initial);
  const { world, overlay, apply, commit } = game;
  const [place, setPlace] = useState<PlaceId>('home');
  const [tab, setTab] = useState<TabId>('kid');

  const onTap = (target: Target, pad?: PadSize) =>
    apply(tap(world, target, { now: Date.now(), pad }));
  const restyle = (look: World['look'], freq: number) => {
    commit({ ...world, look });
    beep(freq, 0.08);
  };
  const onTab = (next: TabId) => {
    if (next === 'random') restyle(randomLook(Math.random), 700);
    else setTab(next);
  };
  const go = (next: PlaceId) => {
    beep(520, 0.08);
    setPlace(next);
  };
  const openBook = () => {
    beep(520, 0.08);
    game.setOverlay({ kind: 'book' });
  };
  const openCard = () => {
    beep(880, 0.2);
    game.setOverlay({ kind: 'card', text: clueFor(world, place) });
  };

  const Scene = place === 'home' ? null : SCENES[place];
  return (
    <div className={FRAME}>
      <TopBar count={world.found.length} total={PET_COUNT} />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {Scene ? (
          <Scene world={world} onTap={onTap} />
        ) : (
          <HomeScene
            world={world}
            tab={tab}
            onTab={onTab}
            onGift={() => onTap('gift')}
            onPick={(part, i) => restyle(setPart(world.look, part, i), 600)}
            onKid={(kid) => restyle(applyKid(world.look, kid), 600)}
          />
        )}
        {world.hand && <Hand item={world.hand} onDrop={game.drop} />}
        <CardButton onOpen={openCard} />
        <Bubble {...game.bubble} />
        {overlay && (
          <OverlayView
            overlay={overlay}
            world={world}
            resetArmed={game.resetArmed}
            onReset={game.reset}
            onClose={game.closeOverlay}
          />
        )}
      </div>
      <PlaceNav place={place} onGo={go} onBook={openBook} />
    </div>
  );
}

/** Saved pets live in localStorage, so the world mounts only in the browser. */
export function SecretPetLandGame() {
  const client = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  );
  if (!client) return <div className={FRAME} aria-busy="true" />;
  return <Land initial={loadWorld()} />;
}
