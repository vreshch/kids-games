import { create } from 'qrcode';

export type QrShape = { size: number; path: string };

/** Every dark module as one SVG path of unit squares, so the code prints sharp at any size. */
export function qrShape(text: string): QrShape {
  const { modules } = create(text, { errorCorrectionLevel: 'M' });
  let path = '';
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) path += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { size: modules.size, path };
}
