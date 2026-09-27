import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/js/script.js",
        destination: "http://64.177.41.212:8000/js/script.js",
      },
      {
        source: "/api/event",
        destination: "http://64.177.41.212:8000/api/event",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/predicciones",
        destination: "/predictions",
        permanent: true,
      },
      {
        source: "/team",
        destination: "/teams",
        permanent: true,
      },
      {
        source: "/stages",
        destination: "/swiss-stage",
        permanent: false,
      },
      {
        source: "/stage",
        destination: "/swiss-stage",
        permanent: false,
      },
      {
        source: "/auth/signup",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/auth/forgot-password",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/auth/reset-password/:path*",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/auth/verify",
        destination: "/auth/login",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/video_banner_1xbet_compress.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
