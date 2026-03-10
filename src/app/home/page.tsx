import Constants from '@/lib/constants';
import { Metadata } from 'next';
import HomeContent from './_components/HomeContent';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.Home.title}`,
  description: Constants.Home.description,
  icons: 'https://avatars.githubusercontent.com/u/96776176?v=4',
};

export default function Page(): React.JSX.Element {
  return <HomeContent />;
}
