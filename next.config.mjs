/**
 * AstroGuard — Next.js config
 * Images are served from /public only, so the optimizer is disabled to keep the
 * app portable when deployed behind a static host or judged offline at a hackathon.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
