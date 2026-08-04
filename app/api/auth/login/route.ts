import { NextResponse } from "next/server";
import { requireSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { resolveAuthUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 });
  }

  if (hasSupabasePublicConfig()) {
    const supabase = await requireSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    return NextResponse.json({ user: await resolveAuthUser(supabase, data.user) });
  }

  const isAdmin = email === "admin@elsi.com";
  const user = {
    id: "usr_" + crypto.randomUUID().slice(0, 8),
    email,
    name: email.split("@")[0],
    role: isAdmin ? "admin" as const : "user" as const,
  };

  return NextResponse.json({ user });
}
