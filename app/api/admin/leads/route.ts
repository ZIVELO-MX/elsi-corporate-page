import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

async function admin() {
  if (!hasSupabasePublicConfig()) return null;
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  return profile?.role === "admin" ? client : null;
}

export async function GET() {
  const client = await admin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await client.from("contact_leads").select("id,full_name,email,phone,company,message,source,status,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "No fue posible consultar mensajes" }, { status: 500 });
  return NextResponse.json({ leads: data ?? [] });
}
