"use client";

import { useAdminData } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";

export default function AdminContent() {
  const { sections, updateSection } = useAdminData();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Contenido</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          Edita los textos y activa/desactiva secciones de la página corporativa.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sections.map(s => (
          <div key={s.id} style={{
            padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            opacity: s.active ? 1 : 0.5,
            transition: "opacity var(--motion-fast)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>{s.label}</h2>
                <Badge variant={s.active ? "default" : "secondary"} style={{ fontSize: "0.6875rem" }}>
                  {s.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <button onClick={() => updateSection(s.id, { active: !s.active })}
                role="switch" aria-checked={s.active}
                style={{
                  position: "relative", width: "2.5rem", height: "1.5rem", borderRadius: "1rem",
                  background: s.active ? "var(--primary)" : "var(--border)",
                  border: "none", cursor: "pointer", transition: "background var(--motion-fast)",
                  flexShrink: 0,
                }} aria-label={`${s.active ? "Desactivar" : "Activar"} sección ${s.label}`}>
                <span style={{
                  display: "block", width: "1.125rem", height: "1.125rem", borderRadius: "50%",
                  background: "#fff", transition: "transform var(--motion-fast)",
                  transform: s.active ? "translateX(1.25rem)" : "translateX(0.1875rem)",
                }} />
              </button>
            </div>
            <textarea value={s.content} onChange={e => updateSection(s.id, { content: e.target.value })}
              rows={3}
              aria-label={`Contenido de la sección ${s.label}`}
              style={{
                width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)",
                borderRadius: "var(--radius-sm)", fontSize: "0.875rem", resize: "vertical",
                background: "var(--paper)", color: "var(--text)", fontFamily: "inherit", lineHeight: 1.5,
              }} />
          </div>
        ))}
      </div>
    </div>
  );
}
