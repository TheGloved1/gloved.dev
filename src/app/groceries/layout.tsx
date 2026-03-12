import Constants from '@/lib/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: Constants.Groceries.title,
  description: Constants.Groceries.description,
  openGraph: {
    title: Constants.Groceries.title,
    description: Constants.Groceries.description,
    url: `https://${Constants.NAME}/groceries`,
    type: 'website',
    siteName: Constants.Groceries.title,
    locale: 'en_US',
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
