import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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
  const adminKey = requireValue(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(supabaseUrl, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const stamp = Date.now().toString(36);
  const prefix = `student-smoke-${stamp}`;
  const password = process.env.SUPABASE_STUDENT_SMOKE_PASSWORD ?? `StudentSmoke-${stamp}-A9!`;
  const emails = {
    studentA: `${prefix}-a@example.invalid`,
    studentB: `${prefix}-b@example.invalid`,
    admin: `${prefix}-admin@example.invalid`,
  };
  const users = {};
  let courseId;
  let enrollmentId;
  let certificateId;

  async function createUser(label, email) {
    const data = await expectOk(`crear ${label}`, await admin.auth.admin.createUser({ email, password, email_confirm: true }));
    assert(data.user?.id, `Supabase no devolvió el id de ${label}.`);
    users[label] = data.user;
    return data.user;
  }

  async function signIn(label, email) {
    const client = createClient(supabaseUrl, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const data = await expectOk(`login ${label}`, await client.auth.signInWithPassword({ email, password }));
    assert(data.session?.access_token, `Supabase no devolvió sesión para ${label}.`);
    return client;
  }

  try {
    const studentA = await createUser("student-a", emails.studentA);
    const studentB = await createUser("student-b", emails.studentB);
    const adminUser = await createUser("admin", emails.admin);
    await expectOk("asignar rol admin", await admin.from("profiles").update({ role: "admin" }).eq("id", adminUser.id));

    const course = await expectOk("crear curso temporal", await admin.from("courses").insert({
      slug: `${prefix}-course`, title: "Curso student operations smoke",
      short_description: "Registro temporal para validar inscripciones.",
      content_status: "verified", is_active: true, price_cents: 0, currency: "MXN",
    }).select("id").single());
    courseId = course.id;

    const enrollment = await expectOk("crear inscripción", await admin.from("enrollments")
      .insert({ user_id: studentA.id, course_id: courseId, source: "internal", status: "in_progress" })
      .select("id").single());
    enrollmentId = enrollment.id;
    const certificate = await expectOk("crear constancia pendiente", await admin.from("certificates")
      .insert({ enrollment_id: enrollmentId, status: "pending" }).select("id").single());
    certificateId = certificate.id;

    const studentAClient = await signIn("student-a", emails.studentA);
    const studentBClient = await signIn("student-b", emails.studentB);
    const adminClient = await signIn("admin", emails.admin);

    const own = await expectOk("inscripción propia", await studentAClient.from("enrollments").select("id,course_id,status"));
    assert(own.some((row) => row.id === enrollmentId && row.course_id === courseId), "student-a no ve su inscripción.");
    const foreign = await expectOk("aislamiento de alumno ajeno", await studentBClient.from("enrollments").select("id"));
    assert(!foreign.some((row) => row.id === enrollmentId), "student-b ve la inscripción de otro alumno.");
    const adminRows = await expectOk("lectura administrativa", await adminClient.from("enrollments").select("id,status"));
    assert(adminRows.some((row) => row.id === enrollmentId), "admin no ve la inscripción.");
    const ownCertificates = await expectOk("constancia propia", await studentAClient.from("certificates").select("id,status"));
    assert(ownCertificates.some((row) => row.id === certificateId && row.status === "pending"), "student-a no ve su constancia pendiente.");

    await expectOk("finalizar inscripción", await admin.from("enrollments").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", enrollmentId));
    await expectOk("publicar constancia", await admin.from("certificates").update({ status: "available" }).eq("id", certificateId));
    const completed = await expectOk("estado final", await studentAClient.from("enrollments").select("status").eq("id", enrollmentId).single());
    assert(completed.status === "completed", "La inscripción no llegó a completed.");

    console.log(`Student operations smoke OK: ${prefix}`);
  } finally {
    const cleanupErrors = [];
    if (certificateId) {
      const result = await admin.from("certificates").delete().eq("id", certificateId);
      if (result.error) cleanupErrors.push(`constancia: ${result.error.message}`);
    }
    if (enrollmentId) {
      const result = await admin.from("enrollments").delete().eq("id", enrollmentId);
      if (result.error) cleanupErrors.push(`inscripción: ${result.error.message}`);
    }
    if (courseId) {
      const result = await admin.from("courses").delete().eq("id", courseId);
      if (result.error) cleanupErrors.push(`curso: ${result.error.message}`);
    }
    for (const [label, user] of Object.entries(users)) {
      const result = await admin.auth.admin.deleteUser(user.id);
      if (result.error) cleanupErrors.push(`${label}: ${result.error.message}`);
    }
    if (cleanupErrors.length > 0) throw new Error(`La limpieza falló: ${cleanupErrors.join("; ")}`);
  }
}

main().catch((error) => {
  console.error(`Student operations smoke FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
