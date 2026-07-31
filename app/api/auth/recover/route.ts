import { NextResponse } from "next/server";
import { requireSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
  }
  if (hasSupabasePublicConfig()) {
    const supabase = await requireSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: new URL("/login", req.url).toString() });
  }
  return NextResponse.json({ ok: true });
}
