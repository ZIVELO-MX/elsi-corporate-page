import type { MetadataRoute } from "next";
import { SITE, indexable, PUBLIC_ROUTES } from "@/lib/seo";
import { getVerifiedCourses } from "@/lib/courses";
import { listPublicCourses } from "@/lib/courses-repository";
import { listPublicSolutions } from "@/lib/content-repository";
import { getPublicSectionVisibility } from "@/lib/public-section-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexable) return [];

  const abs = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;
  const [persistedCourses, solutions, visibility] = await Promise.all([
    listPublicCourses(),
    listPublicSolutions(),
    getPublicSectionVisibility(),
  ]);
  const courses = persistedCourses === null ? getVerifiedCourses() : persistedCourses;
  const publicRoutes = PUBLIC_ROUTES.filter((path) => {
    if (path === "/cursos") return courses.length > 0;
    if (path === "/soluciones") return visibility.servicesEnabled && solutions.length > 0;
    if (path === "/nosotros") return visibility.aboutEnabled;
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
    ...(visibility.servicesEnabled ? solutions : []).map((solution) =>
      entry(`/soluciones/${solution.slug}`, solution.updatedAt),
    ),
  ];
}
