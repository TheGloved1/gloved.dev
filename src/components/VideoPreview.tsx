import DefaultPlayer from 'next-video/player';

const VideoPreview = ({ src, className }: { src: string; className?: string }): React.JSX.Element => {
  return <DefaultPlayer src={src} className={className} />;
};

export default VideoPreview;
