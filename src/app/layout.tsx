import * as React from 'react';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import FooterWrapper from '@/components/FooterWrapper';

// Brand typefaces, self-hosted by Next.js (no request to Google from the visitor's browser)
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Montevar Hotel · Benin City',
  description: 'Montevar Hotel, Benin City: rooms and suites, an outdoor pool, restaurant and bar, ten to fifteen minutes from Benin Airport.',
  themeColor: '#151618',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} style={{ overflowX: 'hidden' }}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
