import { cache } from "react";
import { createSupabasePublicClient } from "@/lib/supabase/server";

export type PublicSectionVisibility = {
  aboutEnabled: boolean;
  servicesEnabled: boolean;
};

export const DEFAULT_PUBLIC_SECTION_VISIBILITY: PublicSectionVisibility = {
  aboutEnabled: true,
  servicesEnabled: true,
};

export function parsePublicSectionVisibility(value: unknown): PublicSectionVisibility {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_PUBLIC_SECTION_VISIBILITY;
  }

  const setting = value as Record<string, unknown>;
  return {
    aboutEnabled:
      typeof setting.about_enabled === "boolean"
        ? setting.about_enabled
        : DEFAULT_PUBLIC_SECTION_VISIBILITY.aboutEnabled,
    servicesEnabled:
      typeof setting.services_enabled === "boolean"
        ? setting.services_enabled
        : DEFAULT_PUBLIC_SECTION_VISIBILITY.servicesEnabled,
  };
}

export const getPublicSectionVisibility = cache(
  async function getPublicSectionVisibility(): Promise<PublicSectionVisibility> {
    const client = createSupabasePublicClient();
    if (!client) return DEFAULT_PUBLIC_SECTION_VISIBILITY;

    const { data, error } = await client
      .from("site_settings")
      .select("value")
      .eq("key", "public_sections")
      .maybeSingle();

    if (error) {
      console.error("[public-section-settings] read failed", {
        code: error.code,
        message: error.message,
      });
      return DEFAULT_PUBLIC_SECTION_VISIBILITY;
    }

    return parsePublicSectionVisibility(data?.value);
  },
);
