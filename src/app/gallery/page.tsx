import GalleryPage from './GalleryPage'
import { NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `${NAME} | Gallery`,
  description: 'The gallery page to tribute the lost life of my best friend.',
}

export default function Gallery(): React.JSX.Element {
  return <GalleryPage />
}
