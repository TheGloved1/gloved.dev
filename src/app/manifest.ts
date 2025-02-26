import Constants from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: Constants.NAME + ' | ' + Constants.Chat.title,
    short_name: 'GlovedChat',
    description: Constants.Chat.description,
    start_url: '/chat',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/bot.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
    ],
  };
}
