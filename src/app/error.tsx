'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="text-7xl">🙈</p>
      <h1 className="text-3xl font-bold">Oops, something broke!</h1>
      <p className="text-neutral-400">Don&apos;t worry - one tap and we try again.</p>
      <button
        onClick={reset}
        className="rounded-2xl bg-teal-500 px-8 py-4 text-lg font-semibold text-neutral-950 transition active:scale-95"
      >
        Try again
      </button>
    </main>
  );
}
