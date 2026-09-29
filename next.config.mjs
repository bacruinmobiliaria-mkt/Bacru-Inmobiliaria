/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  compress: true,
  experimental: {
    serverActions: { bodySizeLimit: '15mb' },
  },
  images: {
    formats: ['image/avif','image/webp'],
    minimumCacheTTL: 604800,
    remotePatterns: [
      { protocol:'https', hostname:'images.unsplash.com' },
      { protocol:'https', hostname:'plus.unsplash.com' },
      { protocol:'https', hostname:'drive.google.com' },
      { protocol:'https', hostname:'lh3.googleusercontent.com' },
      { protocol:'https', hostname:'*.googleusercontent.com' },
      { protocol:'https', hostname:'*.public.blob.vercel-storage.com' },
    ],
  },
};
export default nextConfig;
