import type { MetadataRoute } from "next";
import { CONTENT_UPDATED, PAGES, absUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${CONTENT_UPDATED}T00:00:00Z`);
  const pages = PAGES.map((p) => ({
    url: absUrl(p.path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: p.priority,
  }));
  // The one advertiser page meant for search; the rest of the ad flow stays out.
  pages.push({ url: absUrl("/advertise"), lastModified, changeFrequency: "monthly", priority: 0.4 });
  return pages;
}
