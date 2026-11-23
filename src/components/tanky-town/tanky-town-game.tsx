'use client';

import { LEVEL_COUNT } from '@/lib/tanky-town-level';

import { DrivePad, FireButton, Lives } from './hud';
import { EndPanel, MenuPanel, NoticePanel, SharePanel } from './overlays';
import { useTankGame, type TankGame } from './use-tank-game';

/** The screen state the panels need; no refs, so it is safe to read while rendering. */
type Lobby = Omit<TankGame, 'canvasRef' | 'inputRef'>;
import { banner } from './view';

/** The one panel that covers the board right now, if any. */
function Panel({ game }: { game: Lobby }) {
  const { mode, view, duo } = game;
  const alone = { label: 'Play alone', onPlay: game.playSolo };
  if (duo.status === 'full')
    return <NoticePanel icon="🙈" title="This game already has two players" action={alone} />;
  if (duo.status === 'expired')
    return <NoticePanel icon="⏰" title="This link is too old" action={alone} />;
  if (mode === 'idle' && duo.status === 'off')
    return (
      <MenuPanel invited={!!game.invited} onSolo={game.playSolo} onTogether={game.playTogether} />
    );
  if (mode === 'idle') return <SharePanel link={game.link} onAlone={game.playSolo} />;
  if (mode === 'guest' && !view) return <NoticePanel icon="🚀" title="Joining your friend..." />;
  if (mode === 'guest' && (duo.status !== 'open' || duo.peers < 2))
    return (
      <NoticePanel icon="👋" title="Your friend left" text="Waiting for them to come back..." />
    );
  if (view && (view.phase === 'over' || view.phase === 'won'))
    return (
      <EndPanel
        score={view.score}
        level={view.level}
        won={view.phase === 'won'}
        onPlay={game.playAgain}
      />
    );
  return null;
}

function statusLine({ mode, view, duo }: Lobby) {
  if (mode === 'host' && duo.status === 'lost') return 'Connection lost, trying again...';
  if (mode === 'host' && duo.peers < 2) return 'Your friend left. The link still works.';
  return banner(view);
}

export function TankyTownGame() {
  const { canvasRef, inputRef, ...game } = useTankGame();
  const { view, mode } = game;
  const together = mode === 'host' || mode === 'guest';
  return (
    <div className="short:grid short:grid-cols-[auto_1fr_auto] short:grid-rows-[auto_1fr_auto] short:gap-x-4 flex w-full max-w-3xl flex-1 flex-col items-center gap-1 self-stretch px-2 select-none sm:gap-2">
      <div className="short:col-span-3 flex w-full items-center justify-between px-2 text-lg font-bold text-amber-200">
        <span aria-label={`${view?.score ?? 0} points`}>⭐ {view?.score ?? 0}</span>
        <span className="text-sm text-neutral-400">
          level {(view?.level ?? 0) + 1} of {LEVEL_COUNT}
          {together && <span aria-label="your tank"> · you {mode === 'host' ? '🟡' : '🟢'}</span>}
        </span>
        <Lives lives={view?.lives ?? 3} />
      </div>
      <div className="short:col-start-2 short:row-start-2 short:h-full short:min-h-[200px] relative min-h-[240px] w-full flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          aria-label="Tanky Town field"
        />
        <Panel game={game} />
      </div>
      <div
        className="short:col-span-3 short:row-start-3 h-7 text-center text-base font-semibold text-amber-100"
        aria-live="polite"
      >
        {statusLine(game)}
      </div>
      <div className="short:contents flex w-full max-w-md items-center justify-between px-4 pb-2">
        <div className="short:col-start-1 short:row-start-2">
          <DrivePad onDir={(dir) => (inputRef.current.dir = dir)} />
        </div>
        <div className="short:col-start-3 short:row-start-2">
          <FireButton onFire={(down) => (inputRef.current.fire = down)} />
        </div>
      </div>
    </div>
  );
}
