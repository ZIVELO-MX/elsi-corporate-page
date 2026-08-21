import { NextResponse } from "next/server";
import { requireSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { safeRedirectPath } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next"), "/");
  if (hasSupabasePublicConfig() && code) {
    const supabase = await requireSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  // Do not send a failed or missing authorization code through protected routes.
  // The detailed provider error stays server-side; the user gets a safe retry path.
  return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
}
