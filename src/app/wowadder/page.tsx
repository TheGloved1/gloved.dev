import Constants from '@/lib/constants';
import { Metadata } from 'next';
import WowAdderPage from './_components/WowAdderPage';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.WowAdder.title,
  description: Constants.WowAdder.description,
  icons: {
    icon: ['https://github.com/TheGloved1/WowAdder/blob/main/public/logo.png?raw=true'],
  },
  openGraph: {
    title: Constants.NAME + ' | ' + Constants.WowAdder.title,
    description: Constants.WowAdder.description,
    images: ['https://github.com/TheGloved1/WowAdder/blob/main/public/logo.png?raw=true'],
  },
};

export default function Page(): React.JSX.Element {
  return <WowAdderPage />;
}
