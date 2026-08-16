/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
};

// MDX is no longer compiled from files — every article and case study lives in
// Postgres and is rendered at request/build time by next-mdx-remote. See
// src/components/Mdx.tsx for the remark/rehype pipeline and component allowlist.
export default nextConfig;
