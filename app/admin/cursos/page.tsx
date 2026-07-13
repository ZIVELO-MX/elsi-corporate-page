"use client";

import { useState } from "react";
import { useAdminData, type AdminCourse } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CourseForm = {
  title: string;
  category: string;
  slug: string;
  price: number;
  externalUrl: string;
};

const emptyForm = (): CourseForm => ({ title: "", category: "", slug: "", price: 0, externalUrl: "" });

export default function AdminCourses() {
  const { courses, addCourse, updateCourse, toggleCourse } = useAdminData();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateCourse(editing, form);
    } else {
      addCourse({ ...form, status: "active" });
    }
    setEditing(null);
    setShowForm(false);
    setForm(emptyForm());
  };

  const startEdit = (c: AdminCourse) => {
    setEditing(c.id);
    setForm({ title: c.title, category: c.category, slug: c.slug, price: c.price, externalUrl: c.externalUrl });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Cursos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>{courses.length} cursos registrados</p>
        </div>
        <Button variant="primary" onClick={startCreate}>Crear curso</Button>
      </div>

      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.3)", padding: "1rem",
        }} onClick={() => { setShowForm(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} style={{
            background: "var(--card)", borderRadius: "var(--radius-lg)",
            padding: "2rem", width: "100%", maxWidth: "32rem",
            boxShadow: "var(--shadow-card)", maxHeight: "90vh", overflowY: "auto",
          }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.125rem", fontWeight: 700, margin: "0 0 1.5rem" }}>
              {editing ? "Editar curso" : "Crear curso"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(["title", "category", "slug"] as const).map(field => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem", textTransform: "capitalize" }}>
                    {field === "slug" ? "Slug" : field === "title" ? "Título" : "Categoría"}
                  </label>
                  <input required value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Precio</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Enlace externo</label>
                <input value={form.externalUrl} onChange={e => setForm({ ...form, externalUrl: e.target.value })} placeholder="https://..."
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <Button type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
              <Button type="submit" variant="primary">{editing ? "Guardar cambios" : "Crear curso"}</Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["Título", "Categoría", "Estado", "Estudiantes", "Enlace externo", "Acciones"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{c.title}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{c.category}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge variant={c.status === "active" ? "default" : "secondary"} style={{ cursor: "pointer" }} onClick={() => toggleCourse(c.id)}>
                    {c.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem" }}>{c.students}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem" }}>
                  {c.externalUrl ? (
                    <input value={c.externalUrl} onChange={e => updateCourse(c.id, { externalUrl: e.target.value })}
                      style={{ width: "100%", padding: "0.25rem 0.5rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", background: "var(--paper)" }} />
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => startEdit(c)} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>Editar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
