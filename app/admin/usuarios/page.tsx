"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { useAdminData, type AdminUser } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const dialogAvatarStyle: React.CSSProperties = { width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--secondary-foreground)", flexShrink: 0 };
const enrollmentListStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "16rem", overflowY: "auto" };
const rowBtnStyle: React.CSSProperties = { width: "100%", textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" };

function SourceBadge({ source }: { source: "interna" | "externa" }) {
  return (
    <Badge variant={source === "interna" ? "secondary" : "outline"} style={{ fontSize: "0.6875rem" }}>
      {source === "interna" ? "Sitio ELSI" : "Plataforma externa"}
    </Badge>
  );
}

function UserDetailDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const { enrollments } = useAdminData();
  const userEnrollments = user ? enrollments.filter(e => e.userId === user.id) : [];

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        {user && (
          <>
            <DialogHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={dialogAvatarStyle}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <DialogTitle>{user.name}</DialogTitle>
                  <DialogDescription style={{ marginTop: "0.125rem" }}>{user.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} style={{ fontSize: "0.6875rem" }}>
                {user.role === "admin" ? "Admin" : "Usuario"}
              </Badge>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
                Registrado el {user.createdAt}
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.625rem" }}>
              Cursos ({userEnrollments.length})
            </p>

            {userEnrollments.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
                Este usuario todavía no tiene inscripciones.
              </p>
            ) : (
              <ul style={enrollmentListStyle}>
                {userEnrollments.map(e => (
                  <li key={e.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem",
                    padding: "0.625rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.courseName}</p>
                      <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>Inscrito el {e.enrolledAt}</p>
                    </div>
                    <SourceBadge source={e.source} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { loading, users, enrollments } = useAdminData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  const enrollmentCount = (userId: string) => enrollments.filter(e => e.userId === userId).length;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Usuarios</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>{users.length} usuarios registrados</p>
        </div>
        <div style={{ position: "relative", width: "16rem", maxWidth: "100%" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuarios"
            style={{
              width: "100%", padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.8125rem",
              border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)",
            }}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} widths={["9rem", "12rem", "5rem", "6rem", "6rem"]} />
      ) : (
      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="admin-table-scroll">
          <table className="admin-table" style={{ width: "100%", minWidth: "36rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                {["Nombre", "Email", "Rol", "Cursos inscritos", "Registro"].map(h => (
                  <th key={h} scope="col" style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "Cursos inscritos" ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 0 }}>
                    <button
                      type="button"
                      onClick={() => setSelected(u)}
                      className="admin-user-row-btn"
                      style={rowBtnStyle}
                    >
                      {u.name}
                    </button>
                  </td>
                  <td className="admin-cell-truncate" title={u.email} style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} style={{ fontSize: "0.6875rem" }}>
                      {u.role === "admin" ? "Admin" : "Usuario"}
                    </Badge>
                  </td>
                  <td className="admin-num" style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem" }}>{enrollmentCount(u.id)}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{u.createdAt}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <EmptyState
                      icon={<SearchX size={20} aria-hidden="true" />}
                      title="Sin coincidencias"
                      hint={`Ningún usuario coincide con “${query}”. Prueba con otro nombre o correo.`}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <UserDetailDialog user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
