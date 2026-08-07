"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, CheckCircle2, Search, SearchX, ClipboardList } from "lucide-react";
import { useAdminData, type AdminCourse, type AdminUser, type EnrollmentSource, type Enrollment } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type StatusFilter = "todas" | "en-curso" | "realizado";
type SourceFilter = "todas" | EnrollmentSource;

type PersistedEnrollment = {
  id: string;
  user_id: string;
  course_id: string;
  source: "internal" | "external";
  status: "in_progress" | "completed";
  enrolled_at: string;
  certificates?: { id: string; status: "pending" | "available"; storage_path: string | null }
    | { id: string; status: "pending" | "available"; storage_path: string | null }[];
};

type PersistedCourse = {
  id: string;
  title: string;
  short_description: string;
  duration_hours: number | null;
  audience: string | null;
  modality: "online" | "in_person";
  location: string | null;
  price_cents: number;
  is_active: boolean;
  created_at: string;
};

function courseFromRow(row: PersistedCourse): AdminCourse {
  return {
    id: row.id,
    title: row.title,
    category: "General",
    slug: row.id,
    price: row.price_cents / 100,
    status: row.is_active ? "active" : "inactive",
    externalUrl: "",
    students: 0,
    createdAt: row.created_at.slice(0, 10),
    synopsis: row.short_description,
    duration: row.duration_hours ? `${row.duration_hours} horas` : "",
    targetAudience: row.audience ?? "",
    curriculum: "",
    modality: row.modality === "in_person" ? "presencial" : "online",
    presencialLocation: row.location ?? "",
    presencialDate: "",
    presencialTime: "",
    presencialInfo: "",
  };
}

function enrollmentFromRow(row: PersistedEnrollment, users: AdminUser[], courses: AdminCourse[]): Enrollment {
  const user = users.find(item => item.id === row.user_id);
  const course = courses.find(item => item.id === row.course_id);
  const certificate = Array.isArray(row.certificates) ? row.certificates[0] : row.certificates;
  return {
    id: row.id,
    userId: row.user_id,
    userName: user?.name ?? `Alumno ${row.user_id.slice(0, 8)}`,
    courseId: row.course_id,
    courseName: course?.title ?? `Curso ${row.course_id.slice(0, 8)}`,
    enrolledAt: row.enrolled_at.slice(0, 10),
    source: row.source === "external" ? "externa" : "interna",
    status: row.status === "completed" ? "realizado" : "en-curso",
    certificateId: certificate?.id,
    certificateStatus: certificate?.status === "available" ? "disponible" : certificate ? "pendiente" : undefined,
  };
}

const filterControlStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" };
const certListStyle: React.CSSProperties = { listStyle: "none", margin: "0 0 1rem", padding: 0, display: "flex", flexDirection: "column", gap: "0.375rem", maxHeight: "10rem", overflowY: "auto" };
const uploadLabelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1.5rem", border: "1px dashed var(--input)", borderRadius: "var(--radius-sm)", cursor: "pointer", marginBottom: "1.25rem" };
const bulkBannerStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.75rem 1.25rem", background: "var(--primary-light)", borderRadius: "var(--radius)", marginBottom: "1rem" };

function SourceBadge({ source }: { source: EnrollmentSource }) {
  return (
    <Badge variant={source === "interna" ? "secondary" : "outline"} style={{ fontSize: "0.75rem" }}>
      {source === "interna" ? "Sitio ELSI" : "Plataforma externa"}
    </Badge>
  );
}

function StatusCell({ enrollment }: { enrollment: Enrollment }) {
  if (enrollment.status === "en-curso") {
    return <Badge variant="secondary" style={{ fontSize: "0.75rem" }}>En curso</Badge>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
      <Badge variant="default" style={{ fontSize: "0.75rem" }}>Realizado</Badge>
      {enrollment.certificateStatus && (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {enrollment.certificateStatus === "disponible" ? "Constancia disponible" : "Constancia pendiente de publicación"}
        </span>
      )}
    </div>
  );
}

