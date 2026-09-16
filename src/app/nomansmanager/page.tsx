import Constants from '@/lib/constants';
import { Metadata } from 'next';
import NoMansManagerPage from './_components/NoMansManagerPage';

export const metadata: Metadata = {
  title: Constants.NoMansManager.title,
  description: Constants.NoMansManager.description,
  icons: {
    icon: ['https://github.com/TheGloved1/NoMansManager/blob/main/src-tauri/icons/icon.png?raw=true'],
  },
  openGraph: {
    title: Constants.NoMansManager.title,
    description: Constants.NoMansManager.description,
    images: ['https://github.com/TheGloved1/NoMansManager/blob/main/src-tauri/icons/icon.png?raw=true'],
  },
};

export default function Page(): React.JSX.Element {
  return <NoMansManagerPage />;
}
