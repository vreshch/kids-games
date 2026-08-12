type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/** Fire a GA4 event; silent no-op in dev, tests, and browsers without GA. */
export function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}
