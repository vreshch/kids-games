import Link from 'next/link';

import { GAMES } from '@/lib/games';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-9 px-5 py-10 [background:radial-gradient(70%_45%_at_50%_0%,rgba(45,212,191,0.08),transparent)] sm:gap-12 sm:py-16 lg:max-w-5xl">
      <header className="flex flex-col items-center gap-4 text-center">
        <h1 className="bg-gradient-to-r from-teal-300 via-sky-300 to-violet-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          Alisa&apos;s Games
        </h1>
        <p className="max-w-md text-balance text-neutral-400 sm:max-w-lg sm:text-lg">
          Little games invented by Alisa, age 5 - drawn on paper, dictated to Claude Code, played on
          the phone.
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
        {GAMES.map(({ slug, title, tagline, accent, Icon }) => (
          <li key={slug}>
            <Link
              href={`/${slug}`}
              style={{ '--accent': accent } as React.CSSProperties}
              className="flex h-full touch-manipulation flex-col items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-neutral-900/50 p-6 text-center transition active:scale-[0.97] active:border-[var(--accent)] sm:gap-4 lg:p-8 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-[var(--accent)] [@media(hover:hover)]:hover:shadow-[0_10px_36px_-10px_var(--accent)]"
            >
              <span className="rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_70%)] p-2">
                <Icon className="h-24 w-24 lg:h-28 lg:w-28" />
              </span>
              <span className="text-xl font-semibold lg:text-2xl">{title}</span>
              <span className="text-sm text-neutral-400 lg:text-base">{tagline}</span>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-center gap-x-2 text-sm text-neutral-500 lg:text-base">
        <span>Made by Alisa with a little help from Claude Code</span>
        <span aria-hidden>·</span>
        <Link href="/about" className="text-teal-500 underline underline-offset-4">
          About
        </Link>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/vreshch/kids-games"
          className="text-teal-500 underline underline-offset-4"
        >
          GitHub
        </a>
      </footer>
    </main>
  );
}
