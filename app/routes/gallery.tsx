import GalleryPage from '@/components/GalleryPage'
import { MetaFunction } from '@remix-run/react'
import { NAME } from '@/lib/constants'
import { LinksFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: `${NAME} | Gallery` },
    {
      name: 'description',
      content: 'The gallery page to tribute the lost life of my best friend.',
    },
  ]
}

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: '/Leo.png',
      type: 'image/png',
    },
  ]
}

export default function Gallery(): React.JSX.Element {
  return <GalleryPage />
}
