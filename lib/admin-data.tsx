"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";

export type CourseModality = "online" | "presencial";

export type AdminCourse = {
  id: string;
  title: string;
  category: string;
  slug: string;
  price: number;
  status: "active" | "inactive";
  contentStatus: "fixture" | "verified";
  externalUrl: string;
  students: number;
  createdAt: string;
  synopsis: string;
  duration: string;
  targetAudience: string;
  curriculum: string;
  modality: CourseModality;
  presencialLocation: string;
  presencialDate: string;
  presencialTime: string;
  presencialInfo: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  enrolledCourses: number;
  createdAt: string;
};

export type EnrollmentSource = "interna" | "externa";
export type EnrollmentStatus = "en-curso" | "realizado";
export type CertificateStatus = "pendiente" | "disponible";

export type Enrollment = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  enrolledAt: string;
  source: EnrollmentSource;
  status: EnrollmentStatus;
  certificateStatus?: CertificateStatus;
  certificateId?: string;
};

export type Sale = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  amount: number;
  currency: string;
  soldAt: string;
};

export type PendingPayment = Sale & {
  status: "pending";
};

export type PageSection = {
  id: string;
  label: string;
  key: string;
  content: string;
  active: boolean;
};

export type LeadStatus = "nuevo" | "atendido";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  courseSlug?: string;
  createdAt: string;
  status: LeadStatus;
};

export type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  quote: string;
  avatarUrl?: string;
  courseId?: string;
  consentReference?: string;
  active: boolean;
};

type AdminData = {
  loading: boolean;
  error: string | null;
  courses: AdminCourse[];
  users: AdminUser[];
  enrollments: Enrollment[];
  sales: Sale[];
  pendingPayments: PendingPayment[];
  sections: PageSection[];
  leads: Lead[];
  testimonials: Testimonial[];
  addTestimonial: (t: Omit<Testimonial, "id">) => Promise<void>;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => Promise<void>;
  toggleTestimonial: (id: string) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  getUserName: (id: string) => string;
  getCourseName: (id: string) => string;
  approvePendingPayment: (id: string) => Promise<void>;
};

function testimonialPayload(testimonial: Omit<Testimonial, "id">) {
  return {
    authorName: testimonial.authorName,
    authorRole: testimonial.authorRole,
    quote: testimonial.quote,
    imagePath: testimonial.avatarUrl,
    courseId: testimonial.courseId,
    consentReference: testimonial.consentReference,
    isActive: testimonial.active,
  };
}

