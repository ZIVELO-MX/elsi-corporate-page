import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Single source of truth for SEO.
//
// Indexing policy: while the site runs as a validation prototype it stays out
// of the index. Enabling indexing is an EXPLICIT decision — set
// NEXT_PUBLIC_PROTOTYPE_MODE=0 (and NEXT_PUBLIC_SITE_URL to the real domain)
// before going live. Nothing here flips on its own.
export const indexable = !siteConfig.prototypeMode;

export const SITE = {
  name: "ELSI",
  fullName: "ELSI — Environmental Learning & Solutions Institute",
  // Placeholder until the real domain is set as part of the go-live decision.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elsi.example.com",
  description:
    "Environment Learning & Solutions Institute. Educación, capacitación y consultoría ambiental.",
  locale: "es_MX",
  // Real, verified ELSI contact (matches the footer). Used for structured data.
  contact: {
    phone: "+523921104719",
    email: "instituteelsi@gmail.com",
    locality: "Guanajuato",
    region: "Guanajuato",
    country: "MX",
  },
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
}: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: path,
      title: title ?? SITE.fullName,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? SITE.fullName,
      description,
    },
  };
}

// Organization structured data — only real, validated ELSI data. No mock
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
