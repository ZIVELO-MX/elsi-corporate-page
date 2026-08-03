import type { MetadataRoute } from "next";
import { SITE, indexable, PUBLIC_ROUTES } from "@/lib/seo";
import { getVerifiedCourses } from "@/lib/courses";
import { listPublicCourses } from "@/lib/courses-repository";
import { getVerifiedSolutions } from "@/lib/solutions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexable) return [];

  const abs = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;
  const persistedCourses = await listPublicCourses();
  const courses = persistedCourses === null ? getVerifiedCourses() : persistedCourses;
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
