/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/graphql",
        destination: "http://backend:8000/api/graphql"
      }
    ];
  }
}

module.exports = nextConfig
