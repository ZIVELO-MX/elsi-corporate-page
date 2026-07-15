"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { useAdminData, type EnrollmentSource, type Enrollment } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function SourceBadge({ source }: { source: EnrollmentSource }) {
  return (
    <Badge variant={source === "interna" ? "secondary" : "outline"} style={{ fontSize: "0.6875rem" }}>
      {source === "interna" ? "Sitio ELSI" : "Plataforma externa"}
    </Badge>
  );
}

function StatusCell({ enrollment }: { enrollment: Enrollment }) {
  if (enrollment.status === "en-curso") {
    return <Badge variant="secondary" style={{ fontSize: "0.6875rem" }}>En curso</Badge>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
      <Badge variant="default" style={{ fontSize: "0.6875rem" }}>Realizado</Badge>
      {enrollment.certificateStatus && (
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          {enrollment.certificateStatus === "disponible" ? "Constancia disponible" : "Constancia pendiente de publicación"}
        </span>
      )}
    </div>
  );
}

function CertificateDialog({
  enrollments, onClose, onConfirm,
}: {
  enrollments: Enrollment[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isBulk = enrollments.length > 1;
  return (
    <Dialog open={enrollments.length > 0} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBulk ? `Cargar constancias (${enrollments.length})` : "Cargar constancia"}</DialogTitle>
          <DialogDescription>
            {isBulk
              ? "Se marcará como realizado a todos los alumnos seleccionados y sus constancias quedarán pendientes de publicación."
              : `${enrollments[0]?.userName} — ${enrollments[0]?.courseName}`}
          </DialogDescription>
        </DialogHeader>

        {isBulk && (
          <ul style={{ listStyle: "none", margin: "0 0 1rem", padding: 0, display: "flex", flexDirection: "column", gap: "0.375rem", maxHeight: "10rem", overflowY: "auto" }}>
            {enrollments.map(e => (
              <li key={e.id} style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.userName} · {e.courseName}</li>
            ))}
          </ul>
        )}

        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          padding: "1.5rem", border: "1px dashed var(--input)", borderRadius: "var(--radius-sm)",
          cursor: "pointer", marginBottom: "1.25rem",
        }}>
          <Upload size={20} color="var(--text-muted)" />
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            {isBulk ? "Arrastra los archivos o hacé click para elegirlos" : "Arrastra el archivo o hacé click para elegirlo"}
          </span>
          <input type="file" multiple={isBulk} accept=".pdf,.png,.jpg" style={{ display: "none" }} />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {isBulk ? "Cargar constancias" : "Cargar constancia"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminEnrollments() {
  const { courses, users, enrollments, addEnrollment, completeEnrollment, completeEnrollmentsBulk } = useAdminData();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [source, setSource] = useState<EnrollmentSource>("interna");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [certificateTarget, setCertificateTarget] = useState<Enrollment[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) return;
    addEnrollment(selectedUser, selectedCourse, source);
    setSelectedUser("");
    setSelectedCourse("");
    setSource("interna");
  };

  const pendingIds = enrollments.filter(e => e.status === "en-curso").map(e => e.id);
  const allPendingSelected = pendingIds.length > 0 && pendingIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedIds(allPendingSelected ? [] : pendingIds);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const confirmCertificates = () => {
    if (certificateTarget.length > 1) {
      completeEnrollmentsBulk(certificateTarget.map(e => e.id));
    } else if (certificateTarget[0]) {
      completeEnrollment(certificateTarget[0].id, "constancia");
    }
    setSelectedIds([]);
    setCertificateTarget([]);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Inscripciones</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>{enrollments.length} inscripciones registradas</p>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: "flex", gap: "0.75rem", alignItems: "flex-end",
        padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)",
        border: "1px solid var(--border)", marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Usuario</label>
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }}>
            <option value="">Seleccionar usuario</option>
            {users.filter(u => u.role === "user").map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Curso</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }}>
            <option value="">Seleccionar curso</option>
            {courses.filter(c => c.status === "active").map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "10rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Origen</label>
          <select value={source} onChange={e => setSource(e.target.value as EnrollmentSource)}
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }}>
            <option value="interna">Sitio ELSI</option>
            <option value="externa">Plataforma externa</option>
          </select>
        </div>
        <Button type="submit" variant="primary">Inscribir</Button>
      </form>

      {selectedIds.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem",
          padding: "0.75rem 1.25rem", background: "var(--primary-light)", borderRadius: "var(--radius)",
          marginBottom: "1rem",
        }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>
            {selectedIds.length} seleccionado{selectedIds.length > 1 ? "s" : ""}
          </span>
          <Button
            type="button" variant="primary" size="sm"
            onClick={() => setCertificateTarget(enrollments.filter(e => selectedIds.includes(e.id)))}
          >
            <Upload size={14} /> Cargar constancias
          </Button>
        </div>
      )}

      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "44rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                <th style={{ padding: "0.75rem 1rem", width: "2.5rem" }}>
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todas las inscripciones en curso"
                    checked={allPendingSelected}
                    onChange={toggleSelectAll}
                    disabled={pendingIds.length === 0}
                    style={{ width: "1rem", height: "1rem" }}
                  />
                </th>
                {["Usuario", "Curso", "Origen", "Estado", "Fecha de inscripción", ""].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {e.status === "en-curso" && (
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar inscripción de ${e.userName}`}
                        checked={selectedIds.includes(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        style={{ width: "1rem", height: "1rem" }}
                      />
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{e.userName}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.courseName}</td>
                  <td style={{ padding: "0.75rem 1rem" }}><SourceBadge source={e.source} /></td>
                  <td style={{ padding: "0.75rem 1rem" }}><StatusCell enrollment={e} /></td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.enrolledAt}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {e.status === "en-curso" && (
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        <Button type="button" variant="outline" size="sm" onClick={() => setCertificateTarget([e])}>
                          <Upload size={12} /> Constancia
                        </Button>
                        <Button
                          type="button" variant="ghost" size="sm"
                          title="Respaldo para casos excepcionales, sin constancia"
                          onClick={() => completeEnrollment(e.id, "manual")}
                        >
                          <CheckCircle2 size={12} /> Marcar realizado
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "2rem 1rem", textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Todavía no hay inscripciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CertificateDialog
        enrollments={certificateTarget}
        onClose={() => setCertificateTarget([])}
        onConfirm={confirmCertificates}
      />
    </div>
  );
}
