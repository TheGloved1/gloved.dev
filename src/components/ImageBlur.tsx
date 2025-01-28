'use client'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchImage } from '@/lib/actions'
import Loading from './loading'

export default function ImageBlur({
  src,
  title,
  alt,
  className,
  width,
  height,
}: {
  src: string
  title?: string
  alt?: string
  className?: string
  width?: number
  height?: number
}): React.JSX.Element {
  const { data, isError, error, isFetching } = useQuery({
    queryKey: ['images', src],
    queryFn: () => fetchImage(src),
  })

  const base64 = data?.toString('base64')
  if (isError)
    return (
      <div role="alert" className="alert alert-error">
        {' '}
        {error.message}{' '}
      </div>
    )

  if (isFetching) return <Loading />

  return (
    <Image
      className={className}
      src={src}
      title={title}
      alt={alt || 'image'}
      width={width || 125}
      height={height || 125}
      placeholder="blur"
      blurDataURL={base64}
    />
  )
}
