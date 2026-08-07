# kids-games

Browser games for Alysa, live at **https://games.vreshch.com**. Next.js (App Router) + React +
TypeScript + Tailwind.

The home page is a grid of games. Add one by dropping a component in `src/components/`,
a page in `src/app/<slug>/`, and an entry in `src/lib/games.ts` - the grid picks it up.

| Game        | What it does                                                             |
| ----------- | ------------------------------------------------------------------------ |
| Scary Smile | Click the smile through 7 stages until it is a black monster that roars. |
| Perot       | Hold SPACE, say something; the parrot squawks it back pitched up.        |

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Verify

```bash
npm run verify   # type-check + lint + format check + build
```

## Deploy

Push to `master`. CI builds `ghcr.io/vreshch/kids-games`, deploys the `kids-games` Swarm stack
behind Traefik, then fails the run unless `https://games.vreshch.com/api/version` reports the
deployed commit. Never deploy by hand.

Repo secrets: `SERVER_HOST`, `SSH_PRIVATE_KEY` (environment `production`).
