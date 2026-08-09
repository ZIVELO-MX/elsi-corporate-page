import type { MetadataRoute } from "next";
import { SITE, indexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Validation prototype: keep the entire site out of the index.
  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  // Live: crawlers may read page-level noindex directives on utility and
  // private routes. Auth remains the access-control boundary.
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
    ],
    host: SITE.url,
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
