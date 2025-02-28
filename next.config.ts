import 'dotenv/config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: '7693',
    GEMINI: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ: process.env.GROQ_API_KEY,
  },
  experimental: {
    reactCompiler: true,
    dynamicIO: false,
    ppr: true,
    webpackBuildWorker: true,
    taint: true,
    appDocumentPreloading: true,
    optimizeCss: true,
    newDevOverlay: true,
    parallelServerCompiles: true,
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
