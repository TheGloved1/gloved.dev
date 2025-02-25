import Constants from '@/lib/constants';
import { Metadata } from 'next';
import GalleryPage from './_components/GalleryPage';

export const metadata: Metadata = {
  title: `${Constants.NAME} | Gallery`,
  description: 'The gallery page to tribute the lost life of my best friend.',
};

export default function Gallery(): React.JSX.Element {
  return <GalleryPage />;
}
