import Constants from '@/lib/constants';
import { Metadata } from 'next';
import { CookieGame } from './_components/CookieGame';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.Cookies.title,
  description: Constants.Cookies.description,
  icons: '/cookie.png',
  openGraph: {
    title: Constants.NAME + ' | ' + Constants.Cookies.title,
    description: Constants.Cookies.description,
    url: `https://${Constants.NAME}/cookies`,
    type: 'website',
    siteName: Constants.NAME,
    locale: 'en_US',
    images: [
      {
        url: `https://${Constants.NAME}/cookie.png`,
        width: 400,
        height: 400,
        alt: 'Logo',
      },
    ],
  },
};

export default function Page() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-950'>
      <CookieGame />
    </main>
  );
}
