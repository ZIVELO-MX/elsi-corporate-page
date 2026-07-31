import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null | undefined;

export function createSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (browserClient !== undefined) return browserClient;

  const config = getSupabasePublicConfig();
  if (!config) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(config.url, config.anonKey);
  return browserClient;
}
