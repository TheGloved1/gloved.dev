import GalleryPage from "@/components/GalleryPage"
import { MetaFunction } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: 'gloved.dev | Gallery' },
    {
      name: 'description',
      content: 'The gallery page to tribute the lost life of my best friend.',
    },
    { name: 'icons', content: 'https://api.gloved.dev/files/download/Leo_1.jpg?gallery=true' },
  ]
}

export default function Gallery(): React.JSX.Element {
  return <GalleryPage />
}