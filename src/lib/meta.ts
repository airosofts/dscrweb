import type { Metadata } from "next";
import { SITE_NAME, absUrl } from "./site";

/**
 * Metadata for an indexable page. `title` is the full <title> (the layout
 * template is bypassed with `absolute` so each page controls its own).
 */
export function pageMeta(path: string, title: string, description: string): Metadata {
  const url = absUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: path === "/" ? "website" : "article", url, title, description, siteName: SITE_NAME, locale: "en_US" },
    twitter: { card: "summary", title, description },
  };
}
