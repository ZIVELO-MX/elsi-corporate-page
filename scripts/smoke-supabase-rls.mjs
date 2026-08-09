import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? "";
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function requireLocalUrl(value) {
  if (!value) throw new Error("Define SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL.");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("Este smoke test sólo acepta Supabase local (localhost/127.0.0.1).");
  }
  return parsed.origin;
}

function requireValue(value, name) {
  if (!value) throw new Error(`Falta ${name}. Usa las claves de supabase status para el entorno local.`);
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
  const localUrl = requireLocalUrl(url);
  const publicKey = requireValue(anonKey, "SUPABASE_ANON_KEY");
  const adminKey = requireValue(serviceRoleKey, "SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(localUrl, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const publicClient = createClient(localUrl, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const stamp = Date.now().toString(36);
  const password = process.env.SUPABASE_RLS_TEST_PASSWORD ?? `RlsSmoke-${stamp}-A9!`;
  const prefix = `rls-smoke-${stamp}`;
  const emails = {
    studentA: `${prefix}-a@example.invalid`,
    studentB: `${prefix}-b@example.invalid`,
    admin: `${prefix}-admin@example.invalid`,
  };
  const users = {};
  let courseId;

  async function createUser(label, email) {
    const data = await expectOk(`crear ${label}`, await admin.auth.admin.createUser({ email, password, email_confirm: true }));
    assert(data.user?.id, `Supabase no devolvió el id de ${label}.`);
    users[label] = data.user;
    return data.user;
  }

  async function signIn(label, email) {
    const client = createClient(localUrl, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const data = await expectOk(`login ${label}`, await client.auth.signInWithPassword({ email, password }));
    assert(data.session?.access_token, `Supabase no devolvió sesión para ${label}.`);
    return client;
  }

  try {
    console.log(`Supabase local: ${localUrl}`);
    const studentA = await createUser("student-a", emails.studentA);
    const studentB = await createUser("student-b", emails.studentB);
    const adminUser = await createUser("admin", emails.admin);

    await expectOk("asignar rol admin", await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", adminUser.id));

    const course = await expectOk("crear curso de smoke", await admin
      .from("courses")
      .insert({
        slug: `${prefix}-course`,
        title: "Curso RLS smoke",
        short_description: "Registro temporal para probar RLS.",
        content_status: "verified",
        is_active: true,
      })
      .select("id")
      .single());
    courseId = course.id;

    await expectOk("crear inscripción de student-a", await admin
      .from("enrollments")
      .insert({ user_id: studentA.id, course_id: courseId })
      .select("id")
      .single());

    const studentAClient = await signIn("student-a", emails.studentA);
    const studentBClient = await signIn("student-b", emails.studentB);
    const adminClient = await signIn("admin", emails.admin);

    const publicCourses = await expectOk("lectura pública de cursos", await publicClient
      .from("courses")
      .select("id,slug,content_status,is_active")
      .eq("id", courseId));
    assert(publicCourses.length === 1, "El curso verificado y activo no es visible para anónimo.");

    const studentAEnrollments = await expectOk("inscripciones propias de student-a", await studentAClient
      .from("enrollments")
      .select("user_id,course_id"));
    assert(studentAEnrollments.some((row) => row.user_id === studentA.id && row.course_id === courseId), "student-a no ve su propia inscripción.");

    const studentBEnrollments = await expectOk("aislamiento de student-b", await studentBClient
      .from("enrollments")
      .select("user_id,course_id"));
    assert(studentBEnrollments.length === 0, "student-b puede ver datos de otro alumno.");

    const adminEnrollments = await expectOk("lectura administrativa", await adminClient
      .from("enrollments")
      .select("user_id,course_id"));
    assert(adminEnrollments.some((row) => row.user_id === studentA.id && row.course_id === courseId), "admin no ve la inscripción administrativa.");

    const deniedWrite = await studentBClient.from("enrollments").insert({ user_id: studentB.id, course_id: courseId });
    assert(deniedWrite.error, "student-b pudo insertar una inscripción sin ser admin.");

    const anonymousLeads = await expectOk("aislamiento anónimo de leads", await publicClient.from("contact_leads").select("id"));
    const anonymousOutbox = await expectOk("aislamiento anónimo de outbox", await publicClient.from("outbox_events").select("id"));
    assert(anonymousLeads.length === 0, "anónimo puede leer leads.");
    assert(anonymousOutbox.length === 0, "anónimo puede leer outbox.");

    console.log("RLS smoke OK: anónimo, alumno propio, alumno ajeno, admin y escrituras protegidas.");
  } finally {
    const cleanupErrors = [];
    if (courseId) {
      const result = await admin.from("enrollments").delete().eq("course_id", courseId);
      if (result.error) cleanupErrors.push(`inscripciones: ${result.error.message}`);
      const courseResult = await admin.from("courses").delete().eq("id", courseId);
      if (courseResult.error) cleanupErrors.push(`curso: ${courseResult.error.message}`);
    }
    for (const [label, user] of Object.entries(users)) {
      const result = await admin.auth.admin.deleteUser(user.id);
      if (result.error) cleanupErrors.push(`${label}: ${result.error.message}`);
    }
    if (cleanupErrors.length > 0) throw new Error(`La limpieza de datos temporales falló: ${cleanupErrors.join("; ")}`);
  }
}

main().catch((error) => {
  console.error(`RLS smoke FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
