"use client";

import { useEffect, useState } from "react";
import { useAdminData, type PageSection } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
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

export default function AdminContent() {
  const { sections, updateSection } = useAdminData();
  const { toast } = useToast();
  const [persistedSections, setPersistedSections] = useState<PageSection[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Pick<PageSection, "content" | "active">>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/content")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!active || !payload?.sections) return;
        setPersistedSections(payload.sections.map((section: { id: string; section_key: string; title: string; body: unknown; is_active: boolean }) => ({
          id: section.id,
          key: section.section_key,
          label: section.title,
          content: section.body && typeof section.body === "object" && "text" in section.body && typeof section.body.text === "string" ? section.body.text : "",
          active: section.is_active,
        })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const visibleSections = persistedSections ?? sections;
  const draftFor = (section: PageSection) => drafts[section.id] ?? { content: section.content, active: section.active };
  const updateDraft = (section: PageSection, data: Partial<Pick<PageSection, "content" | "active">>) => {
    setDrafts((current) => ({ ...current, [section.id]: { ...draftFor(section), ...data } }));
    setSaveError(null);
  };
  const saveSection = async (section: PageSection) => {
    const draft = draftFor(section);
    setSavingId(section.id);
    setSaveError(null);
    const response = await fetch(`/api/admin/content/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionKey: section.key, title: section.label, body: { text: draft.content }, isActive: draft.active }),
    });
    if (!response.ok) {
      const message = `No se pudo guardar “${section.label}”.`;
      setSaveError(message);
      toast({ title: message, variant: "error" });
      setSavingId(null);
      return;
    }
    updateSection(section.id, draft);
    setPersistedSections((current) => (current ? current.map((item) => item.id === section.id ? { ...item, ...draft } : item) : current));
    setDrafts((current) => { const next = { ...current }; delete next[section.id]; return next; });
    setSavingId(null);
    toast({ title: "Cambios guardados.", variant: "success" });
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="admin-page-title">Contenido</h1>
        <p className="admin-page-sub">
          Edita los textos y activa/desactiva secciones de la página corporativa.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {saveError ? <p role="alert" style={{ color: "var(--destructive)", fontSize: "0.875rem" }}>{saveError}</p> : null}
        {visibleSections.map(s => {
          const draft = draftFor(s);
          const dirty = draft.content !== s.content || draft.active !== s.active;
          return (
          <div key={s.id} style={{
            padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            opacity: draft.active ? 1 : 0.5,
            transition: "opacity var(--motion-fast) var(--ease-out)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>{s.label}</h2>
                <Badge variant={draft.active ? "default" : "secondary"} style={{ fontSize: "0.75rem" }}>
                  {draft.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <button type="button" onClick={() => updateDraft(s, { active: !draft.active })}
                role="switch" aria-checked={draft.active}
                style={{ ...toggleBtnStyle, background: draft.active ? "var(--primary)" : "var(--border)" }}
                aria-label={`${draft.active ? "Desactivar" : "Activar"} sección ${s.label}`}>
                <span style={{
                  display: "block", width: "1.125rem", height: "1.125rem", borderRadius: "50%",
                  background: "var(--card)", transition: "transform var(--motion-fast) var(--ease-out)",
                  transform: draft.active ? "translateX(1.25rem)" : "translateX(0.1875rem)",
                }} />
              </button>
            </div>
            <textarea value={draft.content} onChange={e => updateDraft(s, { content: e.target.value })}
              rows={3}
              aria-label={`Contenido de la sección ${s.label}`}
              style={sectionTextareaStyle} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button type="button" disabled={!dirty || savingId === s.id}
                onClick={() => setDrafts((current) => { const next = { ...current }; delete next[s.id]; return next; })}
                style={{ minHeight: "2.5rem", padding: "0.5rem 0.875rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--card)", color: "var(--text)", opacity: dirty ? 1 : 0.5 }}>
                Cancelar
              </button>
              <button type="button" disabled={!dirty || savingId === s.id} onClick={() => void saveSection(s)}
                style={{ minHeight: "2.5rem", padding: "0.5rem 0.875rem", border: "1px solid var(--primary)", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "white", opacity: dirty ? 1 : 0.5 }}>
                {savingId === s.id ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
