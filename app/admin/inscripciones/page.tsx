"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardList, Search, SearchX, Upload } from "lucide-react";
import { useAdminCollection, type Enrollment, type EnrollmentSource } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { CertificateUploadDialog } from "@/components/admin/certificate-upload-dialog";
import { CoursePicker, UserPicker, type AdminCourseOption } from "@/components/admin/enrollment-pickers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatAdminDate } from "@/lib/admin-format";
import type { AdminUser } from "@/lib/admin-data";

type PersistedEnrollment = {
  id: string;
  user_id: string;
  course_id: string;
  source: "internal" | "external" | "stripe";
  status: "in_progress" | "completed";
  enrolled_at: string;
  certificates?: { id: string; status: "pending" | "available"; storage_path: string | null }
    | { id: string; status: "pending" | "available"; storage_path: string | null }[];
  user?: { id: string; full_name: string | null; email?: string | null; avatar_url: string | null } | null;
  course?: { id: string; title: string; modality: "online" | "in_person" } | null;
};

type FilterPatch = Partial<Record<"q" | "status" | "source" | "certificate" | "courseId" | "page", string | null>>;

const filterControlStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" };
const bulkBannerStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.75rem 1rem", background: "var(--primary-light)", borderRadius: "var(--radius)", marginBottom: "1rem" };

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

function enumParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T) {
  return allowed.includes(value as T) ? value as T : fallback;
}

function pageParam(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function enrollmentFromRow(row: PersistedEnrollment): Enrollment {
  const certificate = Array.isArray(row.certificates) ? row.certificates[0] : row.certificates;
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user?.full_name ?? row.user?.email ?? "Sin nombre",
    userEmail: row.user?.email ?? "",
    userAvatarUrl: row.user?.avatar_url ?? undefined,
    courseId: row.course_id,
    courseName: row.course?.title ?? "Sin curso",
    courseModality: row.course?.modality === "in_person" ? "presencial" : "online",
    enrolledAt: row.enrolled_at.slice(0, 10),
    source: row.source === "external" ? "externa" : "interna",
    status: row.status === "completed" ? "realizado" : "en-curso",
    certificateId: certificate?.id,
    certificateStatus: certificate?.status === "available" ? "disponible" : certificate ? "pendiente" : undefined,
  };
}

function SourceBadge({ source }: { source: EnrollmentSource }) {
  return <Badge variant={source === "interna" ? "secondary" : "outline"}>{source === "interna" ? "Sitio ELSI" : "Plataforma externa"}</Badge>;
}

function StatusCell({ enrollment }: { enrollment: Enrollment }) {
  if (enrollment.status === "en-curso") return <Badge variant="secondary">En curso</Badge>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
      <Badge variant="default">Realizado</Badge>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {enrollment.certificateStatus === "disponible" ? "Constancia disponible" : enrollment.certificateStatus === "pendiente" ? "Constancia pendiente" : "Sin constancia"}
      </span>
    </div>
  );
}

function UserCell({ enrollment }: { enrollment: Enrollment }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Avatar size="sm"><AvatarImage src={enrollment.userAvatarUrl} alt="" /><AvatarFallback>{initials(enrollment.userName)}</AvatarFallback></Avatar>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700 }}>{enrollment.userName}</span>
        <span className="admin-cell-muted" style={{ display: "block", fontSize: "0.75rem", overflowWrap: "anywhere" }}>{enrollment.userEmail || "Sin correo"}</span>
      </span>
    </span>
  );
}

