"use client";

import { useEffect, useState } from "react";
import { useAdminResource, type PageSection } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const toggleBtnStyle: React.CSSProperties = {
  position: "relative", width: "2.5rem", height: "1.5rem", borderRadius: "1rem",
  border: "none", cursor: "pointer", transition: "background var(--motion-fast) var(--ease-out)", flexShrink: 0,
};
const sectionTextareaStyle: React.CSSProperties = {
  width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)",
  borderRadius: "var(--radius-sm)", fontSize: "0.875rem", resize: "vertical",
  background: "var(--paper)", color: "var(--text)", fontFamily: "inherit", lineHeight: 1.5,
};

type SectionRow = { id: string; section_key: string; title: string; body: unknown; is_active: boolean };
type SolutionRow = { id: string; slug: string; title: string; summary: string; body: unknown; content_status: "fixture" | "verified"; is_active: boolean; sort_order: number };
type SolutionDraft = { slug: string; title: string; summary: string; contentStatus: "fixture" | "verified"; active: boolean };

function rowToSection(section: SectionRow): PageSection {
  return {
    id: section.id,
    key: section.section_key,
    label: section.title,
    content: section.body && typeof section.body === "object" && "text" in section.body && typeof (section.body as { text: unknown }).text === "string"
      ? (section.body as { text: string }).text
      : "",
    active: section.is_active,
  };
}

async function patchSection(section: PageSection, patch: { content?: string; active?: boolean }): Promise<void> {
  const response = await fetch(`/api/admin/content/${section.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sectionKey: section.key,
      title: section.label,
      body: { text: patch.content ?? section.content },
      isActive: patch.active ?? section.active,
    }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: unknown };
    throw new Error(typeof payload.error === "string" ? payload.error : "No fue posible guardar la sección.");
  }
}

async function patchSolution(id: string, solution: SolutionDraft): Promise<SolutionRow> {
  const response = await fetch(`/api/admin/solutions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...solution, isActive: solution.active }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: unknown; solution?: SolutionRow };
  if (!response.ok || !payload.solution) throw new Error(typeof payload.error === "string" ? payload.error : "No fue posible guardar la solución.");
  return payload.solution;
}

function solutionDraft(solution: SolutionRow): SolutionDraft {
  return { slug: solution.slug, title: solution.title, summary: solution.summary, contentStatus: solution.content_status, active: solution.is_active };
}

