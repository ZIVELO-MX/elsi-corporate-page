"use client";

import { useEffect, useState } from "react";
import { useAdminData, type PageSection } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";

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
  const [persistedSections, setPersistedSections] = useState<PageSection[] | null>(null);

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
  const saveSection = (section: PageSection, data: Partial<PageSection>) => {
    updateSection(section.id, data);
    setPersistedSections((current) => (current ? current.map((item) => item.id === section.id ? { ...item, ...data } : item) : current));
    void fetch(`/api/admin/content/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionKey: section.key, title: section.label, body: { text: data.content ?? section.content }, isActive: data.active ?? section.active }),
    });
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
        {visibleSections.map(s => (
          <div key={s.id} style={{
            padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            opacity: s.active ? 1 : 0.5,
            transition: "opacity var(--motion-fast) var(--ease-out)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>{s.label}</h2>
                <Badge variant={s.active ? "default" : "secondary"} style={{ fontSize: "0.75rem" }}>
                  {s.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <button type="button" onClick={() => saveSection(s, { active: !s.active })}
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
            <textarea value={s.content} onChange={e => saveSection(s, { content: e.target.value })}
              rows={3}
              aria-label={`Contenido de la sección ${s.label}`}
              style={sectionTextareaStyle} />
          </div>
        ))}
      </div>
    </div>
  );
}
