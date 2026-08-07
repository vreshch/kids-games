import type { Metadata, Viewport } from 'next';
import './globals.css';

import { ServiceWorker } from '@/components/service-worker';

export const metadata: Metadata = {
  title: "Alysa's Games",
  description: 'A little collection of browser games.',
  appleWebApp: { capable: true, title: "Alysa's Games", statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // small fingers double-tap a lot; zooming mid-game is never what they meant
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
