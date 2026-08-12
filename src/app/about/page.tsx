import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who makes these games: Alisa, age 5, with a little help from Claude Code.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About', url: '/about' },
};

const ALISA_BIRTHDAY = { year: 2020, month: 10, day: 5 };

function alisaAge(): number {
  const now = new Date();
  const hadBirthdayThisYear =
    now.getMonth() + 1 > ALISA_BIRTHDAY.month ||
    (now.getMonth() + 1 === ALISA_BIRTHDAY.month && now.getDate() >= ALISA_BIRTHDAY.day);
  return now.getFullYear() - ALISA_BIRTHDAY.year - (hadBirthdayThisYear ? 0 : 1);
}

export default function AboutPage() {
  const age = alisaAge();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-5 py-10 sm:py-16 lg:max-w-3xl">
      <Image
        src="/banner.svg"
        alt="Alisa's Games - a crystal, the letters A L I S A, and games.vreshch.com"
        width={1200}
        height={300}
        priority
        className="w-full rounded-2xl border border-neutral-800"
      />
      <h1 className="text-center text-3xl font-bold sm:text-4xl lg:text-5xl">About these games</h1>
      <div className="flex flex-col gap-4 text-lg leading-relaxed text-neutral-300 lg:text-xl">
        <p>
          Every game here was invented by <strong className="text-white">Alisa Vreshch</strong>, who
          is {age} years old. The monsters, the parrot, the crystal caves - all her ideas.{' '}
          <a
            href="https://claude.com/claude-code"
            className="text-teal-400 underline underline-offset-4"
          >
            Claude Code
          </a>{' '}
          turns them into working code.
        </p>
        <p>
          Her dad,{' '}
          <a href="https://vreshch.com" className="text-teal-400 underline underline-offset-4">
            Volodymyr Vreshch
          </a>
          , sits next to her, holds the phone, and merges the pull requests.
        </p>
        <ol className="list-decimal space-y-1 pl-6 text-neutral-400">
          <li>Alisa draws the game on paper.</li>
          <li>She tells Claude Code what to build - through the microphone.</li>
          <li>Claude Code builds it.</li>
          <li>Alisa plays it and asks for changes. Repeat until it is fun.</li>
        </ol>
        <p>
          The whole site is open source at{' '}
          <a
            href="https://github.com/vreshch/kids-games"
            className="text-teal-400 underline underline-offset-4"
          >
            github.com/vreshch/kids-games
          </a>
          . No accounts, no ads, no personal data - just games.
        </p>
      </div>
      <Link
        href="/"
        className="mx-auto rounded-2xl bg-teal-500 px-8 py-4 text-lg font-semibold text-neutral-950 transition active:scale-95"
      >
        Play the games
      </Link>
    </main>
  );
}
