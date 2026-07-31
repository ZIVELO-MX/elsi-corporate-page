"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { useAdminData, type AdminCourse, type CourseModality } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type StatusFilter = "todos" | "active" | "inactive";

type CourseForm = {
  title: string;
  category: string;
  slug: string;
  price: number;
  externalUrl: string;
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

type PersistedCourse = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string | null;
  duration_hours: number | null;
  audience: string | null;
  syllabus: unknown;
  modality: "online" | "in_person";
  location: string | null;
  starts_at: string | null;
  enrollment_link: string | null;
  price_cents: number;
  is_active: boolean;
  created_at: string;
};

function courseFromRow(row: PersistedCourse): AdminCourse {
  const syllabus = row.syllabus && typeof row.syllabus === "object" && !Array.isArray(row.syllabus)
    ? row.syllabus as Record<string, unknown>
    : {};
  const curriculum = typeof syllabus.curriculum === "string" ? syllabus.curriculum : "";
  const presencialInfo = typeof syllabus.presencialInfo === "string" ? syllabus.presencialInfo : "";
  const startsAt = row.starts_at ?? "";
  const startDate = startsAt ? startsAt.slice(0, 10) : "";
  const startTime = startsAt.includes("T") ? startsAt.slice(11, 16) : "";
  return {
    id: row.id,
    title: row.title,
    category: typeof syllabus.category === "string" ? syllabus.category : "General",
    slug: row.slug,
    price: row.price_cents / 100,
    status: row.is_active ? "active" : "inactive",
    externalUrl: row.enrollment_link ?? "",
    students: 0,
    createdAt: row.created_at.slice(0, 10),
    synopsis: row.short_description,
    duration: row.duration_hours ? `${row.duration_hours} horas` : "",
    targetAudience: row.audience ?? "",
    curriculum,
    modality: row.modality === "in_person" ? "presencial" : "online",
    presencialLocation: row.location ?? "",
    presencialDate: startDate,
    presencialTime: startTime,
    presencialInfo,
  };
}

function coursePayload(course: Omit<AdminCourse, "id" | "students" | "createdAt">) {
  const duration = Number.parseFloat(course.duration.replace(",", "."));
  const startsAt = course.modality === "presencial" && course.presencialDate
    ? `${course.presencialDate}T${course.presencialTime || "00:00"}:00`
    : null;
  return {
    slug: course.slug,
    title: course.title,
    shortDescription: course.synopsis,
    description: course.synopsis,
    durationHours: Number.isFinite(duration) ? duration : null,
    audience: course.targetAudience,
    syllabus: { category: course.category, curriculum: course.curriculum, presencialInfo: course.presencialInfo },
    modality: course.modality,
    location: course.modality === "presencial" ? course.presencialLocation : null,
    startsAt,
    enrollmentLink: course.externalUrl || null,
    priceCents: Math.round(course.price * 100),
    contentStatus: "fixture" as const,
    isActive: course.status === "active",
  };
}

const emptyForm = (): CourseForm => ({
  title: "", category: "", slug: "", price: 0, externalUrl: "",
  synopsis: "", duration: "", targetAudience: "", curriculum: "",
  modality: "online", presencialLocation: "", presencialDate: "", presencialTime: "", presencialInfo: "",
});

const fieldGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "1rem" };

// Pairs a label with its control via a generated id, so screen readers announce
// them together (fixes label-has-associated-control / control-has-associated-label).
function Field({ label, children }: { label: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="admin-label">{label}</label>
      {children(id)}
    </div>
  );
}

