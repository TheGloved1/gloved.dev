'use client'
import { fetchImage } from '@/lib/actions'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import ErrorAlert from './ErrorAlert'
import Loading from './loading'

type ImageBlurProps = {
  src: string
  title?: string
  alt?: string
  className?: string
  width?: number
  height?: number
}

export default function ImageBlur({
  src,
  title,
  alt,
  className,
  width,
  height,
}: ImageBlurProps): React.JSX.Element {
  const imageQuery = useQuery({
    queryKey: ['images', src],
    queryFn: () => fetchImage(src),
  })

  const base64 = imageQuery?.data?.toString('base64')

  if (imageQuery.isError) return <ErrorAlert>{imageQuery.error.message}</ErrorAlert>
  if (imageQuery.isFetching || base64 === undefined) return <Loading />

  return (
    <Image
      className={className}
      src={src}
      title={title}
      alt={alt || 'image'}
      width={width || 125}
      height={height || 125}
      placeholder='blur'
      blurDataURL={base64}
    />
  )
}
