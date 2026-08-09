import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? "";
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function requireTestUrl(value) {
  if (!value) throw new Error("Define SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL.");
  const parsed = new URL(value);
  const local = ["localhost", "127.0.0.1"].includes(parsed.hostname);
  if (!local && process.env.SUPABASE_RLS_ALLOW_REMOTE !== "true") {
    throw new Error("La prueba remota requiere SUPABASE_RLS_ALLOW_REMOTE=true.");
  }
  return parsed.origin;
}

function requireValue(value, name) {
  if (!value) throw new Error(`Falta ${name}.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectOk(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function main() {
  const supabaseUrl = requireTestUrl(url);
  const publicKey = requireValue(anonKey, "SUPABASE_ANON_KEY");
  const adminKey = requireValue(serviceRoleKey, "SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(supabaseUrl, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const publicClient = createClient(supabaseUrl, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const stamp = Date.now().toString(36);
  const slug = `smoke-course-${stamp}`;
  let courseId;

  try {
    const course = await expectOk("crear curso temporal", await admin
      .from("courses")
      .insert({
        slug,
        title: "Curso CRUD smoke",
        short_description: "Registro temporal para validar el catálogo.",
        content_status: "verified",
        is_active: true,
        price_cents: 0,
        currency: "MXN",
      })
      .select("id,slug,title,is_active,content_status")
      .single());
    courseId = course.id;
    assert(course.slug === slug, "El slug creado no coincide.");

    const visible = await expectOk("visibilidad pública del curso", await publicClient
      .from("courses")
      .select("id,slug,title,is_active,content_status")
      .eq("id", courseId)
      .maybeSingle());
    assert(visible?.id === courseId, "El curso activo y verificado no es visible públicamente.");

    const updated = await expectOk("actualizar curso temporal", await admin
      .from("courses")
      .update({ title: "Curso CRUD smoke actualizado" })
      .eq("id", courseId)
      .select("id,title")
      .single());
    assert(updated.title === "Curso CRUD smoke actualizado", "La actualización no se persistió.");

    await expectOk("desactivar curso temporal", await admin
      .from("courses")
      .update({ is_active: false })
      .eq("id", courseId)
      .select("id,is_active")
      .single());

    const hidden = await expectOk("aislamiento del curso desactivado", await publicClient
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle());
    assert(hidden === null, "El curso desactivado continúa visible públicamente.");

    console.log(`Course CRUD smoke OK: ${slug}`);
  } finally {
    if (courseId) {
      const cleanup = await admin.from("courses").delete().eq("id", courseId);
      if (cleanup.error) throw new Error(`La limpieza del curso temporal falló: ${cleanup.error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(`Course CRUD smoke FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
