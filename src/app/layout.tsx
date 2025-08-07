import * as React from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import FooterWrapper from '@/components/FooterWrapper';

export const metadata: Metadata = {
  title: 'Montevar Hotel',
  description: 'Official website of Montevar Hotel',
  themeColor: '#ffffff',
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
    <html lang="en" style={{ overflowX: 'hidden' }}>
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
