/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enables `next build` to emit a fully static site (deployable to Vercel or any static host).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
