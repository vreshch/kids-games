import Link from 'next/link';

import { GAMES } from '@/lib/games';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 px-5 py-10 sm:gap-10 sm:py-16">
      <h1 className="text-center text-3xl font-bold sm:text-4xl">Alyssa&apos;s Games</h1>
      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {GAMES.map(({ slug, title, tagline, accent, Icon }) => (
          <li key={slug}>
            <Link
              href={`/${slug}`}
              className="flex h-full touch-manipulation flex-col items-center gap-3 rounded-2xl border border-neutral-700/60 bg-neutral-900/40 p-6 text-center transition active:scale-[0.97] active:border-neutral-500 sm:gap-4 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-neutral-500"
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
