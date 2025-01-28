'use client'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import Loading from './loading'

async function fetchImage(src: string) {
  return await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()))
}

export default function ImageBlur({
  src,
  title,
  alt,
  className,
}: {
  src: string
  title?: string
  alt?: string
  className?: string
}): React.JSX.Element {
  const imagesQuery = useQuery({
    queryKey: ['images', src],
    queryFn: () => fetchImage(src),
  })

  const base64 = imagesQuery.data?.toString('base64')
  if (imagesQuery.isError)
    return (
      <div role="alert" className="alert alert-error">
        {' '}
        {imagesQuery.error.message}{' '}
      </div>
    )
  if (imagesQuery.isLoading) return <Loading />

  return (
    <Image
      className={className}
      src={src}
      title={title}
      alt={alt || 'image'}
      width={125}
      height={125}
      placeholder="blur"
      blurDataURL={base64}
    />
  )
}
