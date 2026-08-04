import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";
import type { Database } from "./types";

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies. Middleware/Auth owns refresh.
        }
      },
    },
  });
}

export async function requireSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}
