import type { NextConfig } from 'next'
import 'dotenv/config'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: '7693',
    GEMINI: process.env.GEMINI,
  },
  experimental: {
    reactCompiler: true,
    dynamicIO: true,
    ppr: true,
    webpackBuildWorker: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.gloved.dev',
        port: '',
      },
    ],
  },
}

export default nextConfig
