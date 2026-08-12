import { ImageResponse } from 'next/og';

import { GAMES } from './games';
import { SITE_NAME } from './site';

export const OG_SIZE = { width: 1200, height: 630 };

/** Solid mix of the accent into the dark base - satori mishandles translucent gradient stops. */
function tint(hex: string, amount: number): string {
  const accent = parseInt(hex.slice(1), 16);
  const base = 0x131f3a;
  const channel = (shift: number) => {
    const a = (accent >> shift) & 255;
    const b = (base >> shift) & 255;
    return Math.round(b + (a - b) * amount);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/** Shared OG card for game pages: accent-tinted crystal-cave look, no fonts or assets. */
export function gameOgImage(slug: string) {
  const game = GAMES.find((entry) => entry.slug === slug);
  const title = game?.title ?? SITE_NAME;
  const tagline = game?.tagline ?? '';
  const accent = game?.accent ?? '#2dd4bf';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 34,
        background: `linear-gradient(135deg, #0b1220 0%, #131f3a 70%, ${tint(accent, 0.35)} 100%)`,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 130,
          height: 130,
          borderRadius: 32,
          border: `6px solid ${accent}`,
          color: accent,
          fontSize: 80,
          fontWeight: 700,
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        {title[0]}
      </div>
      <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, color: '#f8fafc' }}>
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 34,
          color: '#94a3b8',
          maxWidth: 900,
          textAlign: 'center',
        }}
      >
        {tagline}
      </div>
      <div style={{ display: 'flex', fontSize: 28, color: accent }}>
        {SITE_NAME} · games.vreshch.com
      </div>
    </div>,
    OG_SIZE
  );
}
