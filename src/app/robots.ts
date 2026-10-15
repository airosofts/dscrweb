import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API endpoints and tracked-link redirects are not content.
        // Checkout/creative pages are NOT disallowed here on purpose: they carry
        // `noindex`, and Google must be able to crawl them to see it.
        disallow: ["/api/", "/r/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
