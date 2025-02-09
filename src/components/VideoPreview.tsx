'use client'
import { useIsMobile } from '@/hooks/use-mobile'

const VideoPreview = ({ src, className }: { src: string; className?: string }): React.JSX.Element => {
  const isMobile = useIsMobile()
  const size = isMobile ? '250' : '450'
  return <video width={size} height={size} controls src={src} className={className} />
}

export default VideoPreview
