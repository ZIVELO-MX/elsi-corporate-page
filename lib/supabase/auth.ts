import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin";
  avatarUrl?: string;
};

export async function resolveAuthUser(
  client: SupabaseClient<Database>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
): Promise<AuthUser> {
  const { data: profile } = await client
    .from("profiles")
    .select("full_name, phone, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name
    : typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.full_name || metadataName || user.email?.split("@")[0] || "Usuario",
    phone: profile?.phone || (typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : undefined),
    role: profile?.role === "admin" ? "admin" : "user",
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}

export function safeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
