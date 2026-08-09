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
    "ELSI ofrece educación ambiental, capacitación y consultoría para personas, empresas y universidades en Guanajuato. Conoce cursos y soluciones.",
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

export const DISCOVERY_ALTERNATES = {
  "text/plain": "/llms.txt",
  "application/json": "/api/navigation",
} as const;

export const SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "ELSI, educación y soluciones ambientales",
} as const;

// Public routes served to visitors. Internal routes (admin, profile, auth,
// checkout) are deliberately absent — they must never reach the sitemap or
// the index.
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
    alternates: { canonical: path, types: DISCOVERY_ALTERNATES },
    robots: allowIndexing
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
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
    alternates: { canonical: path },
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
  "@id": `${SITE.url}/#organization`,
  name: SITE.fullName,
  alternateName: "ELSI",
  url: SITE.url,
  description: SITE.description,
  email: SITE.contact.email,
  telephone: SITE.contact.phone,
  logo: absoluteUrl("/logos/elsi-full-logo.png"),
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
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: SITE.fullName,
  url: SITE.url,
  inLanguage: SITE.language,
  description: SITE.description,
  publisher: {
    "@id": `${SITE.url}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: absoluteUrl("/cursos?q={search_term_string}"),
    },
    "query-input": "required name=search_term_string",
  },
} as const;

export function buildCourseJsonLd(course: {
  slug?: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    inLanguage: SITE.language,
    ...(course.slug ? { url: absoluteUrl(`/cursos/${course.slug}`) } : {}),
    provider: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function buildFaqJsonLd(
  faqs: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildSiteNavigationJsonLd(
  items: ReadonlyArray<{ label: string; href: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@graph": items.map((item) => ({
      "@type": "SiteNavigationElement",
      name: item.label,
      url: absoluteUrl(item.href),
    })),
  };
}

export function buildServiceJsonLd(solution: {
  slug: string;
  title: string;
  description: string;
  audience: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: solution.title,
    description: solution.description,
    url: absoluteUrl(`/soluciones/${solution.slug}`),
    serviceType: solution.title,
    areaServed: {
      "@type": "Country",
      name: "México",
    },
    audience: {
      "@type": "Audience",
      audienceType: solution.audience,
    },
    provider: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function buildServiceListJsonLd(
  solutions: ReadonlyArray<{
    slug: string;
    title: string;
    description: string;
    audience: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: solutions.map((solution, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/soluciones/${solution.slug}`),
      item: buildServiceJsonLd(solution),
    })),
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
