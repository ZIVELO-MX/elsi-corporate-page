import { getVerifiedCourses } from "@/lib/courses";
import { listPublicCourses } from "@/lib/courses-repository";
import { listPublicSolutions } from "@/lib/content-repository";
import { SITE, indexable } from "@/lib/seo";
import { buildAgentNavigationManifest } from "@/lib/agentic-navigation";

export async function getPublicDiscoveryManifest() {
  if (!indexable) {
    return buildAgentNavigationManifest({
      siteUrl: SITE.url,
      name: SITE.name,
      description: SITE.description,
      language: SITE.language,
      indexingReady: false,
      courses: [],
      solutions: [],
    });
  }

  const [persistedCourses, solutions] = await Promise.all([
    listPublicCourses(),
    listPublicSolutions(),
  ]);
  const courses = persistedCourses ?? getVerifiedCourses();

  return buildAgentNavigationManifest({
    siteUrl: SITE.url,
    name: SITE.name,
    description: SITE.description,
    language: SITE.language,
    indexingReady: true,
    courses: courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      category: course.category,
      modality: course.modality,
    })),
    solutions: solutions.map((solution) => ({
      slug: solution.slug,
      title: solution.title,
      description: solution.description,
      audience: solution.audience,
    })),
  });
}
