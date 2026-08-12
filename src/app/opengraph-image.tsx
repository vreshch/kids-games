import { ImageResponse } from 'next/og';

import { SITE_NAME } from '@/lib/site';

export const alt = `${SITE_NAME} - little browser games built by a 5-year-old`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const LETTERS = [
  { letter: 'A', color: '#38bdf8' },
  { letter: 'L', color: '#4ade80' },
  { letter: 'I', color: '#c084fc' },
  { letter: 'S', color: '#fbbf24' },
  { letter: 'A', color: '#f472b6' },
];

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 70,
        background: 'linear-gradient(135deg, #0b1220 0%, #131f3a 60%, #0d2438 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      <svg viewBox="0 0 48 48" width={300} height={300}>
        <path d="M 24 3 L 38 14 L 33 43 L 15 43 L 10 14 Z" fill="#2dd4bf" />
        <path d="M 24 3 L 38 14 L 24 20 Z" fill="#5eead4" />
        <path d="M 24 3 L 10 14 L 24 20 Z" fill="#99f6e4" />
        <path d="M 10 14 L 15 43 L 24 20 Z" fill="#14b8a6" />
        <path d="M 38 14 L 33 43 L 24 20 Z" fill="#0d9488" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, color: '#f8fafc' }}>
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#94a3b8', maxWidth: 620 }}>
          Little browser games built by Alisa, age 5, with a little help from Claude Code.
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {LETTERS.map(({ letter, color }, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: 18,
                border: `3px solid ${color}`,
                color,
                fontSize: 44,
                fontWeight: 700,
                background: 'rgba(15, 23, 42, 0.6)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#5eead4' }}>games.vreshch.com</div>
      </div>
    </div>,
    size
  );
}
