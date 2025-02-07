'use client'

import { useIsMobile } from '@/hooks/use-mobile'

const VideoPreview = ({ src, className }: { src: string; className?: string }): React.JSX.Element => {
  const isMobile = useIsMobile()
  return (
    <video
      width={isMobile ? '250' : '500'}
      height={isMobile ? '250' : '500'}
      controls
      src={src}
      className={className}
    ></video>
  )
}

export default VideoPreview
