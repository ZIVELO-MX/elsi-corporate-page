import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Single source of truth for SEO.
//
// Indexing requires three explicit signals: prototype mode disabled, a
// non-placeholder domain and content marked as verified. A partial
// configuration always fails closed.
export const indexable = siteConfig.indexingReady;

export const SITE = {
  name: "ELSI",
  fullName: "ELSI | Environmental Learning & Solutions Institute",
  url: siteConfig.siteUrl,
  description:
    "Environmental Learning & Solutions Institute. Educación, capacitación y consultoría ambiental.",
  locale: "es_MX",
  language: "es-MX",
  contact: {
    phone: "+523921104719",
    email: "instituteelsi@gmail.com",
    locality: "Guanajuato",
    region: "Guanajuato",
    country: "MX",
  },
} as const;

export const SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "ELSI, educación y soluciones ambientales",
} as const;

// Public routes served to visitors. Internal routes (admin, profile, auth,
// checkout, wireframes) are deliberately absent — they must never reach the
// sitemap or the index.
export const PUBLIC_ROUTES = [
  "/",
  "/cursos",
  "/soluciones",
  "/nosotros",
  "/contacto",
  "/aviso-de-privacidad",
] as const;

// Route prefixes that must always stay out of the index and sitemap.
export const INTERNAL_ROUTES = [
  "/admin",
  "/profile",
  "/login",
  "/register",
  "/checkout",
  "/cursos/wireframes",
  "/profile/wireframes",
] as const;

// Per-page metadata for public pages. Robots are inherited from the root layout
// (which reflects `indexable`), so a page only declares its own title, copy and
// canonical.
export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  allowIndexing = indexable,
}: {
  title?: string;
  description?: string;
  path?: string;
  allowIndexing?: boolean;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    robots: allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: path,
      title: title ?? SITE.fullName,
      description,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? SITE.fullName,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

export function buildPrivateMetadata({
  title,
  description = SITE.description,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  return {
    ...buildMetadata({
      title,
      description,
      path,
      allowIndexing: false,
    }),
    robots: { index: false, follow: false },
  };
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE.url).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ label: string; href: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

// Organization structured data is emitted on the home page only and only when
// the complete site has passed the go-live gate. No mock
// courses, prices or reviews are ever emitted as structured data.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE.fullName,
  alternateName: "ELSI",
  url: SITE.url,
  description: SITE.description,
  email: SITE.contact.email,
  telephone: SITE.contact.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.contact.locality,
    addressRegion: SITE.contact.region,
    addressCountry: SITE.contact.country,
  },
} as const;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: SITE.fullName,
  url: SITE.url,
  inLanguage: SITE.language,
  description: SITE.description,
  publisher: {
    "@type": "EducationalOrganization",
    name: SITE.name,
    url: SITE.url,
  },
} as const;

export function buildCourseJsonLd(course: {
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function buildCourseListJsonLd(
  courses: ReadonlyArray<{
    slug: string;
    title: string;
    description: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/cursos/${course.slug}`),
      item: buildCourseJsonLd(course),
    })),
  };
}
