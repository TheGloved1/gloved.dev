import Constants from '@/lib/constants';
import { Metadata } from 'next';
import DownloadPage from './_components/DownloadPage';

export const metadata: Metadata = {
  title: `Download ${Constants.NoModsSky.title}`,
  description: 'Download NoModsSky for Windows, macOS, or Linux.',
  icons: {
    icon: ['https://github.com/TheGloved1/NoModsSky/blob/main/src-tauri/icons/icon.png?raw=true'],
  },
  openGraph: {
    title: `Download ${Constants.NoModsSky.title}`,
    description: `Download NoModsSky for Windows, macOS, or Linux. ${Constants.NoModsSky.description}`,
    images: ['https://github.com/TheGloved1/NoModsSky/blob/main/src-tauri/icons/icon.png?raw=true'],
  },
};

export default function Page(): React.JSX.Element {
  return <DownloadPage />;
}