export default function AdminCourses() {
  const { loading, courses, addCourse, updateCourse, toggleCourse } = useAdminData();
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseForm>(() => emptyForm());
  const initialFormRef = useRef<CourseForm | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [persistedCourses, setPersistedCourses] = useState<AdminCourse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/courses")
      .then(async response => response.ok ? response.json() : null)
      .then(payload => {
        if (!cancelled && payload?.courses) setPersistedCourses((payload.courses as PersistedCourse[]).map(courseFromRow));
      })
      .catch(() => { /* Fixtures remain available while Supabase is not configured. */ });
    return () => { cancelled = true; };
  }, []);

  const displayedCourses = persistedCourses ?? courses;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayedCourses.filter(c => {
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });
  }, [displayedCourses, query, statusFilter]);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    initialFormRef.current = null;
  };

  // Guard against losing edits: only prompt when the form actually changed.
  // The form modal steps aside for the confirm (single modal at a time) but keeps
  // its state, so "Seguir editando" can reopen it exactly where it was left.
  const requestClose = () => {
    const isDirty = initialFormRef.current !== null
      && JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
    if (isDirty) {
      setShowForm(false);
      setDiscardOpen(true);
    } else {
      closeForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim().toLowerCase();
    const slugTaken = displayedCourses.some(c => c.slug.toLowerCase() === slug && c.id !== editing);
    if (slugTaken) {
      toast({ title: "Ya existe un curso con ese slug.", variant: "error" });
      return;
    }
    const nextCourse = { ...form, slug, status: editing ? displayedCourses.find(c => c.id === editing)?.status ?? "active" : "active" };
    if (persistedCourses) {
      const response = await fetch(editing ? `/api/admin/courses/${editing}` : "/api/admin/courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(coursePayload(nextCourse)),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast({ title: payload?.error ?? "No fue posible guardar el curso.", variant: "error" });
        return;
      }
      const payload = await response.json() as { course: PersistedCourse };
      setPersistedCourses(prev => editing
        ? (prev ?? []).map(course => course.id === editing ? courseFromRow(payload.course) : course)
        : [...(prev ?? []), courseFromRow(payload.course)]);
    } else if (editing) {
      updateCourse(editing, nextCourse);
    } else {
      addCourse(nextCourse);
    }
    toast({ title: editing ? "Cambios guardados." : "Curso creado.", variant: "success" });
    closeForm();
  };

  const startEdit = (c: AdminCourse) => {
    const next: CourseForm = {
      title: c.title, category: c.category, slug: c.slug, price: c.price, externalUrl: c.externalUrl,
      synopsis: c.synopsis, duration: c.duration, targetAudience: c.targetAudience, curriculum: c.curriculum,
      modality: c.modality, presencialLocation: c.presencialLocation, presencialDate: c.presencialDate,
      presencialTime: c.presencialTime, presencialInfo: c.presencialInfo,
    };
    setEditing(c.id);
    setForm(next);
    initialFormRef.current = next;
    setShowForm(true);
  };

  const startCreate = () => {
    const next = emptyForm();
    setEditing(null);
    setForm(next);
    initialFormRef.current = next;
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="admin-page-title">Cursos</h1>
          <p className="admin-page-sub">
            {filtered.length === displayedCourses.length
              ? `${displayedCourses.length} cursos registrados`
              : `${filtered.length} de ${displayedCourses.length} cursos`}
          </p>
        </div>
        <Button variant="primary" onClick={startCreate}>Crear curso</Button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "14rem" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por título o categoría"
            aria-label="Buscar cursos"
            style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filtrar por estado"
          className="admin-select"
        >
          <option value="todos">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) requestClose(); }}>
        <DialogContent style={{ maxWidth: "34rem", maxHeight: "85vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar curso" : "Crear curso"}</DialogTitle>
            <DialogDescription>Información pública y operativa que verán alumnos y administradores.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Field label="Título">{id => <input id={id} required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="admin-input" />}</Field>
              <div style={fieldGridStyle}>
                <Field label="Categoría">{id => <input id={id} required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="admin-input" />}</Field>
                <Field label="Slug">{id => <input id={id} required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="admin-input" />}</Field>
              </div>
              <Field label="Sinopsis">{id => (
                <textarea id={id} required rows={3} value={form.synopsis} onChange={e => setForm({ ...form, synopsis: e.target.value })}
                  placeholder="Resumen breve del curso para el listado público."
                  className="admin-input" style={{ resize: "vertical", fontFamily: "inherit" }} />
              )}</Field>
              <div style={fieldGridStyle}>
                <Field label="Duración">{id => <input id={id} required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="Ej. 8 horas" className="admin-input" />}</Field>
                <Field label="Precio">{id => <input id={id} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="admin-input" />}</Field>
              </div>
              <Field label="Público objetivo">{id => (
                <input id={id} required value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="Ej. Docentes y promotores comunitarios" className="admin-input" />
              )}</Field>
              <Field label="Temario (temas y subtemas)">{id => (
                <textarea id={id} rows={5} value={form.curriculum} onChange={e => setForm({ ...form, curriculum: e.target.value })}
                  placeholder={"Un tema por línea. Antecede subtemas con \"- \".\nEj.\nIntroducción\n- Objetivos\n- Alcance"}
                  className="admin-input" style={{ resize: "vertical", fontFamily: "inherit" }} />
              )}</Field>
              <Field label="Modalidad">{id => (
                <select id={id} value={form.modality} onChange={e => setForm({ ...form, modality: e.target.value as CourseModality })} className="admin-select" style={{ width: "100%" }}>
                  <option value="online">En línea</option>
                  <option value="presencial">Presencial</option>
                </select>
              )}</Field>
              {form.modality === "online" ? (
                <Field label="Enlace de acceso en línea">{id => <input id={id} value={form.externalUrl} onChange={e => setForm({ ...form, externalUrl: e.target.value })} placeholder="https://..." className="admin-input" />}</Field>
              ) : (
                <>
                  <Field label="Lugar">{id => (
                    <input id={id} required value={form.presencialLocation} onChange={e => setForm({ ...form, presencialLocation: e.target.value })}
                      placeholder="Ej. Campus Central ELSI, Auditorio B" className="admin-input" />
                  )}</Field>
                  <div style={fieldGridStyle}>
                    <Field label="Fecha">{id => (
                      <input id={id} required value={form.presencialDate} onChange={e => setForm({ ...form, presencialDate: e.target.value })}
                        placeholder="Ej. 2025-08-14" className="admin-input" />
                    )}</Field>
                    <Field label="Hora">{id => (
                      <input id={id} required value={form.presencialTime} onChange={e => setForm({ ...form, presencialTime: e.target.value })}
                        placeholder="Ej. 09:00 - 13:00" className="admin-input" />
                    )}</Field>
                  </div>
                  <Field label="Información general">{id => (
                    <textarea id={id} rows={2} value={form.presencialInfo} onChange={e => setForm({ ...form, presencialInfo: e.target.value })}
                      placeholder="Cupo, requisitos de acceso, recomendaciones para asistentes."
                      className="admin-input" style={{ resize: "vertical", fontFamily: "inherit" }} />
                  )}</Field>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <Button type="button" onClick={requestClose}>Cancelar</Button>
              <Button type="submit" variant="primary">{editing ? "Guardar cambios" : "Crear curso"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <TableSkeleton rows={6} widths={["12rem", "8rem", "5rem", "5rem", "5rem", "4rem", "4rem"]} />
      ) : (
        <AdminTable
          rows={filtered}
          rowKey={(c) => c.id}
          minWidth="42rem"
          columns={[
            {
              key: "title", header: "Título", primary: true,
              cell: (c) => (
                <button type="button" onClick={() => startEdit(c)} className="admin-user-row-btn">
                  {c.title}
                </button>
              ),
            },
            { key: "category", header: "Categoría", cell: (c) => <span className="admin-cell-muted">{c.category}</span> },
            { key: "modality", header: "Modalidad", cell: (c) => <Badge variant="outline" style={{ fontSize: "0.75rem" }}>{c.modality === "online" ? "En línea" : "Presencial"}</Badge> },
            { key: "duration", header: "Duración", cell: (c) => <span className="admin-cell-muted">{c.duration}</span> },
            {
              key: "status", header: "Estado",
              cell: (c) => (
                <button type="button" onClick={async () => {
                  if (!persistedCourses) { toggleCourse(c.id); return; }
                  const next: AdminCourse = { ...c, status: c.status === "active" ? "inactive" : "active" };
                  const response = await fetch(`/api/admin/courses/${c.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(coursePayload(next)) });
                  if (response.ok) {
                    const payload = await response.json() as { course: PersistedCourse };
                    setPersistedCourses(prev => (prev ?? []).map(course => course.id === c.id ? courseFromRow(payload.course) : course));
                  } else toast({ title: "No fue posible cambiar el estado.", variant: "error" });
                }}
                  aria-label={`Cambiar estado de ${c.title}; actualmente ${c.status === "active" ? "activo" : "inactivo"}`}
                  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>
                    {c.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </button>
              ),
            },
            { key: "students", header: "Estudiantes", align: "right", cell: (c) => c.students },
          ]}
          empty={
            <EmptyState
              icon={<SearchX size={20} aria-hidden="true" />}
              title="Sin coincidencias"
              hint="Ningún curso coincide con los filtros actuales. Ajusta la búsqueda o el estado."
            />
          }
        />
      )}

      <ConfirmDialog
        open={discardOpen}
        title="Descartar cambios"
        description="Hay cambios sin guardar en este curso. Si sales ahora se perderán."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        destructive
        onClose={() => { setDiscardOpen(false); setShowForm(true); }}
        onConfirm={() => { setDiscardOpen(false); closeForm(); }}
      />
    </div>
  );
}
