import Link from 'next/link';
import type { ReactNode } from 'react';

export function GameShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm text-neutral-500 transition hover:text-neutral-200"
      >
        &larr; all games
      </Link>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </main>
  );
}
