import Link from 'next/link';
import type { ReactNode } from 'react';

export function GameShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/"
        className="inline-flex min-h-12 touch-manipulation items-center self-start px-5 text-base text-neutral-500 transition active:text-neutral-200 [@media(hover:hover)]:hover:text-neutral-200"
      >
        &larr; all games
      </Link>
      <div className="flex flex-1 items-center justify-center py-4">{children}</div>
    </main>
  );
}
