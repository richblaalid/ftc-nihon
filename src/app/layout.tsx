import type { Metadata, Viewport } from 'next';
import { Urbanist } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { BottomNav } from '@/components/ui';
import { UpdateBanner } from '@/components/ui/UpdateBanner';
import { Providers } from './providers';

// Primary body font - Urbanist
const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// Display font - Reggae One (for headlines)
// Note: Reggae One has Japanese character support which adds to the theme
const reggaeOne = localFont({
  src: './fonts/ReggaeOne-Regular.ttf',
  variable: '--font-reggae',
  display: 'swap',
  preload: true,
});

// Keep Geist Mono for any code/monospace needs
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'FTC: Nihon',
  description: 'Travel concierge for the Finer Things Club Japan trip',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FTC: Nihon',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Removed maximumScale and userScalable - WCAG 1.4.4 requires zoom capability
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFBF7' }, // Cream background
    { media: '(prefers-color-scheme: dark)', color: '#0D1117' }, // Indigo black
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${urbanist.variable} ${reggaeOne.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ServiceWorkerRegistration />
        <Providers>
          <UpdateBanner />
          <div className="fixed inset-0 flex flex-col">
            <main
              id="main-scroll-container"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
            >
              {children}
            </main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
