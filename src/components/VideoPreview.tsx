const VideoPreview = ({
  src,
  type,
  className,
}: {
  src: string
  type: string
  className?: string
}): React.JSX.Element => {
  return (
    <video width="320" height="240" controls className={className}>
      <source src={src} type={type} />
      {"Can't load video preview"}
    </video>
  )
}

export default VideoPreview
