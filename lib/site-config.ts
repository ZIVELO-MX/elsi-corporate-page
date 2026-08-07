const enabled = (value: string | undefined, defaultValue = false) =>
  value === undefined ? defaultValue : value === "1";

const FALLBACK_SITE_URL = "https://elsi.example.com";
const requestedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = requestedSiteUrl || FALLBACK_SITE_URL;
const contentStatus =
  process.env.NEXT_PUBLIC_CONTENT_STATUS === "verified" ? "verified" : "fixture";
const prototypeMode = enabled(process.env.NEXT_PUBLIC_PROTOTYPE_MODE, true);
const hasVerifiedSiteUrl =
  Boolean(requestedSiteUrl) && requestedSiteUrl !== FALLBACK_SITE_URL;
const indexingReady =
  !prototypeMode && contentStatus === "verified" && hasVerifiedSiteUrl;

export const siteConfig = {
  siteUrl,
  contentStatus,
  prototypeMode,
  hasVerifiedSiteUrl,
  indexingReady,
  previewMode: !indexingReady,
  sectionLabels: enabled(process.env.NEXT_PUBLIC_SECTION_LABELS),
} as const;
