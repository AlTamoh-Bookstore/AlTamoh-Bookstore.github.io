/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Tree-shake large icon/util barrels so dev compiles and prod bundles stay small.
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // Covers are resized and compressed in the browser before upload (see
    // src/lib/compress-image.ts), so they are already small and web-ready.
    // Serving them straight from Supabase's CDN skips Vercel's Image
    // Optimization entirely — so there is no per-image transformation quota to
    // run out of, which is what stopped newly uploaded covers from appearing.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
