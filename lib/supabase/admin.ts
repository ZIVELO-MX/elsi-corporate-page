import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from "./env";
import type { Database } from "./types";

/**
 * Server-only escape hatch for trusted jobs. Never import this module from a
 * Client Component or expose the returned client to a browser response.
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const config = getSupabasePublicConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!config || !serviceRoleKey) return null;

  return createClient<Database>(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
