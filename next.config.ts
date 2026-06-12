import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Supabase realtime uses WebSocket connections. Allow the hosted domain
// wildcard for convenience; tighten to the exact project URL in production.
const contentSecurityPolicy = [
  "default-src 'self'",
  // unsafe-inline required for Next.js hydration scripts (static pages have
  // no per-request nonce). unsafe-eval only needed for React dev overlays.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // In development, local Supabase runs on ws://127.0.0.1:54321.
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isDev ? " ws://127.0.0.1:54321 http://127.0.0.1:54321" : ""}`,
  // Supabase Realtime creates a Web Worker from a blob: URL internally.
  "worker-src blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
]
  .join("; ")
  .trim();

const securityHeaders = [
  // Prevents the page from being embedded in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from MIME-sniffing the response type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Restricts the Referer header to origin only on cross-origin requests.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables browser features the game does not use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
