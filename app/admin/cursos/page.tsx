"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAdminData, type AdminCourse, type CourseModality } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
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

const emptyForm = (): CourseForm => ({
  title: "", category: "", slug: "", price: 0, externalUrl: "",
  synopsis: "", duration: "", targetAudience: "", curriculum: "",
  modality: "online", presencialLocation: "", presencialDate: "", presencialTime: "", presencialInfo: "",
});

const fieldLabelStyle: React.CSSProperties = { display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" };
const fieldInputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)", color: "var(--text)" };

export default function AdminCourses() {
  const { loading, courses, addCourse, updateCourse, toggleCourse } = useAdminData();
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyForm());
  const [initialForm, setInitialForm] = useState<CourseForm>(emptyForm());
  const [discardOpen, setDiscardOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(c => {
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });
  }, [courses, query, statusFilter]);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    setInitialForm(emptyForm());
  };

  // Guard against losing edits: only prompt when the form actually changed.
  // The form modal steps aside for the confirm (single modal at a time) but keeps
  // its state, so "Seguir editando" can reopen it exactly where it was left.
  const requestClose = () => {
    if (isDirty) {
      setShowForm(false);
      setDiscardOpen(true);
    } else {
      closeForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim().toLowerCase();
    const slugTaken = courses.some(c => c.slug.toLowerCase() === slug && c.id !== editing);
    if (slugTaken) {
      toast({ title: "Ya existe un curso con ese slug.", variant: "error" });
      return;
    }
    if (editing) {
      updateCourse(editing, form);
      toast({ title: "Cambios guardados.", variant: "success" });
    } else {
      addCourse({ ...form, status: "active" });
      toast({ title: "Curso creado.", variant: "success" });
    }
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
    setInitialForm(next);
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setInitialForm(emptyForm());
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Cursos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            {filtered.length === courses.length
              ? `${courses.length} cursos registrados`
              : `${filtered.length} de ${courses.length} cursos`}
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
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" }}
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
              <div>
                <label style={fieldLabelStyle}>Título</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={fieldInputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={fieldLabelStyle}>Categoría</label>
                  <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={fieldInputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Slug</label>
                  <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} style={fieldInputStyle} />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Sinopsis</label>
                <textarea required rows={3} value={form.synopsis} onChange={e => setForm({ ...form, synopsis: e.target.value })}
                  placeholder="Resumen breve del curso para el listado público."
                  style={{ ...fieldInputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={fieldLabelStyle}>Duración</label>
                  <input required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="Ej. 8 horas" style={fieldInputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Precio</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} style={fieldInputStyle} />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Público objetivo</label>
                <input required value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="Ej. Docentes y promotores comunitarios" style={fieldInputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Temario (temas y subtemas)</label>
                <textarea rows={5} value={form.curriculum} onChange={e => setForm({ ...form, curriculum: e.target.value })}
                  placeholder={"Un tema por línea. Antecede subtemas con \"- \".\nEj.\nIntroducción\n- Objetivos\n- Alcance"}
                  style={{ ...fieldInputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Modalidad</label>
                <select value={form.modality} onChange={e => setForm({ ...form, modality: e.target.value as CourseModality })} style={fieldInputStyle}>
                  <option value="online">En línea</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
              {form.modality === "online" ? (
                <div>
                  <label style={fieldLabelStyle}>Enlace de acceso en línea</label>
                  <input value={form.externalUrl} onChange={e => setForm({ ...form, externalUrl: e.target.value })} placeholder="https://..." style={fieldInputStyle} />
                </div>
              ) : (
                <>
                  <div>
                    <label style={fieldLabelStyle}>Lugar</label>
                    <input required value={form.presencialLocation} onChange={e => setForm({ ...form, presencialLocation: e.target.value })}
                      placeholder="Ej. Campus Central ELSI, Auditorio B" style={fieldInputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={fieldLabelStyle}>Fecha</label>
                      <input required value={form.presencialDate} onChange={e => setForm({ ...form, presencialDate: e.target.value })}
                        placeholder="Ej. 2025-08-14" style={fieldInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Hora</label>
                      <input required value={form.presencialTime} onChange={e => setForm({ ...form, presencialTime: e.target.value })}
                        placeholder="Ej. 09:00 - 13:00" style={fieldInputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Información general</label>
                    <textarea rows={2} value={form.presencialInfo} onChange={e => setForm({ ...form, presencialInfo: e.target.value })}
                      placeholder="Cupo, requisitos de acceso, recomendaciones para asistentes."
                      style={{ ...fieldInputStyle, resize: "vertical", fontFamily: "inherit" }} />
                  </div>
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
      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "46rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["Título", "Categoría", "Modalidad", "Duración", "Estado", "Estudiantes", "Acciones"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 0 }}>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="admin-user-row-btn"
                    style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" }}
                  >
                    {c.title}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{c.category}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge variant="outline" style={{ fontSize: "0.6875rem" }}>{c.modality === "online" ? "En línea" : "Presencial"}</Badge>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{c.duration}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <button
                    type="button"
                    onClick={() => toggleCourse(c.id)}
                    aria-label={`Cambiar estado de ${c.title}; actualmente ${c.status === "active" ? "activo" : "inactivo"}`}
                    style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>
                      {c.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </button>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem" }}>{c.students}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>Editar &rarr;</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2.5rem 1rem", textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Ningún curso coincide con los filtros actuales.
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
