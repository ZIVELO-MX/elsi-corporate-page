"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

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

export type PageSection = {
  id: string;
  label: string;
  key: string;
  content: string;
  active: boolean;
};

const INITIAL_COURSES: AdminCourse[] = [
  { id: "c1", title: "Fundamentos de Educación Ambiental", category: "Sostenibilidad", slug: "fundamentos-de-educacion-ambiental", price: 0, status: "active", externalUrl: "https://elsyacademy.me", students: 184, createdAt: "2025-01-15",
    synopsis: "Introducción a los principios de la educación ambiental aplicada a contextos comunitarios y escolares.",
    duration: "8 horas", targetAudience: "Docentes, promotores comunitarios y público general",
    curriculum: "Fundamentos de sostenibilidad\n- Recursos naturales y su gestión\n- Huella ecológica\nEstrategias de educación ambiental\n- Diseño de talleres\n- Evaluación de impacto",
    modality: "online", presencialLocation: "", presencialDate: "", presencialTime: "", presencialInfo: "" },
  { id: "c2", title: "Cumplimiento Ambiental para Empresas", category: "Normatividad", slug: "cumplimiento-ambiental-para-empresas", price: 0, status: "active", externalUrl: "https://elsyacademy.me", students: 92, createdAt: "2025-02-20",
    synopsis: "Marco normativo ambiental vigente y su aplicación práctica en procesos industriales.",
    duration: "12 horas", targetAudience: "Responsables de cumplimiento y gerencia de operaciones",
    curriculum: "Marco legal ambiental\n- Normas federales y estatales\n- Permisos y licencias\nAuditoría y reporte\n- Indicadores de cumplimiento\n- Documentación requerida",
    modality: "online", presencialLocation: "", presencialDate: "", presencialTime: "", presencialInfo: "" },
  { id: "c3", title: "Liderazgo Ambiental Universitario", category: "Formación", slug: "liderazgo-ambiental-universitario", price: 0, status: "active", externalUrl: "", students: 56, createdAt: "2025-03-10",
    synopsis: "Formación de liderazgo estudiantil orientado a iniciativas de sostenibilidad en campus universitarios.",
    duration: "6 horas", targetAudience: "Estudiantes universitarios y grupos ambientales estudiantiles",
    curriculum: "Liderazgo y trabajo en equipo\n- Gestión de proyectos estudiantiles\nIniciativas sostenibles en campus\n- Casos de éxito\n- Planeación de campañas",
    modality: "presencial", presencialLocation: "Campus Central ELSI, Auditorio B", presencialDate: "2025-08-14", presencialTime: "09:00 - 13:00",
    presencialInfo: "Cupo limitado a 40 personas. Se recomienda llegar 15 minutos antes del inicio." },
  { id: "c4", title: "Gestión de Residuos Industriales", category: "Operaciones", slug: "gestion-de-residuos-industriales", price: 0, status: "inactive", externalUrl: "", students: 0, createdAt: "2025-04-05",
    synopsis: "Manejo integral de residuos peligrosos y no peligrosos en entornos industriales.",
    duration: "10 horas", targetAudience: "Personal operativo y de seguridad industrial",
    curriculum: "Clasificación de residuos\n- Peligrosos y no peligrosos\nManejo y disposición\n- Almacenamiento temporal\n- Proveedores autorizados",
    modality: "presencial", presencialLocation: "Planta industrial ELSI, Zona Norte", presencialDate: "Por confirmar", presencialTime: "Por confirmar",
    presencialInfo: "Requiere equipo de protección personal, proporcionado por la empresa anfitriona." },
  { id: "c5", title: "Impacto Ambiental y Permisos", category: "Normatividad", slug: "impacto-ambiental-y-permisos", price: 0, status: "inactive", externalUrl: "", students: 0, createdAt: "2025-05-12",
    synopsis: "Evaluación de impacto ambiental y proceso de obtención de permisos para nuevos proyectos.",
    duration: "8 horas", targetAudience: "Equipos de proyectos y consultoría ambiental",
    curriculum: "Manifiesto de impacto ambiental\n- Estructura y contenido\nProceso de permisos\n- Autoridades competentes\n- Tiempos y requisitos",
    modality: "online", presencialLocation: "", presencialDate: "", presencialTime: "", presencialInfo: "" },
  { id: "c6", title: "Comunicación de Sostenibilidad", category: "Sostenibilidad", slug: "comunicacion-de-sostenibilidad", price: 0, status: "inactive", externalUrl: "", students: 0, createdAt: "2025-06-01",
    synopsis: "Estrategias de comunicación para divulgar resultados y compromisos de sostenibilidad.",
    duration: "5 horas", targetAudience: "Equipos de comunicación y relaciones institucionales",
    curriculum: "Narrativa de sostenibilidad\n- Mensajes clave por audiencia\nCanales y formatos\n- Reportes públicos\n- Redes y medios",
    modality: "online", presencialLocation: "", presencialDate: "", presencialTime: "", presencialInfo: "" },
];