function EnrollmentWorkspace() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourseOption | null>(null);
  const [filterCourse, setFilterCourse] = useState<AdminCourseOption | null>(null);
  const [source, setSource] = useState<EnrollmentSource>("interna");
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [certificateTarget, setCertificateTarget] = useState<Enrollment[]>([]);
  const [manualTarget, setManualTarget] = useState<Enrollment | null>(null);

  const query = searchParams.get("q") ?? "";
  const statusFilter = enumParam(searchParams.get("status"), ["todas", "en-curso", "realizado"] as const, "todas");
  const sourceFilter = enumParam(searchParams.get("source"), ["todas", "interna", "externa"] as const, "todas");
  const certificateFilter = enumParam(searchParams.get("certificate"), ["todas", "sin-constancia", "pendiente", "disponible"] as const, "todas");
  const courseId = searchParams.get("courseId") ?? "";
  const page = pageParam(searchParams.get("page"));

  const updateUrl = useCallback((patch: FilterPatch) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "todas" || (key === "page" && value === "1")) next.delete(key);
      else next.set(key, value);
    }
    window.history.replaceState(null, "", `${pathname}${next.size ? `?${next}` : ""}`);
  }, [pathname, searchParams]);

  const enrollmentUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25", sort: "enrolled_at", direction: "desc" });
    if (query.trim()) params.set("q", query.trim());
    if (statusFilter !== "todas") params.set("status", statusFilter === "realizado" ? "completed" : "in_progress");
    if (sourceFilter !== "todas") params.set("source", sourceFilter === "externa" ? "external" : "internal");
    if (certificateFilter !== "todas") params.set("certificate", certificateFilter === "sin-constancia" ? "none" : certificateFilter === "pendiente" ? "pending" : "available");
    if (courseId) params.set("courseId", courseId);
    return `/api/admin/enrollments?${params}`;
  }, [certificateFilter, courseId, page, query, sourceFilter, statusFilter]);
  const enrollmentCollection = useAdminCollection<PersistedEnrollment>(enrollmentUrl, "enrollments");
  const displayedEnrollments = useMemo(() => enrollmentCollection.items.map(enrollmentFromRow), [enrollmentCollection.items]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const uploadableIds = useMemo(() => {
    const ids: string[] = [];
    for (const enrollment of displayedEnrollments) {
      if (enrollment.certificateStatus !== "disponible") ids.push(enrollment.id);
    }
    return ids;
  }, [displayedEnrollments]);
  const selectedTargets = useMemo(() => displayedEnrollments.filter((enrollment) => selectedSet.has(enrollment.id) && enrollment.certificateStatus !== "disponible"), [displayedEnrollments, selectedSet]);
  const allUploadableSelected = uploadableIds.length > 0 && uploadableIds.every((id) => selectedSet.has(id));
  const grouped = useMemo(() => {
    const groups = new Map<string, { courseId: string; courseName: string; modality?: Enrollment["courseModality"]; rows: Enrollment[]; uploadableIds: string[] }>();
    for (const enrollment of displayedEnrollments) {
      const current = groups.get(enrollment.courseId) ?? { courseId: enrollment.courseId, courseName: enrollment.courseName, modality: enrollment.courseModality, rows: [], uploadableIds: [] };
      current.rows.push(enrollment);
      if (enrollment.certificateStatus !== "disponible") current.uploadableIds.push(enrollment.id);
      groups.set(enrollment.courseId, current);
    }
    return [...groups.values()];
  }, [displayedEnrollments]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser || !selectedCourse) {
      toast({ title: "Selecciona un alumno y un curso.", variant: "error" });
      return;
    }
    setSaving(true);
    const response = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, courseId: selectedCourse.id, source: source === "externa" ? "external" : "internal" }),
    });
    setSaving(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      toast({ title: payload?.error ?? "No fue posible registrar la inscripción.", variant: "error" });
      return;
    }
    enrollmentCollection.reload();
    toast({ title: "Inscripción registrada.", variant: "success" });
    setSelectedUser(null);
    setSelectedCourse(null);
    setSource("interna");
  };

  const publishCertificate = async (enrollment: Enrollment) => {
    if (!enrollment.certificateId) {
      toast({ title: "Primero carga la constancia.", variant: "error" });
      return;
    }
    const response = await fetch(`/api/admin/certificates/${enrollment.certificateId}`, { method: "PATCH" });
    if (!response.ok) {
      toast({ title: "No fue posible publicar la constancia.", variant: "error" });
      return;
    }
    enrollmentCollection.reload();
    toast({ title: "Constancia publicada.", variant: "success" });
  };

  const rowActions = (enrollment: Enrollment) => (
    <>
      {enrollment.certificateStatus === "pendiente" ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => void publishCertificate(enrollment)}><CheckCircle2 aria-hidden="true" size={12} /> Publicar</Button>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={() => setCertificateTarget([enrollment])}>
        <Upload aria-hidden="true" size={12} /> {enrollment.certificateStatus ? "Reemplazar" : "Constancia"}
      </Button>
      {enrollment.status === "en-curso" ? (
        <Button type="button" variant="ghost" size="sm" title="Respaldo excepcional sin constancia" onClick={() => setManualTarget(enrollment)}>
          <CheckCircle2 aria-hidden="true" size={12} /> Marcar realizado
        </Button>
      ) : null}
    </>
  );

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="admin-page-title">Inscripciones</h1>
        <p className="admin-page-sub">{enrollmentCollection.pagination.total} inscripciones registradas</p>
      </div>

      <details className="admin-panel" style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontSize: "0.875rem", fontWeight: 800 }}>Registrar inscripción</summary>
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "0.75rem" }}>
            <UserPicker label="Alumno" value={selectedUser} onChange={setSelectedUser} />
            <CoursePicker label="Curso activo" value={selectedCourse} onChange={setSelectedCourse} activeOnly />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ minWidth: "12rem" }}>
              <label htmlFor="enrollment-source" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.375rem" }}>Origen</label>
              <select id="enrollment-source" value={source} onChange={(event) => setSource(event.target.value as EnrollmentSource)} className="admin-select">
                <option value="interna">Sitio ELSI</option>
                <option value="externa">Plataforma externa</option>
              </select>
            </div>
            <Button type="submit" variant="primary" disabled={saving || !selectedUser || !selectedCourse}>{saving ? "Registrando…" : "Inscribir"}</Button>
          </div>
        </form>
      </details>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "14rem" }}>
          <Search aria-hidden="true" size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input type="search" value={query} onChange={(event) => updateUrl({ q: event.target.value, page: null })} placeholder="Buscar por alumno o curso" aria-label="Buscar inscripciones" style={{ ...filterControlStyle, width: "100%", paddingLeft: "2rem" }} />
        </div>
        <select value={statusFilter} onChange={(event) => updateUrl({ status: event.target.value, page: null })} aria-label="Filtrar por estado" className="admin-select">
          <option value="todas">Todos los estados</option><option value="en-curso">En curso</option><option value="realizado">Realizado</option>
        </select>
        <select value={sourceFilter} onChange={(event) => updateUrl({ source: event.target.value, page: null })} aria-label="Filtrar por origen" className="admin-select">
          <option value="todas">Todos los orígenes</option><option value="interna">Sitio ELSI</option><option value="externa">Plataforma externa</option>
        </select>
        <select value={certificateFilter} onChange={(event) => updateUrl({ certificate: event.target.value, page: null })} aria-label="Filtrar por constancia" className="admin-select">
          <option value="todas">Todas las constancias</option><option value="sin-constancia">Sin constancia</option><option value="pendiente">Pendiente</option><option value="disponible">Disponible</option>
        </select>
      </div>

      <details className="admin-panel" style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>{courseId ? "Curso filtrado" : "Filtrar por curso"}</summary>
        <div style={{ marginTop: "0.75rem" }}>
          <CoursePicker label="Curso" value={filterCourse?.id === courseId ? filterCourse : null} valueId={courseId || undefined} onChange={(course) => { setFilterCourse(course); updateUrl({ courseId: course?.id ?? null, page: null }); }} />
        </div>
      </details>

      {selectedTargets.length > 0 ? (
        <div style={bulkBannerStyle} role="status">
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--primary)" }}>{selectedTargets.length} alumno{selectedTargets.length === 1 ? "" : "s"} seleccionado{selectedTargets.length === 1 ? "" : "s"}</span>
          <Button type="button" variant="primary" size="sm" onClick={() => setCertificateTarget(selectedTargets)}><Upload aria-hidden="true" size={14} /> Asignar constancias</Button>
        </div>
      ) : null}

      {enrollmentCollection.error ? <p role="alert" className="admin-page-sub">{enrollmentCollection.error}</p> : null}
      {enrollmentCollection.loading ? <TableSkeleton rows={6} widths={["1.5rem", "11rem", "6rem", "6rem", "6rem", "8rem"]} /> : null}

      {!enrollmentCollection.loading && displayedEnrollments.length === 0 ? (
        <EmptyState
          icon={enrollmentCollection.pagination.total === 0 && !query && statusFilter === "todas" && sourceFilter === "todas" && certificateFilter === "todas" && !courseId ? <ClipboardList size={20} aria-hidden="true" /> : <SearchX size={20} aria-hidden="true" />}
          title={enrollmentCollection.pagination.total === 0 && !query && statusFilter === "todas" && sourceFilter === "todas" && certificateFilter === "todas" && !courseId ? "Sin inscripciones todavía" : "Sin coincidencias"}
          hint="Ajusta la búsqueda o los filtros para continuar."
        />
      ) : null}

      {!enrollmentCollection.loading ? grouped.map((group) => (
        <section key={group.courseId} className="admin-panel" aria-labelledby={`course-${group.courseId}`} style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <h2 id={`course-${group.courseId}`} className="admin-panel-title" style={{ margin: 0 }}>{group.courseName}</h2>
              <p className="admin-cell-muted" style={{ margin: "0.125rem 0 0", fontSize: "0.75rem" }}>{group.modality === "presencial" ? "Presencial" : "En línea"} · {group.rows.length} en esta página</p>
            </div>
            <Badge variant="outline">{group.rows.filter((row) => row.status === "realizado").length} realizados</Badge>
          </div>
          <AdminTable
            rows={group.rows}
            rowKey={(enrollment) => enrollment.id}
            minWidth="42rem"
            actionsHeader=""
            columns={[
              {
                key: "select", desktopOnly: true,
                header: <input type="checkbox" aria-label={`Seleccionar constancias de ${group.courseName}`} checked={group.uploadableIds.length > 0 && group.uploadableIds.every((id) => selectedSet.has(id))} onChange={(event) => {
                  const groupIds = new Set(group.uploadableIds);
                  setSelectedIds((current) => {
                    const next = new Set(current);
                    if (event.target.checked) group.uploadableIds.forEach((id) => next.add(id));
                    else current.forEach((id) => { if (groupIds.has(id)) next.delete(id); });
                    return [...next];
                  });
                }} disabled={group.uploadableIds.length === 0} className="admin-checkbox" />,
                cell: (enrollment) => enrollment.certificateStatus !== "disponible" ? <input type="checkbox" aria-label={`Seleccionar constancia de ${enrollment.userName}`} checked={selectedSet.has(enrollment.id)} onChange={() => setSelectedIds((current) => {
                  const next = new Set(current);
                  if (next.has(enrollment.id)) next.delete(enrollment.id);
                  else next.add(enrollment.id);
                  return [...next];
                })} className="admin-checkbox" /> : null,
              },
              { key: "user", header: "Alumno", primary: true, cell: (enrollment) => <UserCell enrollment={enrollment} /> },
              { key: "source", header: "Origen", cell: (enrollment) => <SourceBadge source={enrollment.source} /> },
              { key: "status", header: "Estado", cell: (enrollment) => <StatusCell enrollment={enrollment} /> },
              { key: "date", header: "Fecha", mobileLabel: "Inscrito el", cell: (enrollment) => <span className="admin-cell-muted">{formatAdminDate(enrollment.enrolledAt)}</span> },
            ]}
            actions={rowActions}
          />
        </section>
      )) : null}

      {uploadableIds.length > 0 && !allUploadableSelected ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds(uploadableIds)} style={{ marginBottom: "0.75rem" }}>Seleccionar constancias de esta página</Button>
      ) : null}
      <AdminPagination pagination={enrollmentCollection.pagination} onPageChange={(nextPage) => updateUrl({ page: String(nextPage) })} />

      {certificateTarget.length > 0 ? (
        <CertificateUploadDialog key={certificateTarget.map((target) => target.id).join(":")} enrollments={certificateTarget} onClose={() => setCertificateTarget([])} onChanged={() => { enrollmentCollection.reload(); setSelectedIds([]); }} />
      ) : null}

      <ConfirmDialog
        open={!!manualTarget}
        title="Marcar como realizado"
        description={manualTarget ? `Se marcará el curso como realizado para ${manualTarget.userName} (${manualTarget.courseName}) sin cargar una constancia. Úsalo solo para casos excepcionales.` : ""}
        confirmLabel="Marcar realizado"
        onClose={() => setManualTarget(null)}
        onConfirm={() => {
          const target = manualTarget;
          setManualTarget(null);
          if (!target) return;
          fetch(`/api/admin/enrollments/${target.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "completed" }) })
            .then(async (response) => { if (!response.ok) throw new Error(); enrollmentCollection.reload(); toast({ title: "Curso marcado como realizado.", variant: "success" }); })
            .catch(() => toast({ title: "No fue posible actualizar la inscripción.", variant: "error" }));
        }}
      />
    </div>
  );
}

export default function AdminEnrollmentsPage() {
  return <Suspense fallback={<TableSkeleton rows={6} widths={["1.5rem", "11rem", "6rem", "6rem", "6rem", "8rem"]} />}><EnrollmentWorkspace /></Suspense>;
}
