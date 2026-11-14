import { gameOgImage, OG_SIZE } from '@/lib/og-card';

export const alt = 'Munch Maze on Alisa\x27s Games';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
  return gameOgImage('munch-maze');
}