const INITIAL_USERS: AdminUser[] = [
  { id: "u1", name: "Admin ELSI", email: "admin@elsi.com", role: "admin", enrolledCourses: 0, createdAt: "2025-01-01" },
  { id: "u2", name: "María García", email: "maria@example.com", role: "user", enrolledCourses: 2, createdAt: "2025-03-15" },
  { id: "u3", name: "Juan López", email: "juan@example.com", role: "user", enrolledCourses: 1, createdAt: "2025-04-20" },
  { id: "u4", name: "Ana Martínez", email: "ana@example.com", role: "user", enrolledCourses: 3, createdAt: "2025-05-10" },
  { id: "u5", name: "Carlos Sánchez", email: "carlos@example.com", role: "user", enrolledCourses: 0, createdAt: "2025-06-05" },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  { id: "e1", userId: "u2", userName: "María García", courseId: "c1", courseName: "Fundamentos de Educación Ambiental", enrolledAt: "2025-04-01", source: "interna", status: "realizado", certificateStatus: "disponible" },
  { id: "e2", userId: "u2", userName: "María García", courseId: "c2", courseName: "Cumplimiento Ambiental para Empresas", enrolledAt: "2025-04-15", source: "externa", status: "en-curso" },
  { id: "e3", userId: "u3", userName: "Juan López", courseId: "c1", courseName: "Fundamentos de Educación Ambiental", enrolledAt: "2025-05-01", source: "interna", status: "realizado", certificateStatus: "pendiente" },
  { id: "e4", userId: "u4", userName: "Ana Martínez", courseId: "c1", courseName: "Fundamentos de Educación Ambiental", enrolledAt: "2025-05-20", source: "interna", status: "en-curso" },
  { id: "e5", userId: "u4", userName: "Ana Martínez", courseId: "c2", courseName: "Cumplimiento Ambiental para Empresas", enrolledAt: "2025-06-01", source: "externa", status: "en-curso" },
  { id: "e6", userId: "u4", userName: "Ana Martínez", courseId: "c3", courseName: "Liderazgo Ambiental Universitario", enrolledAt: "2025-06-10", source: "interna", status: "en-curso" },
];

const INITIAL_SALES: Sale[] = [
  { id: "s1", userId: "u2", userName: "María García", courseId: "c1", courseName: "Fundamentos de Educación Ambiental", amount: 0, soldAt: "2025-04-01" },
  { id: "s2", userId: "u3", userName: "Juan López", courseId: "c1", courseName: "Fundamentos de Educación Ambiental", amount: 0, soldAt: "2025-05-01" },
  { id: "s3", userId: "u4", userName: "Ana Martínez", courseId: "c2", courseName: "Cumplimiento Ambiental para Empresas", amount: 0, soldAt: "2025-06-01" },
];

const INITIAL_SECTIONS: PageSection[] = [
  { id: "sec-1", label: "Hero", key: "hero", content: "Formamos líderes ambientales con educación práctica y accesible.", active: true },
  { id: "sec-2", label: "Propuesta de valor", key: "value-prop", content: "Educación ambiental de calidad para profesionales y empresas.", active: true },
  { id: "sec-3", label: "Beneficios", key: "benefits", content: "Aprende a tu ritmo, certificados avalados, mentoría personalizada.", active: true },
  { id: "sec-4", label: "Cursos destacados", key: "featured-courses", content: "Explora nuestra oferta educativa diseñada para el cambio.", active: true },
  { id: "sec-5", label: "Testimonios", key: "testimonials", content: "Lo que dicen nuestros alumnos sobre su experiencia.", active: false },
  { id: "sec-6", label: "FAQ", key: "faq", content: "Respuestas a las preguntas más frecuentes.", active: true },
  { id: "sec-7", label: "CTA final", key: "cta", content: "Únete a la comunidad de líderes ambientales.", active: true },
];

