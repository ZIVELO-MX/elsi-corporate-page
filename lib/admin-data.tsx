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
  addCourse: (c: Omit<AdminCourse, "id" | "students" | "createdAt">) => void;
  updateCourse: (id: string, data: Partial<AdminCourse>) => void;
  toggleCourse: (id: string) => void;
  addEnrollment: (userId: string, courseId: string, source?: EnrollmentSource) => void;
  completeEnrollment: (id: string, method: "constancia" | "manual") => void;
  completeEnrollmentsBulk: (ids: string[]) => void;
  markCertificateAvailable: (id: string) => void;
  addSale: (userId: string, courseId: string, amount: number) => void;
  updateSection: (id: string, data: Partial<PageSection>) => void;
  markLeadAttended: (id: string) => void;
  addTestimonial: (t: Omit<Testimonial, "id">) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  toggleTestimonial: (id: string) => void;
  deleteTestimonial: (id: string) => void;
  getUserName: (id: string) => string;
  getCourseName: (id: string) => string;
  approvePendingPayment: (id: string) => Promise<void>;
};

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

        setUsers(persistedUsers);
        setCourses(persistedCourses);
        setEnrollments(persistedEnrollments);
        setLeads(persistedLeads);
        setSections(persistedSections);
        setSales(persistedSales);
        setPendingPayments(persistedPendingPayments);
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

  const addCourse = useCallback((c: Omit<AdminCourse, "id" | "students" | "createdAt">) => {
    const id = "c" + Date.now();
    setCourses(prev => [...prev, { ...c, id, students: 0, createdAt: new Date().toISOString().split("T")[0] }]);
  }, []);

  const updateCourse = useCallback((id: string, data: Partial<AdminCourse>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const toggleCourse = useCallback((id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  }, []);

  const addEnrollment = useCallback((userId: string, courseId: string, source: EnrollmentSource = "interna") => {
    const id = "e" + Date.now();
    const userName = users.find(u => u.id === userId)?.name ?? "Desconocido";
    const courseName = courses.find(c => c.id === courseId)?.title ?? "Desconocido";
    setEnrollments(prev => [...prev, { id, userId, userName, courseId, courseName, enrolledAt: new Date().toISOString().split("T")[0], source, status: "en-curso" }]);
  }, [courses, users]);

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
        soldAt: approved.soldAt,
      }, ...previous]);
    }
  }, [pendingPayments]);

  // "constancia" = admin cargo una constancia -> finalizacion automatica, pendiente de publicacion.
  // "manual" = boton de respaldo para casos excepcionales, sin constancia asociada.
  const completeEnrollment = useCallback((id: string, method: "constancia" | "manual") => {
    setEnrollments(prev => prev.map(e => e.id === id
      ? { ...e, status: "realizado", certificateStatus: method === "constancia" ? "pendiente" : e.certificateStatus }
      : e));
  }, []);

  const completeEnrollmentsBulk = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setEnrollments(prev => prev.map(e => idSet.has(e.id)
      ? { ...e, status: "realizado", certificateStatus: "pendiente" }
      : e));
  }, []);

  const markCertificateAvailable = useCallback((id: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, certificateStatus: "disponible" } : e));
  }, []);

  const addSale = useCallback((userId: string, courseId: string, amount: number) => {
    const id = "s" + Date.now();
    const userName = users.find(u => u.id === userId)?.name ?? "Desconocido";
    const courseName = courses.find(c => c.id === courseId)?.title ?? "Desconocido";
    setSales(prev => [...prev, { id, userId, userName, courseId, courseName, amount, soldAt: new Date().toISOString().split("T")[0] }]);
  }, [courses, users]);

  const updateSection = useCallback((id: string, data: Partial<PageSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const markLeadAttended = useCallback((id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "atendido" } : l));
  }, []);

  const addTestimonial = useCallback((t: Omit<Testimonial, "id">) => {
    setTestimonials(prev => [...prev, { ...t, id: "t" + Date.now() }]);
  }, []);

  const updateTestimonial = useCallback((id: string, data: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const toggleTestimonial = useCallback((id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  }, []);

  const deleteTestimonial = useCallback((id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  }, []);

  const getUserName = useCallback((id: string) => {
    return users.find(u => u.id === id)?.name ?? "Desconocido";
  }, [users]);

  const getCourseName = useCallback((id: string) => {
    return courses.find(c => c.id === id)?.title ?? "Desconocido";
  }, [courses]);

  const value = useMemo(
    () => ({ loading, error, courses, users, enrollments, sales, pendingPayments, sections, leads, testimonials, addCourse, updateCourse, toggleCourse, addEnrollment, completeEnrollment, completeEnrollmentsBulk, markCertificateAvailable, addSale, updateSection, markLeadAttended, addTestimonial, updateTestimonial, toggleTestimonial, deleteTestimonial, getUserName, getCourseName, approvePendingPayment }),
    [loading, error, courses, users, enrollments, sales, pendingPayments, sections, leads, testimonials, addCourse, updateCourse, toggleCourse, addEnrollment, completeEnrollment, completeEnrollmentsBulk, markCertificateAvailable, addSale, updateSection, markLeadAttended, addTestimonial, updateTestimonial, toggleTestimonial, deleteTestimonial, getUserName, getCourseName, approvePendingPayment],
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
