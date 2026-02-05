import Constants from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.BGRemover.title}`,
  description: Constants.BGRemover.description,
  icons: '/bgremover.png',
  openGraph: {
    title: Constants.BGRemover.title,
    description: Constants.BGRemover.description,
    url: `https://${Constants.NAME}/bgremover`,
    type: 'website',
    siteName: Constants.NAME,
    locale: 'en_US',
    images: [
      {
        url: `https://${Constants.NAME}/bgremover.png`,
        width: 400,
        height: 400,
        alt: 'Logo',
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
