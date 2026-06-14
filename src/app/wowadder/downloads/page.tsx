import Constants from '@/lib/constants';
import { Metadata } from 'next';
import DownloadsPage from './_components/DownloadsPage';

export const metadata: Metadata = {
  title: `Download ${Constants.WowAdder.title}`,
  description: 'Download WowAdder for Windows, macOS, or Linux.',
  icons: {
    icon: ['https://github.com/TheGloved1/WowAdder/blob/main/public/logo.png?raw=true'],
  },
  openGraph: {
    title: `Download ${Constants.WowAdder.title}`,
    description: `Download WowAdder for Windows, macOS, or Linux. ${Constants.WowAdder.description}`,
    images: ['https://github.com/TheGloved1/WowAdder/blob/main/public/logo.png?raw=true'],
  },
};

export default function Page(): React.JSX.Element {
  return <DownloadsPage />;
}
