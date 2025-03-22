import Providers from '@/components/Providers';
import SourceCodeButton from '@/components/SourceCodeButton';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/env';
import Constants from '@/lib/constants';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { JetBrains_Mono } from 'next/font/google';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: Constants.NAME,
  description: Constants.DESC,
  icons: Constants.ICON,
  openGraph: {
    title: Constants.NAME,
    description: Constants.DESC,
    url: `https://${Constants.NAME}`,
    type: 'website',
    siteName: Constants.NAME,
    locale: 'en_US',
    images: [
      {
        url: `https://${Constants.NAME}${Constants.ICON}`,
        width: 800,
        height: 600,
        alt: 'Logo',
      },
    ],
  },
};

const jetbrains = JetBrains_Mono({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl='/chat' appearance={{ variables: { colorPrimary: '#333' }, baseTheme: dark }}>
      <ViewTransitions>
        <html lang='en'>
          {env.NODE_ENV === 'development' && (
            <>
              {/* Dev Only Scripts Here */}
              {/* <Script defer crossOrigin='anonymous' src='//unpkg.com/react-scan/dist/auto.global.js' /> */}
            </>
          )}
          <body className={`dark bg-background antialiased ${jetbrains.className}`}>
            <Toaster toastOptions={{ style: { background: '#333' } }} />
            <Providers>
              <Analytics />
              <SpeedInsights />
              <SourceCodeButton />
              {children}
            </Providers>
          </body>
        </html>
      </ViewTransitions>
    </ClerkProvider>
  );
}
