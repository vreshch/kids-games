'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

function letterTexture(letter: string, color: string) {
  const key = `${letter}|${color}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.font = 'bold 190px "Comic Sans MS", "Chalkboard SE", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.lineWidth = 18;
  ctx.strokeStyle = color;
  ctx.strokeText(letter, 128, 140);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(letter, 128, 140);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}

type Props = {
  letter: string;
  color: string;
  position: [number, number, number];
  scale?: number;
  opacity?: number;
};

/** Camera-facing glowing letter, drawn on a canvas so no font files load. */
export function LetterSprite({ letter, color, position, scale = 1.1, opacity = 1 }: Props) {
  const map = useMemo(() => letterTexture(letter, color), [letter, color]);
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={map} transparent opacity={opacity} depthWrite={false} />
    </sprite>
  );
}
