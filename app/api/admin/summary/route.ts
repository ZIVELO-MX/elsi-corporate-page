import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";

type Summary = {
  courses: number;
  activeCourses: number;
  draftCourses: number;
  users: number;
  admins: number;
  enrollments: number;
  usersWithCourses: number;
  sales: number;
  revenueCents: number;
  newLeads: number;
  pendingCertificates: number;
  pendingPayments: number;
  failedPayments: number;
  canceledPayments: number;
};

const EMPTY_SUMMARY: Summary = {
  courses: 0, activeCourses: 0, draftCourses: 0, users: 0, admins: 0,
  enrollments: 0, usersWithCourses: 0, sales: 0, revenueCents: 0,
  newLeads: 0, pendingCertificates: 0, pendingPayments: 0,
  failedPayments: 0, canceledPayments: 0,
};

export async function GET() {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [summaryResult, recentCourses, recentEnrollments, pendingPayments, failedPayments, canceledPayments] = await Promise.all([
    client.rpc("get_admin_summary"),
    client.from("courses").select("id,title,created_at,is_active,content_status").order("created_at", { ascending: false }).limit(4),
    client.from("enrollments").select("id,user_id,course_id,enrolled_at,status").order("enrolled_at", { ascending: false }).limit(4),
    client.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    client.from("orders").select("id", { count: "exact", head: true }).eq("status", "failed"),
    client.from("orders").select("id", { count: "exact", head: true }).eq("status", "canceled"),
  ]);

  let summary = summaryResult.data as Summary | null;
  if (summaryResult.error) {
    // Exact count fallback keeps previews operational until the migration lands.
    const [courses, active, drafts, users, admins, enrollments, enrollmentUsers, sales, paidOrders, leads, completedEnrollments] = await Promise.all([
      client.from("courses").select("id", { count: "exact", head: true }),
      client.from("courses").select("id", { count: "exact", head: true }).eq("is_active", true),
      client.from("courses").select("id", { count: "exact", head: true }).or("is_active.eq.false,content_status.eq.fixture"),
      client.from("profiles").select("id", { count: "exact", head: true }),
      client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
      client.from("enrollments").select("id", { count: "exact", head: true }),
      client.from("enrollments").select("user_id").limit(1000),
      client.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
      client.from("orders").select("amount_cents").eq("status", "paid").limit(1000),
      client.from("contact_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
      client.from("enrollments").select("id,certificates(status)").eq("status", "completed").limit(1000),
    ]);
    summary = {
      ...EMPTY_SUMMARY,
      courses: courses.count ?? 0,
      activeCourses: active.count ?? 0,
      draftCourses: drafts.count ?? 0,
      users: users.count ?? 0,
      admins: admins.count ?? 0,
      enrollments: enrollments.count ?? 0,
      usersWithCourses: new Set((enrollmentUsers.data ?? []).map((row) => row.user_id)).size,
      sales: sales.count ?? 0,
      revenueCents: (paidOrders.data ?? []).reduce((total, order) => total + order.amount_cents, 0),
      newLeads: leads.count ?? 0,
      pendingCertificates: (completedEnrollments.data ?? []).filter((row) => {
        const certificate = Array.isArray(row.certificates) ? row.certificates[0] : row.certificates;
        return !certificate || certificate.status === "pending";
      }).length,
    };
  }

  summary = {
    ...(summary ?? EMPTY_SUMMARY),
    pendingPayments: pendingPayments.count ?? 0,
    failedPayments: failedPayments.count ?? 0,
    canceledPayments: canceledPayments.count ?? 0,
  };

  if (recentCourses.error || recentEnrollments.error) return NextResponse.json({ error: "No fue posible consultar el resumen" }, { status: 500 });
  const rows = recentEnrollments.data ?? [];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const courseIds = [...new Set(rows.map((row) => row.course_id))];
  const [{ data: profiles }, { data: courses }] = await Promise.all([
    userIds.length ? client.from("profiles").select("id,full_name,email").in("id", userIds) : Promise.resolve({ data: [] }),
    courseIds.length ? client.from("courses").select("id,title").in("id", courseIds) : Promise.resolve({ data: [] }),
  ]);
  const users = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name ?? profile.email ?? "Sin nombre"]));
  const courseNames = new Map((courses ?? []).map((course) => [course.id, course.title]));
  return NextResponse.json({
    summary: summary ?? EMPTY_SUMMARY,
    recentCourses: recentCourses.data ?? [],
    recentEnrollments: rows.map((row) => ({ ...row, userName: users.get(row.user_id) ?? "Sin nombre", courseName: courseNames.get(row.course_id) ?? "Sin curso" })),
  });
}
