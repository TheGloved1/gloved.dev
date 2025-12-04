import 'dotenv/config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: '7693',
    GEMINI: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ: process.env.GROQ_API_KEY,
  },
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    webpackBuildWorker: true,
    optimizeCss: true,
    inlineCss: true,
    parallelServerCompiles: true,
  },
  devIndicators: {
    position: 'bottom-left',
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
};

export default nextConfig;
