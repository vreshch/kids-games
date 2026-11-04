'use client';

import { trackEvent } from '@/lib/analytics';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent('book_print');
        window.print();
      }}
      className="w-fit touch-manipulation rounded-full bg-teal-400 px-6 py-3 text-lg font-semibold text-neutral-950 shadow-lg shadow-teal-400/30 transition active:scale-95"
    >
      🖨️ Print the book
    </button>
  );
}