async function extractError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({})) as { error?: unknown };
  return typeof body.error === "string" ? body.error : fallback;
}

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAdminData = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/admin/courses", { cache: "no-store" }),
          fetch("/api/admin/users", { cache: "no-store" }),
          fetch("/api/admin/enrollments", { cache: "no-store" }),
          fetch("/api/admin/leads", { cache: "no-store" }),
          fetch("/api/admin/content", { cache: "no-store" }),
          fetch("/api/admin/orders", { cache: "no-store" }),
        ]);
        if (responses.some((response) => !response.ok)) throw new Error("No fue posible cargar los datos del panel.");

        const [coursesPayload, usersPayload, enrollmentsPayload, leadsPayload, contentPayload, salesPayload] = await Promise.all(
          responses.map((response) => response.json() as Promise<Record<string, unknown>>),
        );
        if (cancelled) return;

        const persistedUsers = Array.isArray(usersPayload.users) ? usersPayload.users as AdminUser[] : [];
        const persistedCourses = Array.isArray(coursesPayload.courses) ? coursesPayload.courses.map((row) => {
          const course = row as Record<string, unknown>;
          const syllabus = Array.isArray(course.syllabus) ? course.syllabus.map(String).join("\n") : typeof course.syllabus === "string" ? course.syllabus : "";
          return {
            id: String(course.id), title: String(course.title), category: "General", slug: String(course.slug),
            price: Number(course.price_cents ?? 0) / 100, status: course.is_active ? "active" : "inactive",
            contentStatus: course.content_status === "verified" ? "verified" : "fixture",
            externalUrl: String(course.enrollment_link ?? ""), students: 0,
            createdAt: String(course.created_at ?? "").slice(0, 10),
            synopsis: String(course.short_description ?? ""), duration: course.duration_hours ? `${course.duration_hours} horas` : "",
            targetAudience: String(course.audience ?? ""), curriculum: syllabus,
            modality: course.modality === "in_person" ? "presencial" : "online",
            presencialLocation: String(course.location ?? ""), presencialDate: "", presencialTime: "", presencialInfo: "",
          } satisfies AdminCourse;
        }) : [];
        const userById = new Map(persistedUsers.map((user) => [user.id, user]));
        const courseById = new Map(persistedCourses.map((course) => [course.id, course]));
        const persistedEnrollments = Array.isArray(enrollmentsPayload.enrollments) ? enrollmentsPayload.enrollments.map((row) => {
          const enrollment = row as Record<string, unknown>;
          const userId = String(enrollment.user_id);
          const courseId = String(enrollment.course_id);
          const certificates = Array.isArray(enrollment.certificates) ? enrollment.certificates[0] as Record<string, unknown> | undefined : enrollment.certificates as Record<string, unknown> | undefined;
          return {
            id: String(enrollment.id), userId, userName: userById.get(userId)?.name ?? `Alumno ${userId.slice(0, 8)}`,
            courseId, courseName: courseById.get(courseId)?.title ?? `Curso ${courseId.slice(0, 8)}`,
            enrolledAt: String(enrollment.enrolled_at ?? "").slice(0, 10),
            source: enrollment.source === "external" ? "externa" : "interna",
            status: enrollment.status === "completed" ? "realizado" : "en-curso",
            certificateId: certificates?.id as string | undefined,
            certificateStatus: certificates ? certificates.status === "available" ? "disponible" : "pendiente" : undefined,
          } satisfies Enrollment;
        }) : [];
        const persistedLeads = Array.isArray(leadsPayload.leads) ? leadsPayload.leads.map((row) => {
          const lead = row as Record<string, unknown>;
          const source = typeof lead.source === "string" ? lead.source : "";
          return {
            id: String(lead.id), name: String(lead.full_name ?? ""), email: String(lead.email ?? ""), phone: String(lead.phone ?? ""),
            message: String(lead.message ?? ""), courseSlug: source.startsWith("course:") ? source.slice(7) : undefined,
            createdAt: String(lead.created_at ?? "").slice(0, 10), status: lead.status === "new" ? "nuevo" : "atendido",
          } satisfies Lead;
        }) : [];
        const persistedSections = Array.isArray(contentPayload.sections) ? contentPayload.sections.map((row) => {
          const section = row as Record<string, unknown>;
          const body = section.body && typeof section.body === "object" ? section.body as Record<string, unknown> : {};
          return { id: String(section.id), key: String(section.section_key), label: String(section.title), content: typeof body.text === "string" ? body.text : "", active: Boolean(section.is_active) } satisfies PageSection;
        }) : [];
        const persistedSales = Array.isArray(salesPayload.sales) ? salesPayload.sales as Sale[] : [];
        const persistedPendingPayments = Array.isArray(salesPayload.pendingPayments) ? salesPayload.pendingPayments as PendingPayment[] : [];
        const persistedTestimonials = Array.isArray(contentPayload.testimonials) ? contentPayload.testimonials.map((row) => {
          const testimonial = row as Record<string, unknown>;
          return {
            id: String(testimonial.id), authorName: String(testimonial.author_name ?? ""), authorRole: String(testimonial.author_role ?? ""),
            quote: String(testimonial.quote ?? ""), avatarUrl: typeof testimonial.image_path === "string" ? testimonial.image_path : undefined,
            courseId: typeof testimonial.course_id === "string" ? testimonial.course_id : undefined,
            consentReference: typeof testimonial.consent_reference === "string" ? testimonial.consent_reference : undefined,
            active: Boolean(testimonial.is_active),
          } satisfies Testimonial;
        }) : [];

        setUsers(persistedUsers);
        setCourses(persistedCourses);
        setEnrollments(persistedEnrollments);
        setLeads(persistedLeads);
        setSections(persistedSections);
        setSales(persistedSales);
        setPendingPayments(persistedPendingPayments);
        setTestimonials(persistedTestimonials);
        setError(null);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los datos del panel.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadAdminData();
    return () => { cancelled = true; };
  }, []);

  const approvePendingPayment = useCallback(async (id: string) => {
    const response = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(typeof payload.error === "string" ? payload.error : "No fue posible aprobar la inscripción.");
    }
    const result = await response.json().catch(() => ({})) as { result?: { enrollment_id?: string } };
    const approved = pendingPayments.find((payment) => payment.id === id);
    setPendingPayments((previous) => previous.filter((payment) => payment.id !== id));
    if (approved) {
      setEnrollments((previous) => previous.some((enrollment) => enrollment.userId === approved.userId && enrollment.courseId === approved.courseId)
        ? previous
        : [{
          id: String(result.result?.enrollment_id ?? `pending-${approved.id}`),
          userId: approved.userId,
          userName: approved.userName,
          courseId: approved.courseId,
          courseName: approved.courseName,
          enrolledAt: new Date().toISOString().slice(0, 10),
          source: "interna",
          status: "en-curso",
        }, ...previous]);
      setSales((previous) => [{
        id: approved.id,
        userId: approved.userId,
        userName: approved.userName,
        courseId: approved.courseId,
        courseName: approved.courseName,
          amount: approved.amount,
          currency: approved.currency,
          soldAt: approved.soldAt,
      }, ...previous]);
    }
  }, [pendingPayments]);

  const addTestimonial = useCallback(async (testimonial: Omit<Testimonial, "id">) => {
    const response = await fetch("/api/admin/testimonials", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(testimonialPayload(testimonial)) });
    if (!response.ok) throw new Error(await extractError(response, "No fue posible crear el testimonio."));
    const payload = await response.json() as { testimonial: Record<string, unknown> };
    const row = payload.testimonial;
    setTestimonials((current) => [...current, { ...testimonial, id: String(row.id) }]);
  }, []);

  const updateTestimonial = useCallback(async (id: string, data: Partial<Testimonial>) => {
    const current = testimonials.find((testimonial) => testimonial.id === id);
    if (!current) throw new Error("Testimonio no encontrado.");
    const next = { ...current, ...data };
    const response = await fetch(`/api/admin/testimonials/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(testimonialPayload(next)) });
    if (!response.ok) throw new Error(await extractError(response, "No fue posible actualizar el testimonio."));
    setTestimonials((items) => items.map((testimonial) => testimonial.id === id ? next : testimonial));
  }, [testimonials]);

  const toggleTestimonial = useCallback(async (id: string) => {
    const current = testimonials.find((testimonial) => testimonial.id === id);
    if (!current) throw new Error("Testimonio no encontrado.");
    await updateTestimonial(id, { active: !current.active });
  }, [testimonials, updateTestimonial]);

  const deleteTestimonial = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(await extractError(response, "No fue posible eliminar el testimonio."));
    setTestimonials((items) => items.filter((testimonial) => testimonial.id !== id));
  }, []);

  const getUserName = useCallback((id: string) => {
    return users.find(u => u.id === id)?.name ?? "Desconocido";
  }, [users]);

  const getCourseName = useCallback((id: string) => {
    return courses.find(c => c.id === id)?.title ?? "Desconocido";
  }, [courses]);

  const value = useMemo(
    () => ({ loading, error, courses, users, enrollments, sales, pendingPayments, sections, leads, testimonials, addTestimonial, updateTestimonial, toggleTestimonial, deleteTestimonial, getUserName, getCourseName, approvePendingPayment }),
    [loading, error, courses, users, enrollments, sales, pendingPayments, sections, leads, testimonials, addTestimonial, updateTestimonial, toggleTestimonial, deleteTestimonial, getUserName, getCourseName, approvePendingPayment],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData debe usarse dentro de AdminDataProvider");
  return ctx;
}
