import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { resolveAuthUser } from "@/lib/supabase/auth";

// Mock del portal del alumno (ELS-0006). Datos simulados: no hay backend,
// descargas ni correo reales. La liga de acceso NUNCA se expone aquí: para
// cursos en línea sólo se indica que llega por correo (regla del wireframe).
export type ProfileUpcoming = {
  id: string;
  title: string;
  modality: "presencial" | "online";
  // "paid" = con datos de acceso; "access-pending" = pagado, información aún por correo
  access: "paid" | "access-pending";
  date: string;
  time: string;
  location?: string; // sólo presencial
};

export type ProfileHistory = { id: string; title: string; year: number };

export type ProfileCertificate = {
  id: string;
  course: string;
  status: "disponible" | "pendiente";
  fileLabel?: string; // p.ej. "PDF · Publicada el 05 jun 2026"
};
export type ProfilePendingPayment = { id: string; title: string; createdAt: string };

export type ProfilePayload = {
  summary: { upcoming: number; completed: number; certificates: number };
  upcoming: ProfileUpcoming[];
  history: ProfileHistory[];
  certificates: ProfileCertificate[];
  pendingPayments: ProfilePendingPayment[];
};

const DATA: ProfilePayload = {
  summary: { upcoming: 2, completed: 3, certificates: 2 },
  upcoming: [
    { id: "u1", title: "Gestión ambiental aplicada", modality: "presencial", access: "paid", date: "18 jul", time: "09:00-13:00", location: "Campus ELSI · Av. Universidad 1200" },
    { id: "u2", title: "Auditoría ambiental para organizaciones", modality: "online", access: "access-pending", date: "02 ago", time: "17:00-19:00" },
  ],
  history: [
    { id: "h1", title: "Introducción a la sostenibilidad", year: 2024 },
    { id: "h2", title: "Normatividad ambiental", year: 2023 },
    { id: "h3", title: "Economía circular", year: 2023 },
  ],
  certificates: [
    { id: "c1", course: "Economía circular", status: "disponible", fileLabel: "PDF · Publicada el 05 jun 2026" },
    { id: "c2", course: "Gestión ambiental aplicada", status: "pendiente" },
  ],
  pendingPayments: [],
};

export async function GET() {
  if (hasSupabasePublicConfig()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const { data: enrollments, error } = await supabase.from("enrollments").select("id,course_id,status,enrolled_at").eq("user_id", auth.user.id).order("enrolled_at", { ascending: false });
    if (error) return NextResponse.json({ error: "No fue posible cargar tu perfil" }, { status: 500 });
    const { data: pendingOrders, error: pendingOrdersError } = await supabase.from("orders").select("id,course_title,created_at").eq("user_id", auth.user.id).eq("status", "pending").order("created_at", { ascending: false });
    if (pendingOrdersError) return NextResponse.json({ error: "No fue posible cargar tus pagos pendientes" }, { status: 500 });
    const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id))];
    const { data: courses } = courseIds.length ? await supabase.from("courses").select("id,title,modality,location,starts_at").in("id", courseIds) : { data: [] };
    const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));
    const enrollmentIds = (enrollments ?? []).map((e) => e.id);
    const { data: certificates } = enrollmentIds.length ? await supabase.from("certificates").select("id,enrollment_id,status,issued_at,storage_path").in("enrollment_id", enrollmentIds) : { data: [] };
    const certMap = new Map((certificates ?? []).map((c) => [c.enrollment_id, c]));
    const upcoming = (enrollments ?? []).filter((e) => e.status === "in_progress").map((e) => {
      const course = courseMap.get(e.course_id);
      return { id: e.id, title: course?.title ?? "Curso", modality: course?.modality === "in_person" ? "presencial" : "online", access: "access-pending", date: course?.starts_at ? new Date(course.starts_at).toLocaleDateString("es-MX") : "Por confirmar", time: course?.starts_at ? new Date(course.starts_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "", location: course?.location ?? undefined } satisfies ProfileUpcoming;
    });
    const history = (enrollments ?? []).filter((e) => e.status === "completed").map((e) => ({ id: e.id, title: courseMap.get(e.course_id)?.title ?? "Curso", year: new Date(e.enrolled_at).getFullYear() }));
    const profileCertificates = (enrollments ?? []).filter((e) => e.status === "completed").map((e) => { const certificate = certMap.get(e.id); return { id: certificate?.id ?? e.id, course: courseMap.get(e.course_id)?.title ?? "Curso", status: certificate?.status === "available" ? "disponible" : "pendiente", fileLabel: certificate?.issued_at ? `PDF · Publicada el ${new Date(certificate.issued_at).toLocaleDateString("es-MX")}` : undefined } satisfies ProfileCertificate; });
    const pendingPayments = (pendingOrders ?? []).map((order) => ({ id: order.id, title: order.course_title, createdAt: order.created_at } satisfies ProfilePendingPayment));
    return NextResponse.json({ summary: { upcoming: upcoming.length, completed: history.length, certificates: profileCertificates.filter((c) => c.status === "disponible").length }, upcoming, history, certificates: profileCertificates, pendingPayments });
  }
  return NextResponse.json(DATA);
}

export async function PATCH(request: Request) {
  if (!hasSupabasePublicConfig()) return NextResponse.json({ error: "Perfil persistente no configurado" }, { status: 503 });

  const supabase = await requireSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phone = rawPhone ? rawPhone.replace(/[\s().-]/g, "") : null;

  if (name.length < 2 || name.length > 160) {
    return NextResponse.json({ error: "El nombre debe tener entre 2 y 160 caracteres." }, { status: 400 });
  }
  if (phone && (!/^\+?\d+$/.test(phone) || phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 15)) {
    return NextResponse.json({ error: "El teléfono debe tener entre 10 y 15 dígitos." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name, phone })
    .eq("id", auth.user.id);
  if (error) return NextResponse.json({ error: "No fue posible guardar los datos de la cuenta." }, { status: 500 });

  return NextResponse.json({ user: await resolveAuthUser(supabase, auth.user) });
}
