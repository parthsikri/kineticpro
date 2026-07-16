/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kdkgiiiqzmejdrxkqvmo.supabase.co',
      },
    ],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.deepseek.com; img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com; style-src 'self' 'unsafe-inline'; frame-src https://api.razorpay.com https://checkout.razorpay.com;",
        },
      ],
    }];
  },
};

export default nextConfig;
