import type { MetadataRoute } from "next";
import { SITE, indexable, PUBLIC_ROUTES } from "@/lib/seo";
import { getAllCourses } from "@/lib/courses";
import { solutions } from "@/lib/solutions";

export default function sitemap(): MetadataRoute.Sitemap {
  // No sitemap is served while the site is a validation prototype.
  if (!indexable) return [];

  const now = new Date();
  const abs = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

  return [
    ...PUBLIC_ROUTES.map((path) => ({ url: abs(path), lastModified: now })),
    ...getAllCourses().map((c) => ({ url: abs(`/cursos/${c.slug}`), lastModified: now })),
    ...solutions.map((s) => ({ url: abs(`/soluciones/${s.slug}`), lastModified: now })),
  ];
}
