import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // www → bare domain, so Google sees one copy of every page.
        // /api is excluded: webhooks (Stripe, Resend) don't follow redirects.
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "www.dscrcalculator.pro" }],
        destination: "https://dscrcalculator.pro/:path",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
