import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Serverless optimization
  output: 'standalone',

  // Performance optimizations
  // serverExternalPackages: [], // No external packages needed for Supabase

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Image optimization for serverless
  images: {
    unoptimized: false,
    // domains: [], // Add Supabase storage domains if needed
  },

  // Compression
  compress: true,

  // Exclude Supabase functions (Deno code) from Next.js build
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },

  // Exclude supabase functions from webpack build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude supabase directory from server-side bundles
      config.externals = config.externals || [];
      config.externals.push({
        'supabase/**/*': 'commonjs supabase/**/*',
      });
    }

    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
