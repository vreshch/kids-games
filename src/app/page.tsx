import Link from 'next/link';

import { GAMES } from '@/lib/games';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <h1 className="text-center text-4xl font-bold">Alyssa&apos;s Games</h1>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map(({ slug, title, tagline, accent, Icon }) => (
          <li key={slug}>
            <Link
              href={`/${slug}`}
              className="flex h-full flex-col items-center gap-4 rounded-2xl border border-neutral-700/60 bg-neutral-900/40 p-6 text-center transition hover:-translate-y-1 hover:border-neutral-500"
              style={{ boxShadow: `0 0 0 0 ${accent}` }}
            >
              <Icon className="h-24 w-24" />
              <span className="text-xl font-semibold">{title}</span>
              <span className="text-sm text-neutral-400">{tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
