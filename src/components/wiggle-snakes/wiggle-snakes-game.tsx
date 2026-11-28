'use client';

import type { PointerEvent } from 'react';

import { BoostButton, LengthBadge, Leaderboard, SuperButton } from './hud';
import { GameOverPanel, MenuPanel, NoticePanel, SharePanel } from './overlays';
import { useWiggleGame, type WiggleGame } from './use-wiggle-game';

/** The screen state the panels need; no refs, so it is safe to read while rendering. */
type Lobby = Omit<WiggleGame, 'canvasRef' | 'inputRef'>;

/** The one panel that covers the arena right now, if any. */
function Panel({ game }: { game: Lobby }) {
  const { mode, phase, duo, hud, ending } = game;
  const alone = { label: '▶ Play alone', onPlay: game.playSolo };
  if (duo.status === 'full')
    return <NoticePanel icon="🙈" title="This game already has two players" action={alone} />;
  if (duo.status === 'expired')
    return <NoticePanel icon="⏰" title="This link is too old" action={alone} />;
  if (phase === 'menu' && duo.status === 'off')
    return (
      <MenuPanel
        skin={game.skin}
        best={game.best}
        invited={!!game.invited}
        onSkin={game.pickSkin}
        onPlay={game.playSolo}
        onTogether={game.playTogether}
      />
    );
  const waiting = duo.status !== 'open' || duo.peers < 2;
  if ((mode === 'idle' && game.invited) || (mode === 'guest' && waiting && !hud?.player))
    return <NoticePanel icon="🚀" title="Joining your friend..." action={alone} />;
  if (mode === 'idle') return <SharePanel link={game.link} onAlone={game.playSolo} />;
  if (mode === 'guest' && waiting)
    return (
      <NoticePanel
        icon="👋"
        title="Your friend left"
        text="⏳ Waiting for them to come back..."
        action={alone}
      />
    );
  if (phase === 'over' && ending)
    return (
      <GameOverPanel
        ending={ending}
        onPlay={game.playAgain}
        onMenu={mode === 'solo' ? game.toMenu : undefined}
      />
    );
  if (mode === 'guest' && !hud?.player)
    return <NoticePanel icon="🚀" title="Joining your friend..." />;
  return null;
}

/** A small note while the host plays on alone: under the super button, or on top of a panel. */
function FriendNote({ game, playing }: { game: Lobby; playing: boolean }) {
  const { mode, duo } = game;
  if (mode !== 'host') return null;
  const text = duo.status === 'lost' ? '📡 Connecting...' : duo.peers < 2 ? '👋 Friend left' : null;
  if (!text) return null;
  return (
    <div
      className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full ${playing ? 'top-28' : 'top-3'} bg-black/55 px-3 py-1 text-sm font-semibold whitespace-nowrap text-teal-200`}
    >
      {text}
    </div>
  );
}

export function WiggleSnakesGame() {
  const { canvasRef, inputRef, ...game } = useWiggleGame();
  const { phase, hud, toast } = game;
  const playing = phase === 'play' && !!hud?.player;

  /** The head sits mid-screen, so steering is just "point from the middle to the finger". */
  const steer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    if (dx !== 0 || dy !== 0) inputRef.current.angle = Math.atan2(dy, dx);
  };

  return (
    <div
      className="relative w-full flex-1 touch-none self-stretch overflow-hidden bg-[#07091a] select-none"
      onPointerDown={(e) => {
        if (phase !== 'play') return;
        if (e.pointerType === 'mouse') inputRef.current.boosting = e.button === 0;
        else inputRef.current.steerId = e.pointerId;
        steer(e);
      }}
      onPointerMove={(e) => {
        if (phase !== 'play') return;
        if (e.pointerType === 'mouse' || e.pointerId === inputRef.current.steerId) steer(e);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'mouse') inputRef.current.boosting = false;
        if (e.pointerId === inputRef.current.steerId) inputRef.current.steerId = null;
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Snake arena" />

      {playing && hud && (
        <>
          <SuperButton
            charge={hud.charge}
            active={hud.active}
            ready={hud.ready}
            left={hud.remaining}
            onPress={game.pressSuper}
          />
          <Leaderboard board={hud.board} />
          <LengthBadge
            length={hud.player?.length ?? 0}
            rank={hud.player?.rank ?? 0}
            total={hud.total}
          />
          {game.touch && (
            <BoostButton
              onBoost={(on) => {
                inputRef.current.boosting = on;
              }}
            />
          )}
          {toast && (
            <div
              key={toast.id}
              className="pointer-events-none absolute top-[36%] left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-black/55 px-4 py-1.5 text-base font-semibold whitespace-nowrap text-amber-200"
            >
              {toast.text}
            </div>
          )}
        </>
      )}

      <Panel game={game} />
      <FriendNote game={game} playing={playing} />
    </div>
  );
}
