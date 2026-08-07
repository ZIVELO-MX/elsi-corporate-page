import { createSupabasePublicClient } from "@/lib/supabase/server";

export async function getCardPaymentsEnabled() {
  const client = createSupabasePublicClient();
  if (!client) return false;
  const { data } = await client.from("site_settings").select("value").eq("key", "payments").maybeSingle();
  const value = data?.value;
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "card_enabled" in value && value.card_enabled === true);
}
