export default function DiscordServerWidget(): React.JSX.Element {
  return (
    <iframe
      src='https://discord.com/widget?id=937806100546351174&theme=dark'
      className='rounded-xl'
      width='350'
      height='500'
      sandbox='allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
    />
  );
}