function CertificateDialog({
  enrollments, isReplace, files, onFiles, onClose, onConfirm,
}: {
  enrollments: Enrollment[];
  isReplace: boolean;
  onClose: () => void;
  files: File[];
  onFiles: (files: File[]) => void;
  onConfirm: (files: File[]) => void;
}) {
  const isBulk = enrollments.length > 1;
  const title = isBulk ? `Cargar constancias (${enrollments.length})` : isReplace ? "Reemplazar constancia" : "Cargar constancia";
  return (
    <Dialog open={enrollments.length > 0} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isBulk
              ? "Se marcará como realizado a todos los alumnos seleccionados y sus constancias quedarán pendientes de publicación."
              : isReplace
              ? `Se reemplazará el archivo actual y la constancia volverá a quedar pendiente de publicación. ${enrollments[0]?.userName} — ${enrollments[0]?.courseName}`
              : `${enrollments[0]?.userName} — ${enrollments[0]?.courseName}`}
          </DialogDescription>
        </DialogHeader>

        {isBulk && (
          <ul style={certListStyle}>
            {enrollments.map(e => (
              <li key={e.id} style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.userName} · {e.courseName}</li>
            ))}
          </ul>
        )}

        <label style={uploadLabelStyle}>
          <Upload size={20} color="var(--text-muted)" />
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            {isBulk ? "Arrastra los archivos o hacé click para elegirlos" : "Arrastra el archivo o hacé click para elegirlo"}
          </span>
          <input type="file" multiple={isBulk} accept=".pdf" style={{ display: "none" }} onChange={(event) => onFiles(Array.from(event.target.files ?? []))} />
        </label>
        {files.length > 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{files.map(file => file.name).join(" · ")}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={() => onConfirm(files)} disabled={files.length === 0}>
            {isBulk ? "Cargar constancias" : isReplace ? "Reemplazar constancia" : "Cargar constancia"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminEnrollments() {
  const { loading, courses, users, enrollments, addEnrollment, completeEnrollment, completeEnrollmentsBulk, markCertificateAvailable } = useAdminData();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [source, setSource] = useState<EnrollmentSource>("interna");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [certificateTarget, setCertificateTarget] = useState<Enrollment[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [isReplace, setIsReplace] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("todas");
  const [manualTarget, setManualTarget] = useState<Enrollment | null>(null);
  const [persistedEnrollments, setPersistedEnrollments] = useState<Enrollment[] | null>(null);
  const [persistedUsers, setPersistedUsers] = useState<AdminUser[] | null>(null);
  const [persistedCourses, setPersistedCourses] = useState<AdminCourse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/admin/enrollments"),
      fetch("/api/admin/users"),
      fetch("/api/admin/courses"),
    ])
      .then(async ([enrollmentsResponse, usersResponse, coursesResponse]) => {
        if (!enrollmentsResponse.ok || !usersResponse.ok || !coursesResponse.ok) return null;
        return Promise.all([enrollmentsResponse.json(), usersResponse.json(), coursesResponse.json()]);
      })
      .then(payload => {
        if (!cancelled && payload) {
          const [enrollmentsPayload, usersPayload, coursesPayload] = payload as [
            { enrollments?: PersistedEnrollment[] },
            { users?: AdminUser[] },
            { courses?: PersistedCourse[] },
          ];
          const nextUsers = usersPayload.users ?? [];
          const nextCourses = (coursesPayload.courses ?? []).map(courseFromRow);
          setPersistedUsers(nextUsers);
          setPersistedCourses(nextCourses);
          setPersistedEnrollments((enrollmentsPayload.enrollments ?? []).map(row => enrollmentFromRow(row, nextUsers, nextCourses)));
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const displayedEnrollments = persistedEnrollments ?? enrollments;
  const availableUsers = persistedUsers ?? users;
  const availableCourses = persistedCourses ?? courses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) {
      toast({ title: "Selecciona un alumno y un curso.", variant: "error" });
      return;
    }
    const already = displayedEnrollments.some(en => en.userId === selectedUser && en.courseId === selectedCourse);
    if (already) {
      toast({ title: "Ese alumno ya está inscrito en el curso.", variant: "error" });
      return;
    }
    if (persistedEnrollments) {
      const response = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, courseId: selectedCourse, source: source === "externa" ? "external" : "internal" }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast({ title: payload?.error ?? "No fue posible registrar la inscripción.", variant: "error" });
        return;
      }
      const payload = await response.json() as { enrollment: PersistedEnrollment };
      setPersistedEnrollments(prev => [...(prev ?? []), enrollmentFromRow(payload.enrollment, users, courses)]);
    } else {
      addEnrollment(selectedUser, selectedCourse, source);
    }
    toast({ title: "Inscripción registrada.", variant: "success" });
    setSelectedUser("");
    setSelectedCourse("");
    setSource("interna");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayedEnrollments.filter(e => {
      if (statusFilter !== "todas" && e.status !== statusFilter) return false;
      if (sourceFilter !== "todas" && e.source !== sourceFilter) return false;
      if (!q) return true;
      return e.userName.toLowerCase().includes(q) || e.courseName.toLowerCase().includes(q);
    });
  }, [displayedEnrollments, query, statusFilter, sourceFilter]);

  const selectableUsers = useMemo(() => availableUsers.filter((user) => user.role === "user"), [availableUsers]);
  const activeCourses = useMemo(() => availableCourses.filter((course) => course.status === "active"), [availableCourses]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const pendingIds = useMemo(
    () => filtered.flatMap((enrollment) => enrollment.status === "en-curso" ? [enrollment.id] : []),
    [filtered],
  );
  const allPendingSelected = pendingIds.length > 0 && pendingIds.every(id => selectedSet.has(id));

  const toggleSelectAll = () => {
    setSelectedIds(allPendingSelected ? [] : pendingIds);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const confirmCertificates = async (files: File[]) => {
    if (certificateTarget.length > 1) {
      if (persistedEnrollments) {
        if (files.length !== certificateTarget.length) { toast({ title: "Selecciona un PDF por inscripción.", variant: "error" }); return; }
        const responses = await Promise.all(certificateTarget.map((e, index) => { const form = new FormData(); form.set("file", files[index]); return fetch(`/api/admin/enrollments/${e.id}/certificate`, { method: "POST", body: form }); }));
        if (responses.some(response => !response.ok)) {
          toast({ title: "No fue posible actualizar todas las inscripciones.", variant: "error" });
          return;
        }
        setPersistedEnrollments(prev => (prev ?? []).map(e => certificateTarget.some(target => target.id === e.id) ? { ...e, status: "realizado", certificateStatus: "pendiente" } : e));
      } else completeEnrollmentsBulk(certificateTarget.map(e => e.id));
      toast({ title: `${certificateTarget.length} constancias cargadas.`, variant: "success" });
    } else if (certificateTarget[0]) {
      if (persistedEnrollments) {
        if (files.length !== 1) { toast({ title: "Selecciona un PDF.", variant: "error" }); return; }
        const form = new FormData(); form.set("file", files[0]);
        const response = await fetch(`/api/admin/enrollments/${certificateTarget[0].id}/certificate`, { method: "POST", body: form });
        if (!response.ok) { toast({ title: "No fue posible actualizar la inscripción.", variant: "error" }); return; }
        setPersistedEnrollments(prev => (prev ?? []).map(e => e.id === certificateTarget[0]?.id ? { ...e, status: "realizado", certificateStatus: "pendiente" } : e));
      } else completeEnrollment(certificateTarget[0].id, "constancia");
      toast({ title: isReplace ? "Constancia reemplazada." : "Constancia cargada.", variant: "success" });
    }
    setSelectedIds([]);
    setCertificateTarget([]);
    setCertificateFiles([]);
    setIsReplace(false);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="admin-page-title">Inscripciones</h1>
        <p className="admin-page-sub">
          {filtered.length === displayedEnrollments.length
            ? `${displayedEnrollments.length} inscripciones registradas`
            : `${filtered.length} de ${displayedEnrollments.length} inscripciones`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-bar">
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label htmlFor="enr-usuario" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Usuario</label>
          <select id="enr-usuario" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required
            className="admin-select" style={{ width: "100%" }}>
            <option value="">Seleccionar usuario</option>
            {selectableUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label htmlFor="enr-curso" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Curso</label>
          <select id="enr-curso" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required
            className="admin-select" style={{ width: "100%" }}>
            <option value="">Seleccionar curso</option>
            {activeCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "10rem" }}>
          <label htmlFor="enr-origen" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Origen</label>
          <select id="enr-origen" value={source} onChange={e => setSource(e.target.value as EnrollmentSource)}
            className="admin-select" style={{ width: "100%" }}>
            <option value="interna">Sitio ELSI</option>
            <option value="externa">Plataforma externa</option>
          </select>
        </div>
        <Button type="submit" variant="primary">Inscribir</Button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "14rem" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por alumno o curso"
            aria-label="Buscar inscripciones"
            style={{ ...filterControlStyle, width: "100%", paddingLeft: "2rem" }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filtrar por estado" className="admin-select">
          <option value="todas">Todos los estados</option>
          <option value="en-curso">En curso</option>
          <option value="realizado">Realizado</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as SourceFilter)} aria-label="Filtrar por origen" className="admin-select">
          <option value="todas">Todos los orígenes</option>
          <option value="interna">Sitio ELSI</option>
          <option value="externa">Plataforma externa</option>
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div style={bulkBannerStyle}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>
            {selectedIds.length} seleccionado{selectedIds.length > 1 ? "s" : ""}
          </span>
          <Button
            type="button" variant="primary" size="sm"
            onClick={() => { setCertificateFiles([]); setCertificateTarget(displayedEnrollments.filter(e => selectedSet.has(e.id))); }}
          >
            <Upload size={14} /> Cargar constancias
          </Button>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} widths={["1.5rem", "9rem", "12rem", "6rem", "6rem", "6rem", "8rem"]} />
      ) : (
        <AdminTable
          rows={filtered}
          rowKey={(e) => e.id}
          minWidth="44rem"
          actionsHeader=""
          columns={[
            {
              key: "select", desktopOnly: true,
              header: (
                <input
                  type="checkbox"
                  aria-label="Seleccionar todas las inscripciones en curso"
                  checked={allPendingSelected}
                  onChange={toggleSelectAll}
                  disabled={pendingIds.length === 0}
                  className="admin-checkbox"
                />
              ),
              cell: (e) => e.status === "en-curso" ? (
                <input
                  type="checkbox"
                  aria-label={`Seleccionar inscripción de ${e.userName}`}
                  checked={selectedSet.has(e.id)}
                  onChange={() => toggleSelect(e.id)}
                  className="admin-checkbox"
                />
              ) : null,
            },
            { key: "user", header: "Usuario", primary: true, cell: (e) => <span style={{ fontWeight: 500 }}>{e.userName}</span> },
            { key: "course", header: "Curso", cell: (e) => <span className="admin-cell-truncate admin-cell-muted" title={e.courseName}>{e.courseName}</span> },
            { key: "source", header: "Origen", cell: (e) => <SourceBadge source={e.source} /> },
            { key: "status", header: "Estado", cell: (e) => <StatusCell enrollment={e} /> },
            { key: "date", header: "Fecha", mobileLabel: "Inscrito el", cell: (e) => <span className="admin-cell-muted">{e.enrolledAt}</span> },
          ]}
          actions={(e) => (
            <>
              {e.status === "en-curso" && (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setCertificateFiles([]); setIsReplace(false); setCertificateTarget([e]); }}>
                    <Upload size={12} /> Constancia
                  </Button>
                  <Button
                    type="button" variant="ghost" size="sm"
                    title="Respaldo para casos excepcionales, sin constancia"
                    onClick={() => setManualTarget(e)}
                  >
                    <CheckCircle2 size={12} /> Marcar realizado
                  </Button>
                </>
              )}
              {e.status === "realizado" && (
                <>
                  {e.certificateStatus === "pendiente" && (
                    <Button type="button" variant="ghost" size="sm" onClick={async () => {
                      if (persistedEnrollments && e.certificateId) {
                        const response = await fetch(`/api/admin/certificates/${e.certificateId}`, { method: "PATCH" });
                        if (!response.ok) { toast({ title: "Primero carga la constancia.", variant: "error" }); return; }
                        setPersistedEnrollments(prev => (prev ?? []).map(item => item.id === e.id ? { ...item, certificateStatus: "disponible" } : item));
                      } else markCertificateAvailable(e.id);
                      toast({ title: "Constancia publicada.", variant: "success" });
                    }}>
                      <CheckCircle2 size={12} /> Marcar disponible
                    </Button>
                  )}
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => { setCertificateFiles([]); setIsReplace(!!e.certificateStatus); setCertificateTarget([e]); }}
                  >
                    <Upload size={12} /> {e.certificateStatus ? "Reemplazar" : "Cargar constancia"}
                  </Button>
                </>
              )}
            </>
          )}
          empty={
            displayedEnrollments.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={20} aria-hidden="true" />}
                title="Sin inscripciones todavía"
                hint="Registra la primera inscripción con el formulario de arriba."
              />
            ) : (
              <EmptyState
                icon={<SearchX size={20} aria-hidden="true" />}
                title="Sin coincidencias"
                hint="Ninguna inscripción coincide con los filtros actuales. Ajusta la búsqueda, el estado o el origen."
              />
            )
          }
        />
      )}

      <CertificateDialog
        enrollments={certificateTarget}
        isReplace={isReplace}
        files={certificateFiles}
        onFiles={setCertificateFiles}
        onClose={() => { setCertificateTarget([]); setCertificateFiles([]); setIsReplace(false); }}
        onConfirm={confirmCertificates}
      />

      <ConfirmDialog
        open={!!manualTarget}
        title="Marcar como realizado"
        description={manualTarget
          ? `Se marcará el curso como realizado para ${manualTarget.userName} (${manualTarget.courseName}) sin cargar una constancia. Úsalo solo para casos excepcionales.`
          : ""}
        confirmLabel="Marcar realizado"
        onClose={() => setManualTarget(null)}
        onConfirm={() => {
          if (manualTarget) {
            if (persistedEnrollments) {
              fetch(`/api/admin/enrollments/${manualTarget.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "completed" }) })
                .then(async response => {
                  if (!response.ok) throw new Error("No fue posible actualizar la inscripción");
                  setPersistedEnrollments(prev => (prev ?? []).map(e => e.id === manualTarget.id ? { ...e, status: "realizado" } : e));
                  toast({ title: "Curso marcado como realizado.", variant: "success" });
                })
                .catch(() => toast({ title: "No fue posible actualizar la inscripción.", variant: "error" }));
            } else {
              completeEnrollment(manualTarget.id, "manual");
              toast({ title: "Curso marcado como realizado.", variant: "success" });
            }
          }
          setManualTarget(null);
        }}
      />
    </div>
  );
}
