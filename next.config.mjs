/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Tree-shake large icon/util barrels so dev compiles and prod bundles stay small.
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      // Cover uploads travel through a Server Action, whose request body is
      // capped at 1 MB by default — enough to reject an ordinary phone photo
      // before it ever reaches Supabase. Images are compressed in the browser
      // first; this is the safety net for anything that slips through.
      bodySizeLimit: "10mb",
    },
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
