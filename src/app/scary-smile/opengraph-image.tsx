import { gameOgImage, OG_SIZE } from '@/lib/og-card';

export const alt = 'scary-smile on Alisa\x27s Games';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
  return gameOgImage('scary-smile');
}
