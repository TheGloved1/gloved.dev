const VideoPreview = ({ src, type, className }: { src: string; type: string; className?: string }): React.JSX.Element => {
  return (
    <video width='250' height='250' controls className={className}>
      <source src={src} type={type} />
      {"Can't load video preview"}
    </video>
  )
}

export default VideoPreview
