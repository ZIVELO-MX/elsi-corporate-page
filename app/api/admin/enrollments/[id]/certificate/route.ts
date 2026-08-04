import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

const MAX_BYTES = 10 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_CERTIFICATES_BUCKET?.trim() || "certificates";

async function requireAdmin() {
  if (!hasSupabasePublicConfig()) return null;
  const client = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!client || !admin) return null;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  return profile?.role === "admin" ? admin : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id: enrollmentId } = await params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "El archivo PDF es requerido" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES || file.type !== "application/pdf") return NextResponse.json({ error: "La constancia debe ser un PDF de hasta 10 MB" }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") return NextResponse.json({ error: "El archivo no es un PDF válido" }, { status: 400 });

  const { data: enrollment } = await admin.from("enrollments").select("id").eq("id", enrollmentId).maybeSingle();
  if (!enrollment) return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
  const { data: previous } = await admin.from("certificates").select("id,storage_path").eq("enrollment_id", enrollmentId).maybeSingle();
  const storagePath = `certificates/${enrollmentId}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) return NextResponse.json({ error: "No fue posible guardar la constancia" }, { status: 502 });

  const { data: certificate, error: certificateError } = await admin
    .from("certificates")
    .upsert({ enrollment_id: enrollmentId, status: "pending", storage_path: storagePath, issued_at: null }, { onConflict: "enrollment_id" })
    .select("id,enrollment_id,status,storage_path,issued_at")
    .single();
  if (certificateError || !certificate) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: "No fue posible registrar la constancia" }, { status: 500 });
  }
  const { error: enrollmentError } = await admin.from("enrollments").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", enrollmentId);
  if (enrollmentError) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: "No fue posible completar la inscripción" }, { status: 500 });
  }
  if (previous?.storage_path && previous.storage_path !== storagePath) await admin.storage.from(BUCKET).remove([previous.storage_path]);
  return NextResponse.json({ certificate }, { status: 201 });
}
