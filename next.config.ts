import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    CLIENT_ENV_FILE_MANAGER_PASSKEY: '7693',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
