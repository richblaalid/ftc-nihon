import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FTC: Nihon',
    short_name: 'FTC Nihon',
    description: 'Travel concierge for the Finer Things Club Japan trip',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d1117',
    theme_color: '#0d1117',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
