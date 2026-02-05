import Constants from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.BGRemover.title}`,
  description: Constants.BGRemover.description,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
