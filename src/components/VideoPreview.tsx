'use client'

import { useIsMobile } from '@/hooks/use-mobile'

const VideoPreview = ({ src, className }: { src: string; className?: string }): React.JSX.Element => {
  const isMobile = useIsMobile()
  return (
    <video width={isMobile ? '250' : '450'} height={isMobile ? '250' : '450'} controls src={src} className={className} />
  )
}

export default VideoPreview
