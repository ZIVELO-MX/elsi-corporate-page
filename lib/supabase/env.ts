export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

const publicUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const publicAnonKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ?? "";

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = publicUrl();
  const anonKey = publicAnonKey();

  if (!url || !anonKey) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1") {
      throw new Error("Supabase URL must use HTTPS outside local development");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("must use HTTPS")) {
      throw error;
    }
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
  }

  return { url, anonKey };
}

export function hasSupabasePublicConfig() {
  return getSupabasePublicConfig() !== null;
}

export function getSupabaseServiceRoleKey() {
  // `SUPABASE_SECRET_KEY` is the current Supabase name. Keep accepting the
  // legacy variable so existing hosted environments can rotate gradually.
  return process.env.SUPABASE_SECRET_KEY?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || null;
}

export function isSupabaseConfigured() {
  return hasSupabasePublicConfig() && Boolean(getSupabaseServiceRoleKey());
}
