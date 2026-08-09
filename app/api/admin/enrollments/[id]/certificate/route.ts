import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { hasPdfSignature, MAX_CERTIFICATE_BYTES, validateCertificateFileMetadata } from "@/lib/certificate-files";

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
  const metadataError = validateCertificateFileMetadata(file);
  if (metadataError || file.size > MAX_CERTIFICATE_BYTES) return NextResponse.json({ error: metadataError ?? "La constancia debe ser un PDF de hasta 10 MB" }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPdfSignature(bytes)) return NextResponse.json({ error: "El archivo no es un PDF válido" }, { status: 400 });

  const { data: enrollment } = await admin.from("enrollments").select("id").eq("id", enrollmentId).maybeSingle();
  if (!enrollment) return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
  const { data: previous } = await admin.from("certificates").select("id,storage_path").eq("enrollment_id", enrollmentId).maybeSingle();
  const storagePath = `certificates/${enrollmentId}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) return NextResponse.json({ error: "No fue posible guardar la constancia" }, { status: 502 });

  const metadata = {
    enrollment_id: enrollmentId,
    status: "pending" as const,
    storage_path: storagePath,
    original_filename: file.name.slice(0, 255),
    mime_type: file.type,
    size_bytes: file.size,
    issued_at: null,
  };
  let certificateResult = await admin
    .from("certificates")
    .upsert(metadata, { onConflict: "enrollment_id" })
    .select("id,enrollment_id,status,storage_path,original_filename,mime_type,size_bytes,issued_at")
    .single();
  if (certificateResult.error?.code === "42703" || certificateResult.error?.code === "PGRST204") {
    certificateResult = await admin
      .from("certificates")
      .upsert({ enrollment_id: enrollmentId, status: "pending", storage_path: storagePath, issued_at: null }, { onConflict: "enrollment_id" })
      .select("id,enrollment_id,status,storage_path,issued_at")
      .single() as typeof certificateResult;
  }
  const { data: certificate, error: certificateError } = certificateResult;
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
