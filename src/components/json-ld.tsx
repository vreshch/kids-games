import { GAMES } from '@/lib/games';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', ...data }),
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
      }}
    />
  );
}

export function GameJsonLd({ slug }: { slug: string }) {
  const game = GAMES.find((entry) => entry.slug === slug);
  if (!game) return null;
  return (
    <JsonLd
      data={{
        '@type': 'VideoGame',
        name: game.title,
        description: game.tagline,
        url: `${SITE_URL}/${game.slug}`,
        gamePlatform: 'Web browser',
        applicationCategory: 'Game',
        isAccessibleForFree: true,
        author: { '@type': 'Person', name: 'Alisa Vreshch' },
        audience: { '@type': 'PeopleAudience', suggestedMinAge: 3 },
      }}
    />
  );
}
