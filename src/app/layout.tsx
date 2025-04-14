import ReactQueryProvider from '@/components/ReactQueryProvider';
import SourceCodeButton from '@/components/SourceCodeButton';
import { TooltipProvider } from '@/components/TooltipSystem';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/env';
import Constants from '@/lib/constants';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
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
    <ClerkProvider appearance={{ variables: { colorPrimary: '#333' }, baseTheme: dark }}>
      <html lang='en' suppressHydrationWarning>
        {env.NODE_ENV === 'development' && (
          <>
            {/* Dev Only Scripts Here */}
            <Script defer async crossOrigin='anonymous' src='//unpkg.com/react-scan/dist/auto.global.js' />
          </>
        )}
        <body className={`dark min-h-screen bg-background antialiased ${jetbrains.className}`}>
          <ReactQueryProvider>
            <Analytics />
            <SpeedInsights />
            <Toaster toastOptions={{ style: { background: 'hsl(var(--background))' } }} />
            <SourceCodeButton />
            <TooltipProvider>{children}</TooltipProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
