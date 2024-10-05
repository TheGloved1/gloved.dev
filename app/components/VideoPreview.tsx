/* eslint-disable jsx-a11y/media-has-caption */

const VideoPreview = ({ src, type }: { src: string; type: string }): React.JSX.Element => {
  return (
    <video width='320' height='240' controls>
      <source src={src} type={type} />
      {"Can't load video preview"}
    </video>
  )
}

export default VideoPreview
