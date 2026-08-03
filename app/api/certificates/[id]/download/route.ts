import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

const BUCKET = process.env.SUPABASE_CERTIFICATES_BUCKET?.trim() || "certificates";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabasePublicConfig()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  const client = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!client || !admin) return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  const { id } = await params;
  const { data: certificate } = await admin.from("certificates").select("id,enrollment_id,status,storage_path").eq("id", id).maybeSingle();
  if (!certificate || certificate.status !== "available" || !certificate.storage_path) return NextResponse.json({ error: "Constancia no disponible" }, { status: 404 });
  const { data: enrollment } = await admin.from("enrollments").select("user_id").eq("id", certificate.enrollment_id).maybeSingle();
  if (!enrollment || (profile?.role !== "admin" && enrollment.user_id !== auth.user.id)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUrl(certificate.storage_path, 60);
  if (error || !signed?.signedUrl) return NextResponse.json({ error: "No fue posible preparar la descarga" }, { status: 502 });
  return NextResponse.redirect(signed.signedUrl);
}
