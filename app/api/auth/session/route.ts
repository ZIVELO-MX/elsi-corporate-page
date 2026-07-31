import { NextResponse } from "next/server";
import { requireSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { resolveAuthUser } from "@/lib/supabase/auth";

export async function GET() {
  if (hasSupabasePublicConfig()) {
    const supabase = await requireSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return NextResponse.json({ user: data.user ? await resolveAuthUser(supabase, data.user) : null });
  }
  return NextResponse.json({ user: null });
}
