/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build for deployment
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checking enabled
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com",
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
    ],
  },
};
