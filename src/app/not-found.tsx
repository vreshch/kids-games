import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="text-7xl">🔍</p>
      <h1 className="text-3xl font-bold">This room is empty!</h1>
      <p className="text-neutral-400">There is no game here. Let&apos;s go back and pick one.</p>
      <Link
        href="/"
        className="rounded-2xl bg-teal-500 px-8 py-4 text-lg font-semibold text-neutral-950 transition active:scale-95"
      >
        Back to the games
      </Link>
    </main>
  );
}
