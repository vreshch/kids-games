import { GAMES } from '@/lib/games';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export function GET(): Response {
  const games = GAMES.map(
    (game) => `- [${game.title}](${SITE_URL}/${game.slug}): ${game.tagline}`
  ).join('\n');

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Alisa sketches a game on paper, dictates the requirements to Claude Code through the
microphone, plays the result on the phone, and asks for changes until it is fun. Her dad
reviews and merges the pull requests.

## Games

${games}

## Pages

- [About](${SITE_URL}/about): who makes the games and how
- [Source code](https://github.com/vreshch/kids-games): MIT, the whole site
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
