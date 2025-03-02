import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/sonner';
import Constants from '@/lib/constants';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { JetBrains_Mono } from 'next/font/google';
import React, { Suspense } from 'react';
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
    <ViewTransitions>
      <ClerkProvider appearance={{ variables: { colorPrimary: '#333' } }}>
        <html lang='en'>
          <body className={`dark snap-x snap-mandatory bg-background antialiased ${jetbrains.className}`}>
            <Toaster toastOptions={{ style: { background: 'gray' } }} />
            <Providers>
              <Analytics />
              <SpeedInsights />
              <Suspense fallback={null}>{/* <RainingLetters /> */}</Suspense>
              {children}
            </Providers>
          </body>
        </html>
      </ClerkProvider>
    </ViewTransitions>
  );
}