export default function AdminContent() {
  const { toast } = useToast();
  const { data, loading, error } = useAdminResource<{ sections: SectionRow[]; solutions: SolutionRow[] }>("/api/admin/content");
  const [persistedSections, setPersistedSections] = useState<PageSection[] | null>(null);
  const [solutions, setSolutions] = useState<SolutionRow[]>([]);
  const [solutionDrafts, setSolutionDrafts] = useState<Record<string, SolutionDraft>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    setPersistedSections(data.sections.map(rowToSection));
    setSolutions(data.solutions);
  }, [data]);

  const visibleSections = persistedSections ?? [];

  const setDraft = (id: string, content: string) => setDrafts((current) => ({ ...current, [id]: content }));
  const draftOf = (section: PageSection) => drafts[section.id] ?? section.content;
  const isDirty = (section: PageSection) => draftOf(section) !== section.content;

  const clearError = (id: string) => setErrors((current) => { if (!(id in current)) return current; const next = { ...current }; delete next[id]; return next; });
  const clearDraft = (id: string) => setDrafts((current) => { if (!(id in current)) return current; const next = { ...current }; delete next[id]; return next; });

  const saveContent = async (section: PageSection) => {
    const content = draftOf(section);
    setSavingId(section.id);
    clearError(section.id);
    try {
      await patchSection(section, { content });
      setPersistedSections((current) => (current ?? visibleSections).map((item) => item.id === section.id ? { ...item, content } : item));
      clearDraft(section.id);
      toast({ title: "Cambios guardados.", variant: "success" });
    } catch (cause) {
      // Keep the draft so the admin can retry; never pretend the save succeeded.
      setErrors((current) => ({ ...current, [section.id]: cause instanceof Error ? cause.message : "No fue posible guardar la sección." }));
      toast({ title: "No se pudo guardar. Revisa e intenta de nuevo.", variant: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const cancelEdit = (section: PageSection) => { clearDraft(section.id); clearError(section.id); };

  const toggleActive = async (section: PageSection) => {
    const active = !section.active;
    setPersistedSections((current) => (current ?? visibleSections).map((item) => item.id === section.id ? { ...item, active } : item));
    try {
      await patchSection(section, { active });
    } catch {
      setPersistedSections((current) => (current ?? visibleSections).map((item) => item.id === section.id ? { ...item, active: section.active } : item));
      toast({ title: "No fue posible cambiar la visibilidad.", variant: "error" });
    }
  };

  const editSolution = (solution: SolutionRow, patch: Partial<SolutionDraft>) => {
    setSolutionDrafts((current) => ({ ...current, [solution.id]: { ...(current[solution.id] ?? solutionDraft(solution)), ...patch } }));
    clearError(solution.id);
  };

  const saveSolution = async (solution: SolutionRow) => {
    const draft = solutionDrafts[solution.id];
    if (!draft) return;
    setSavingId(solution.id);
    clearError(solution.id);
    try {
      const saved = await patchSolution(solution.id, draft);
      setSolutions((current) => current.map((item) => item.id === solution.id ? saved : item));
      setSolutionDrafts((current) => { const next = { ...current }; delete next[solution.id]; return next; });
      toast({ title: "Solución guardada.", variant: "success" });
    } catch (cause) {
      setErrors((current) => ({ ...current, [solution.id]: cause instanceof Error ? cause.message : "No fue posible guardar la solución." }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="admin-page-title">Contenido</h1>
        <p className="admin-page-sub">
          Edita los textos y activa/desactiva secciones de la página corporativa. Los cambios se guardan al presionar Guardar.
        </p>
      </div>

      {loading ? <p className="admin-page-sub">Cargando contenido…</p> : null}
      {error ? <p role="alert" className="admin-page-sub">{error}</p> : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {visibleSections.map((s) => {
          const dirty = isDirty(s);
          const error = errors[s.id];
          return (
            <div key={s.id} style={{
              padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)",
              border: `1px solid ${error ? "var(--danger, #b3261e)" : "var(--border)"}`,
              opacity: s.active ? 1 : 0.6,
              transition: "opacity var(--motion-fast) var(--ease-out)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>{s.label}</h2>
                  <Badge variant={s.active ? "default" : "secondary"} style={{ fontSize: "0.75rem" }}>
                    {s.active ? "Activo" : "Inactivo"}
                  </Badge>
                  {dirty && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cambios sin guardar</span>}
                </div>
                <button type="button" onClick={() => void toggleActive(s)}
                  role="switch" aria-checked={s.active}
                  style={{ ...toggleBtnStyle, background: s.active ? "var(--primary)" : "var(--border)" }}
                  aria-label={`${s.active ? "Desactivar" : "Activar"} sección ${s.label}`}>
                  <span style={{
                    display: "block", width: "1.125rem", height: "1.125rem", borderRadius: "50%",
                    background: "var(--card)", transition: "transform var(--motion-fast) var(--ease-out)",
                    transform: s.active ? "translateX(1.25rem)" : "translateX(0.1875rem)",
                  }} />
                </button>
              </div>
              <textarea
                value={draftOf(s)}
                onChange={(e) => { setDraft(s.id, e.target.value); clearError(s.id); }}
                rows={3}
                aria-label={`Contenido de la sección ${s.label}`}
                aria-invalid={error ? true : undefined}
                style={sectionTextareaStyle}
              />
              {error && <p role="alert" style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem", color: "var(--danger, #b3261e)" }}>{error}</p>}
              {dirty && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", justifyContent: "flex-end" }}>
                  <Button type="button" onClick={() => cancelEdit(s)} disabled={savingId === s.id}>Cancelar</Button>
                  <Button type="button" variant="primary" onClick={() => void saveContent(s)} disabled={savingId === s.id}>
                    {savingId === s.id ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ margin: "2rem 0 1rem" }}>
        <h2 className="admin-section-title">Soluciones</h2>
        <p className="admin-page-sub">Administra el contenido, la visibilidad y la verificación editorial de las soluciones públicas.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {solutions.map((solution) => {
          const draft = solutionDrafts[solution.id] ?? solutionDraft(solution);
          const dirty = solution.id in solutionDrafts;
          const error = errors[solution.id];
          return (
            <section key={solution.id} style={{ padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: `1px solid ${error ? "var(--danger, #b3261e)" : "var(--border)"}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(10rem, 1fr) minmax(10rem, 1fr)", gap: "0.75rem" }}>
                <label className="admin-label">Título<input value={draft.title} onChange={(event) => editSolution(solution, { title: event.target.value })} className="admin-input" /></label>
                <label className="admin-label">Slug<input value={draft.slug} onChange={(event) => editSolution(solution, { slug: event.target.value })} className="admin-input" /></label>
              </div>
              <label className="admin-label" style={{ display: "block", marginTop: "0.75rem" }}>Resumen<textarea value={draft.summary} onChange={(event) => editSolution(solution, { summary: event.target.value })} rows={3} className="admin-input" style={{ resize: "vertical", fontFamily: "inherit" }} /></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "end", marginTop: "0.75rem" }}>
                <label className="admin-label">Visibilidad<select value={draft.active ? "active" : "inactive"} onChange={(event) => editSolution(solution, { active: event.target.value === "active" })} className="admin-select"><option value="active">Visible</option><option value="inactive">Oculta</option></select></label>
                <label className="admin-label">Editorial<select value={draft.contentStatus} onChange={(event) => editSolution(solution, { contentStatus: event.target.value as SolutionDraft["contentStatus"] })} className="admin-select"><option value="fixture">Pendiente</option><option value="verified">Verificada</option></select></label>
                {dirty ? <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}><Button type="button" onClick={() => { setSolutionDrafts((current) => { const next = { ...current }; delete next[solution.id]; return next; }); clearError(solution.id); }} disabled={savingId === solution.id}>Cancelar</Button><Button type="button" variant="primary" onClick={() => void saveSolution(solution)} disabled={savingId === solution.id}>{savingId === solution.id ? "Guardando…" : "Guardar"}</Button></div> : null}
              </div>
              {error ? <p role="alert" style={{ color: "var(--danger, #b3261e)", fontSize: "0.8125rem" }}>{error}</p> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
