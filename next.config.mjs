/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.node/,
      use: 'node-loader',
    })

    return config
  },
  env: {
    NEXT_CLIENT_FILE_MANAGER_PASSKEY: '7693',
  },
  experimental: {
    // useLightningcss: true,
    // ppr: 'incremental',
    staleTimes: {
      dynamic: 30,
    },
    reactCompiler: true,
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
}

export default nextConfig
