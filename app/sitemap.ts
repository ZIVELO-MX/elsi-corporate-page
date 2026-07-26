import type { MetadataRoute } from "next";
import { SITE, indexable, PUBLIC_ROUTES } from "@/lib/seo";
import { getVerifiedCourses } from "@/lib/courses";
import { getVerifiedSolutions } from "@/lib/solutions";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];

  const abs = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;
  const courses = getVerifiedCourses();
  const solutions = getVerifiedSolutions();
  const publicRoutes = PUBLIC_ROUTES.filter((path) => {
    if (path === "/cursos") return courses.length > 0;
    if (path === "/soluciones") return solutions.length > 0;
    return true;
  });
  const entry = (path: string, updatedAt?: string) => ({
    url: abs(path),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
  });

  return [
    ...publicRoutes.map((path) => entry(path)),
    ...courses.map((course) =>
      entry(`/cursos/${course.slug}`, course.updatedAt),
    ),
    ...solutions.map((solution) =>
      entry(`/soluciones/${solution.slug}`, solution.updatedAt),
    ),
  ];
}
