import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publicKey = process.env.SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function required(value, name) {
  if (!value) throw new Error(`Falta ${name}.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const parsedUrl = new URL(required(url, "SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL"));
  if (!["localhost", "127.0.0.1"].includes(parsedUrl.hostname) && process.env.SUPABASE_RLS_ALLOW_REMOTE !== "true") {
    throw new Error("Para Supabase remoto define SUPABASE_RLS_ALLOW_REMOTE=true de forma explícita.");
  }

  const admin = createClient(parsedUrl.origin, required(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const publicClient = createClient(parsedUrl.origin, required(publicKey, "SUPABASE_ANON_KEY o clave publishable"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const stamp = Date.now().toString(36);
  const sectionKey = `smoke-content-${stamp}`;
  let sectionId;

  try {
    const inserted = await admin.from("page_sections").insert({
      section_key: sectionKey,
      title: "Contenido smoke temporal",
      body: { text: "Contenido temporal no publicable." },
      is_active: false,
      sort_order: 9999,
    }).select("id,section_key,title,is_active,body").single();
    if (inserted.error) throw new Error(`crear sección: ${inserted.error.message}`);
    sectionId = inserted.data.id;

    assert(inserted.data.section_key === sectionKey, "La sección creada no conserva la clave.");
    assert(inserted.data.is_active === false, "La sección smoke debe iniciar inactiva.");

    const hidden = await publicClient.from("page_sections").select("id").eq("id", sectionId);
    if (hidden.error) throw new Error(`leer RLS público: ${hidden.error.message}`);
    assert(hidden.data.length === 0, "Una sección inactiva quedó visible para anónimo.");

    const updated = await admin.from("page_sections").update({
      title: "Contenido smoke publicado",
      body: { text: "Contenido temporal publicado para smoke." },
      is_active: true,
    }).eq("id", sectionId).select("id,title,is_active,body").single();
    if (updated.error) throw new Error(`actualizar sección: ${updated.error.message}`);
    assert(updated.data.title === "Contenido smoke publicado", "La actualización no persistió.");

    const visible = await publicClient.from("page_sections").select("id,title,body").eq("id", sectionId);
    if (visible.error) throw new Error(`leer contenido público: ${visible.error.message}`);
    assert(visible.data.length === 1, "Una sección activa no quedó visible para anónimo.");

    console.log(`Managed content smoke OK: ${sectionKey}`);
  } finally {
    if (sectionId) {
      const cleanup = await admin.from("page_sections").delete().eq("id", sectionId);
      if (cleanup.error) throw new Error(`limpiar sección: ${cleanup.error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(`Managed content smoke FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
