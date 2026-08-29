import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 15 defaults to WebP only. Phone screenshots are tall and compress
    // badly; AVIF is materially smaller on exactly that kind of source.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
