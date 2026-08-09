"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Search, SearchX, Quote, Trash2 } from "lucide-react";
import { useAdminData, type Testimonial } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type StatusFilter = "todos" | "activos" | "inactivos";

type TestimonialForm = {
  authorName: string;
  authorRole: string;
  quote: string;
  courseId: string;
  avatarUrl: string;
  consentReference: string;
};

const emptyForm = (): TestimonialForm => ({ authorName: "", authorRole: "", quote: "", courseId: "", avatarUrl: "", consentReference: "" });

const fieldGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "1rem" };
const noteStyle: React.CSSProperties = { margin: "0 0 1.25rem", padding: "0.625rem 0.875rem", fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--text-muted)", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" };

function Field({ label, children }: { label: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return <div><label htmlFor={id} className="admin-label">{label}</label>{children(id)}</div>;
}

export default function AdminTestimonials() {
  const { loading, testimonials, courses, addTestimonial, updateTestimonial, toggleTestimonial, deleteTestimonial } = useAdminData();
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TestimonialForm>(() => emptyForm());
  const initialFormRef = useRef<TestimonialForm | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [submitting, setSubmitting] = useState(false);

  const courseTitle = (id?: string) => (id ? courses.find((c) => c.id === id)?.title ?? "—" : "—");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testimonials.filter((t) => {
      if (statusFilter === "activos" && !t.active) return false;
      if (statusFilter === "inactivos" && t.active) return false;
      if (!q) return true;
      return t.authorName.toLowerCase().includes(q) || t.authorRole.toLowerCase().includes(q) || t.quote.toLowerCase().includes(q);
    });
  }, [testimonials, query, statusFilter]);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    initialFormRef.current = null;
  };

  const requestClose = () => {
    const isDirty = initialFormRef.current !== null && JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
    if (isDirty) { setShowForm(false); setDiscardOpen(true); } else { closeForm(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      authorName: form.authorName.trim(),
      authorRole: form.authorRole.trim(),
      quote: form.quote.trim(),
      courseId: form.courseId || undefined,
      avatarUrl: form.avatarUrl.trim() || undefined,
      consentReference: form.consentReference.trim() || undefined,
    };
    if (!payload.authorName || !payload.authorRole || !payload.quote || !payload.consentReference) {
      toast({ title: "Completa autor, rol, testimonio y consentimiento.", variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateTestimonial(editing, payload);
        toast({ title: "Cambios guardados.", variant: "success" });
      } else {
        await addTestimonial({ ...payload, active: true });
        toast({ title: "Testimonio creado.", variant: "success" });
      }
      closeForm();
    } catch (cause) {
      toast({ title: cause instanceof Error ? cause.message : "No fue posible guardar el testimonio.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: Testimonial) => {
    const next: TestimonialForm = {
      authorName: t.authorName, authorRole: t.authorRole, quote: t.quote,
      courseId: t.courseId ?? "", avatarUrl: t.avatarUrl ?? "", consentReference: t.consentReference ?? "",
    };
    setEditing(t.id);
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
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <h1 className="admin-page-title">Testimonios</h1>
          <p className="admin-page-sub">
            {filtered.length === testimonials.length ? `${testimonials.length} testimonios` : `${filtered.length} de ${testimonials.length} testimonios`}
          </p>
        </div>
        <Button variant="primary" onClick={startCreate}>Crear testimonio</Button>
      </div>

      <p style={noteStyle}>
        Los testimonios deben ser reales y verificables. Los ejemplos precargados son de validación; sustitúyelos por casos auténticos de ELSI.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "14rem" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por autor, rol o texto" aria-label="Buscar testimonios"
            style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filtrar por estado" className="admin-select">
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) requestClose(); }}>
        <DialogContent style={{ maxWidth: "34rem", maxHeight: "85vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar testimonio" : "Crear testimonio"}</DialogTitle>
            <DialogDescription>Solo testimonios reales y verificables se publican en el sitio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={fieldGridStyle}>
                <Field label="Autor">{(id) => <input id={id} required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="admin-input" />}</Field>
                <Field label="Rol">{(id) => <input id={id} required value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} placeholder="Ej. Docente de secundaria" className="admin-input" />}</Field>
              </div>
              <Field label="Testimonio">{(id) => (
                <textarea id={id} required rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="Cita textual del alumno o cliente." className="admin-input" style={{ resize: "vertical", fontFamily: "inherit" }} />
              )}</Field>
              <Field label="Curso relacionado (opcional)">{(id) => (
                <select id={id} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="admin-select" style={{ width: "100%" }}>
                  <option value="">Sin curso</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              )}</Field>
              <Field label="URL del avatar (opcional)">{(id) => <input id={id} value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." className="admin-input" />}</Field>
              <Field label="Referencia de consentimiento">{(id) => <input id={id} required value={form.consentReference} onChange={(e) => setForm({ ...form, consentReference: e.target.value })} placeholder="Folio, correo o documento autorizado" className="admin-input" />}</Field>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <Button type="button" onClick={requestClose} disabled={submitting}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Guardando…" : editing ? "Guardar cambios" : "Crear testimonio"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <TableSkeleton rows={4} widths={["11rem", "18rem", "9rem", "5rem", "5rem"]} />
      ) : (
        <AdminTable
          rows={filtered}
          rowKey={(t) => t.id}
          minWidth="46rem"
          columns={[
            {
              key: "author", header: "Autor", primary: true,
              cell: (t) => (
                <button type="button" onClick={() => startEdit(t)} className="admin-user-row-btn">
                  <span style={{ display: "block", fontWeight: 500 }}>{t.authorName}</span>
                  <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>{t.authorRole}</span>
                </button>
              ),
            },
            { key: "quote", header: "Testimonio", cell: (t) => <span className="admin-cell-truncate admin-cell-muted" style={{ maxWidth: "16rem" }} title={t.quote}>{t.quote}</span> },
            { key: "course", header: "Curso", cell: (t) => <span className="admin-cell-muted">{courseTitle(t.courseId)}</span> },
            {
              key: "status", header: "Estado",
              cell: (t) => (
                <button type="button" onClick={() => void toggleTestimonial(t.id).catch((cause) => toast({ title: cause instanceof Error ? cause.message : "No fue posible cambiar el estado.", variant: "error" }))}
                  aria-label={`Cambiar estado de testimonio de ${t.authorName}; actualmente ${t.active ? "activo" : "inactivo"}`}
                  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                  <Badge variant={t.active ? "default" : "secondary"}>{t.active ? "Activo" : "Inactivo"}</Badge>
                </button>
              ),
            },
          ]}
          actions={(t) => (
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteTarget(t)}>
              <Trash2 size={13} aria-hidden="true" /> Eliminar
            </Button>
          )}
          empty={
            testimonials.length === 0 ? (
              <EmptyState icon={<Quote size={20} aria-hidden="true" />} title="Sin testimonios todavía" hint="Crea el primer testimonio con el botón de arriba." />
            ) : (
              <EmptyState icon={<SearchX size={20} aria-hidden="true" />} title="Sin coincidencias" hint="Ningún testimonio coincide con los filtros actuales. Ajusta la búsqueda o el estado." />
            )
          }
        />
      )}

      <ConfirmDialog
        open={discardOpen}
        title="Descartar cambios"
        description="Hay cambios sin guardar en este testimonio. Si sales ahora se perderán."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        destructive
        onClose={() => { setDiscardOpen(false); setShowForm(true); }}
        onConfirm={() => { setDiscardOpen(false); closeForm(); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar testimonio"
        description={deleteTarget ? `Se eliminará el testimonio de ${deleteTarget.authorName}. Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target) void deleteTestimonial(target.id)
            .then(() => toast({ title: "Testimonio eliminado.", variant: "success" }))
            .catch((cause) => toast({ title: cause instanceof Error ? cause.message : "No fue posible eliminar el testimonio.", variant: "error" }));
        }}
      />
    </div>
  );
}
