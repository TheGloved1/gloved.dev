import Constants from '@/lib/constants';
import { Metadata } from 'next';
import NoModsSkyPage from './_components/NoModsSkyPage';

export const metadata: Metadata = {
  title: Constants.NoModsSky.title,
  description: Constants.NoModsSky.description,
  icons: {
    icon: ['https://github.com/TheGloved1/NoModsSky/blob/main/src-tauri/icons/icon.png?raw=true'],
  },
  openGraph: {
    title: Constants.NoModsSky.title,
    description: Constants.NoModsSky.description,
    images: ['https://github.com/TheGloved1/NoModsSky/blob/main/src-tauri/icons/icon.png?raw=true'],
  },
};

export default function Page(): React.JSX.Element {
  return <NoModsSkyPage />;
}
