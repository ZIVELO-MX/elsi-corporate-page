import { chunks, createAdminCsvExport } from "@/lib/admin-csv";
import { fetchAllPages } from "@/lib/csv";
import { escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["enrolled_at", "status", "source"] as const;
type EnrollmentRow = { id: string; user_id: string; course_id: string; source: string; status: string; enrolled_at: string; completed_at: string | null };
type EnrollmentExport = EnrollmentRow & { user_name: string; user_email: string; course_title: string; certificate_status: string; certificate_filename: string };

export const GET = createAdminCsvExport<EnrollmentExport>({
  entity: "enrollments",
  filename: "elsi-inscripciones.csv",
  personalData: true,
  columns: [
    { header: "id", value: (row) => row.id },
    { header: "usuario_id", value: (row) => row.user_id },
    { header: "nombre", value: (row) => row.user_name },
    { header: "correo", value: (row) => row.user_email },
    { header: "curso_id", value: (row) => row.course_id },
    { header: "curso", value: (row) => row.course_title },
    { header: "origen", value: (row) => row.source },
    { header: "estado", value: (row) => row.status },
    { header: "constancia", value: (row) => row.certificate_status },
    { header: "archivo_constancia", value: (row) => row.certificate_filename },
    { header: "inscrito_en", value: (row) => row.enrolled_at },
    { header: "completado_en", value: (row) => row.completed_at },
  ],
  async load({ client, request }) {
    const query = parseAdminQuery(request, SORTS, "enrolled_at");
    const status = query.filters.get("status");
    const source = query.filters.get("source");
    const userId = query.filters.get("userId");
    const courseId = query.filters.get("courseId");
    const rows = await fetchAllPages<EnrollmentRow>((from, to) => {
      let selection = client.from("enrollments").select("id,user_id,course_id,source,status,enrolled_at,completed_at");
      if (status === "in_progress" || status === "completed") selection = selection.eq("status", status);
      if (source === "internal" || source === "external" || source === "stripe") selection = selection.eq("source", source);
      if (userId) selection = selection.eq("user_id", userId);
      if (courseId) selection = selection.eq("course_id", courseId);
      return selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(from, to);
    });

    const userIds = [...new Set(rows.map((row) => row.user_id))];
    const courseIds = [...new Set(rows.map((row) => row.course_id))];
    const [profilePages, coursePages, certificatePages] = await Promise.all([
      Promise.all(chunks(userIds).map(async (ids) => {
        const result = await client.from("profiles").select("*").in("id", ids);
        if (result.error) throw result.error;
        return result.data ?? [];
      })),
      Promise.all(chunks(courseIds).map(async (ids) => {
        const result = await client.from("courses").select("id,title").in("id", ids);
        if (result.error) throw result.error;
        return result.data ?? [];
      })),
      Promise.all(chunks(rows.map((row) => row.id)).map(async (ids) => {
        const result = await client.from("certificates").select("*").in("enrollment_id", ids);
        if (result.error) throw result.error;
        return result.data ?? [];
      })),
    ]);
    const profiles = profilePages.flat();
    const courses = coursePages.flat();
    const certificates = certificatePages.flat();
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
    const courseById = new Map(courses.map((course) => [course.id, course]));
    const certificateByEnrollment = new Map(certificates.map((certificate) => [certificate.enrollment_id, certificate]));
    const certificateFilter = query.filters.get("certificate");
    const search = escapePostgrestSearch(query.search).toLocaleLowerCase("es-MX");
    const exported: EnrollmentExport[] = [];
    for (const row of rows) {
      const profile = profileById.get(row.user_id);
      const course = courseById.get(row.course_id);
      const certificate = certificateByEnrollment.get(row.id);
      const result = {
        ...row,
        user_name: profile?.full_name ?? "",
        user_email: profile?.email ?? "",
        course_title: course?.title ?? "",
        certificate_status: certificate?.status ?? "none",
        certificate_filename: certificate?.original_filename ?? "",
      };
      if (certificateFilter === "none" && result.certificate_status !== "none") continue;
      if ((certificateFilter === "pending" || certificateFilter === "available") && result.certificate_status !== certificateFilter) continue;
      if (search && !`${result.user_name} ${result.user_email} ${result.course_title}`.toLocaleLowerCase("es-MX").includes(search)) continue;
      exported.push(result);
    }
    return exported;
  },
});
