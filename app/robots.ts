import type { MetadataRoute } from "next";
import { SITE, indexable, INTERNAL_ROUTES } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Validation prototype: keep the entire site out of the index.
  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  // Live: allow public pages, keep internal routes out.
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...INTERNAL_ROUTES] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