type AdminData = {
  loading: boolean;
  courses: AdminCourse[];
  users: AdminUser[];
  enrollments: Enrollment[];
  sales: Sale[];
  sections: PageSection[];
  addCourse: (c: Omit<AdminCourse, "id" | "students" | "createdAt">) => void;
  updateCourse: (id: string, data: Partial<AdminCourse>) => void;
  toggleCourse: (id: string) => void;
  addEnrollment: (userId: string, courseId: string, source?: EnrollmentSource) => void;
  completeEnrollment: (id: string, method: "constancia" | "manual") => void;
  completeEnrollmentsBulk: (ids: string[]) => void;
  markCertificateAvailable: (id: string) => void;
  addSale: (userId: string, courseId: string, amount: number) => void;
  updateSection: (id: string, data: Partial<PageSection>) => void;
  getUserName: (id: string) => string;
  getCourseName: (id: string) => string;
};

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<AdminCourse[]>(INITIAL_COURSES);
  const [users] = useState<AdminUser[]>(INITIAL_USERS);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [sections, setSections] = useState<PageSection[]>(INITIAL_SECTIONS);
  // Simulated initial fetch: the provider mounts once for the whole panel, so the
  // skeleton shows on first entry and navigation stays instant afterward. When the
  // Supabase data layer lands, this flag becomes the real query loading state.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
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
    const userName = INITIAL_USERS.find(u => u.id === userId)?.name ?? "Desconocido";
    const courseName = INITIAL_COURSES.find(c => c.id === courseId)?.title ?? "Desconocido";
    setEnrollments(prev => [...prev, { id, userId, userName, courseId, courseName, enrolledAt: new Date().toISOString().split("T")[0], source, status: "en-curso" }]);
  }, []);

  // "constancia" = admin cargo una constancia -> finalizacion automatica, pendiente de publicacion.
  // "manual" = boton de respaldo para casos excepcionales, sin constancia asociada.
  const completeEnrollment = useCallback((id: string, method: "constancia" | "manual") => {
    setEnrollments(prev => prev.map(e => e.id === id
      ? { ...e, status: "realizado", certificateStatus: method === "constancia" ? "pendiente" : e.certificateStatus }
      : e));
  }, []);

  const completeEnrollmentsBulk = useCallback((ids: string[]) => {
    setEnrollments(prev => prev.map(e => ids.includes(e.id)
      ? { ...e, status: "realizado", certificateStatus: "pendiente" }
      : e));
  }, []);

  const markCertificateAvailable = useCallback((id: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, certificateStatus: "disponible" } : e));
  }, []);

  const addSale = useCallback((userId: string, courseId: string, amount: number) => {
    const id = "s" + Date.now();
    const userName = INITIAL_USERS.find(u => u.id === userId)?.name ?? "Desconocido";
    const courseName = INITIAL_COURSES.find(c => c.id === courseId)?.title ?? "Desconocido";
    setSales(prev => [...prev, { id, userId, userName, courseId, courseName, amount, soldAt: new Date().toISOString().split("T")[0] }]);
  }, []);

  const updateSection = useCallback((id: string, data: Partial<PageSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const getUserName = useCallback((id: string) => {
    return INITIAL_USERS.find(u => u.id === id)?.name ?? "Desconocido";
  }, []);

  const getCourseName = useCallback((id: string) => {
    return INITIAL_COURSES.find(c => c.id === id)?.title ?? "Desconocido";
  }, []);

  return (
    <AdminDataContext.Provider value={{ loading, courses, users, enrollments, sales, sections, addCourse, updateCourse, toggleCourse, addEnrollment, completeEnrollment, completeEnrollmentsBulk, markCertificateAvailable, addSale, updateSection, getUserName, getCourseName }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData debe usarse dentro de AdminDataProvider");
  return ctx;
}
