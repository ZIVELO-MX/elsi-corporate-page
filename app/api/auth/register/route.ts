import { NextResponse } from "next/server";
import { requireSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export async function POST(req: Request) {
  const { email, name, phone, password } = await req.json();

  if (!email || !name || !phone || !password) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  if (hasSupabasePublicConfig()) {
    const supabase = await requireSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } },
    });
    if (error) {
      return NextResponse.json({ error: "No fue posible crear la cuenta" }, { status: 400 });
    }
    return NextResponse.json({ user: data.user ? { id: data.user.id, email: data.user.email, name, role: "user" } : null, confirmationRequired: !data.session });
  }

  const user = {
    id: "usr_" + crypto.randomUUID().slice(0, 8),
    email,
    name,
    phone,
    role: "user" as const,
  };

  return NextResponse.json({ user });
}
