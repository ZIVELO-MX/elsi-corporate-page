"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Search, SearchX, Quote, Trash2 } from "lucide-react";
import { useAdminData, type Testimonial } from "@/lib/admin-data";
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
};

const emptyForm = (): TestimonialForm => ({ authorName: "", authorRole: "", quote: "", courseId: "", avatarUrl: "" });

const fieldLabelStyle: React.CSSProperties = { display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" };
const fieldInputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)", color: "var(--text)" };
const fieldGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "1rem" };
const rowBtnStyle: React.CSSProperties = { width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" };
const thStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" };
const noteStyle: React.CSSProperties = { margin: "0 0 1.25rem", padding: "0.625rem 0.875rem", fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--text-muted)", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" };

function Field({ label, children }: { label: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return <div><label htmlFor={id} style={fieldLabelStyle}>{label}</label>{children(id)}</div>;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      authorName: form.authorName.trim(),
      authorRole: form.authorRole.trim(),
      quote: form.quote.trim(),
      courseId: form.courseId || undefined,
      avatarUrl: form.avatarUrl.trim() || undefined,
    };
    if (!payload.authorName || !payload.authorRole || !payload.quote) {
      toast({ title: "Completa autor, rol y testimonio.", variant: "error" });
      return;
    }
    if (editing) {
      updateTestimonial(editing, payload);
      toast({ title: "Cambios guardados.", variant: "success" });
    } else {
      addTestimonial({ ...payload, active: true });
      toast({ title: "Testimonio creado.", variant: "success" });
    }
    closeForm();
  };

  const startEdit = (t: Testimonial) => {
    const next: TestimonialForm = {
      authorName: t.authorName, authorRole: t.authorRole, quote: t.quote,
      courseId: t.courseId ?? "", avatarUrl: t.avatarUrl ?? "",
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
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Testimonios</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
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
                <Field label="Autor">{(id) => <input id={id} required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} style={fieldInputStyle} />}</Field>
                <Field label="Rol">{(id) => <input id={id} required value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} placeholder="Ej. Docente de secundaria" style={fieldInputStyle} />}</Field>
              </div>
              <Field label="Testimonio">{(id) => (
                <textarea id={id} required rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="Cita textual del alumno o cliente." style={{ ...fieldInputStyle, resize: "vertical", fontFamily: "inherit" }} />
              )}</Field>
              <Field label="Curso relacionado (opcional)">{(id) => (
                <select id={id} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="admin-select" style={{ width: "100%" }}>
                  <option value="">Sin curso</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              )}</Field>
              <Field label="URL del avatar (opcional)">{(id) => <input id={id} value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." style={fieldInputStyle} />}</Field>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <Button type="button" onClick={requestClose}>Cancelar</Button>
              <Button type="submit" variant="primary">{editing ? "Guardar cambios" : "Crear testimonio"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <TableSkeleton rows={4} widths={["11rem", "18rem", "9rem", "5rem", "5rem"]} />
      ) : (
        <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <div className="admin-table-scroll">
            <table className="admin-table" style={{ width: "100%", minWidth: "48rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                  {["Autor", "Testimonio", "Curso", "Estado", "Acciones"].map((h) => <th key={h} scope="col" style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 0 }}>
                      <button type="button" onClick={() => startEdit(t)} className="admin-user-row-btn" style={rowBtnStyle}>
                        <span style={{ display: "block", fontSize: "0.875rem", fontWeight: 500 }}>{t.authorName}</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.authorRole}</span>
                      </button>
                    </td>
                    <td className="admin-cell-truncate" title={t.quote} style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)", maxWidth: "22rem" }}>{t.quote}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{courseTitle(t.courseId)}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button type="button" onClick={() => toggleTestimonial(t.id)}
                        aria-label={`Cambiar estado de testimonio de ${t.authorName}; actualmente ${t.active ? "activo" : "inactivo"}`}
                        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                        <Badge variant={t.active ? "default" : "secondary"}>{t.active ? "Activo" : "Inactivo"}</Badge>
                      </button>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteTarget(t)}>
                        <Trash2 size={13} aria-hidden="true" /> Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 0 }}>
                      {testimonials.length === 0 ? (
                        <EmptyState icon={<Quote size={20} aria-hidden="true" />} title="Sin testimonios todavía" hint="Crea el primer testimonio con el botón de arriba." />
                      ) : (
                        <EmptyState icon={<SearchX size={20} aria-hidden="true" />} title="Sin coincidencias" hint="Ningún testimonio coincide con los filtros actuales. Ajusta la búsqueda o el estado." />
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
          if (deleteTarget) { deleteTestimonial(deleteTarget.id); toast({ title: "Testimonio eliminado.", variant: "success" }); }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
