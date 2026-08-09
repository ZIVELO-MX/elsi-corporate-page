"use client";

import { Suspense, useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { extractAdminError, useAdminCollection, type AdminUser } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminExportButton } from "@/components/admin/export-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatAdminDate } from "@/lib/admin-format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { AdminListToolbar, AdminPageHeader } from "@/components/admin/page-header";
import { adminPageParam, useAdminUrlState } from "@/lib/admin-url-state";

const enrollmentListStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "16rem", overflowY: "auto" };

function SourceBadge({ source }: { source: "interna" | "externa" }) {
  return (
    <Badge variant={source === "interna" ? "secondary" : "outline"} style={{ fontSize: "0.75rem" }}>
      {source === "interna" ? "Sitio ELSI" : "Plataforma externa"}
    </Badge>
  );
}

function UserDetailDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        {user && (
          <>
            <DialogHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Avatar><AvatarImage src={user.avatarUrl} alt="" /><AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <div>
                  <DialogTitle>{user.name}</DialogTitle>
                  <DialogDescription style={{ marginTop: "0.125rem" }}>{user.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} style={{ fontSize: "0.75rem" }}>
                {user.role === "admin" ? "Admin" : "Usuario"}
              </Badge>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
                Registrado el {formatAdminDate(user.createdAt)}
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.625rem" }}>
              Cursos ({user.enrolledCourses})
            </p>

            <UserEnrollments userId={user.id} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type UserEnrollmentRow = { id: string; enrolled_at: string; source: "internal" | "external" | "stripe"; course: { title: string } | null };

function UserEnrollments({ userId }: { userId: string }) {
  const { items, loading } = useAdminCollection<UserEnrollmentRow>(`/api/admin/enrollments?userId=${encodeURIComponent(userId)}&pageSize=25`, "enrollments");
  if (loading) return <p className="admin-page-sub">Cargando inscripciones…</p>;
  if (items.length === 0) return <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>Este usuario todavía no tiene inscripciones.</p>;
  return (
    <ul style={enrollmentListStyle}>
      {items.map((enrollment) => (
        <li key={enrollment.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{enrollment.course?.title ?? "Sin curso"}</p>
            <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>Inscrito el {formatAdminDate(enrollment.enrolled_at)}</p>
          </div>
          <SourceBadge source={enrollment.source === "external" ? "externa" : "interna"} />
        </li>
      ))}
    </ul>
  );
}

function UsersWorkspace() {
  const { toast } = useToast();
  const { searchParams, update } = useAdminUrlState();
  const query = searchParams.get("q") ?? "";
  const role = searchParams.get("role") ?? "todos";
  const sort = searchParams.get("sort") ?? "created_at";
  const direction = searchParams.get("direction") === "asc" ? "asc" : "desc";
  const page = adminPageParam(searchParams.get("page"));
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ user: AdminUser; role: "admin" | "user" } | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25", sort, direction });
    if (query.trim()) params.set("q", query.trim());
    if (role === "admin" || role === "student") params.set("role", role);
    return `/api/admin/users?${params}`;
  }, [direction, page, query, role, sort]);
  const { items: users, pagination, loading, error, reload } = useAdminCollection<AdminUser>(url, "users");

  const changeRole = async () => {
    if (!roleTarget) return;
    setRoleSaving(true);
    const response = await fetch(`/api/admin/users/${roleTarget.user.id}/role`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: roleTarget.role === "admin" ? "admin" : "student" }),
    });
    setRoleSaving(false);
    if (!response.ok) {
      toast({ title: await extractAdminError(response, "No fue posible cambiar el rol."), variant: "error" });
      return;
    }
    toast({ title: "Rol actualizado.", variant: "success" });
    setRoleTarget(null);
    reload();
  };

  return (
    <div>
      <AdminPageHeader title="Usuarios" description={`${pagination.total} usuarios registrados`} actions={<AdminExportButton endpoint="/api/admin/users" filename="elsi-usuarios.csv" params={url.split("?")[1]} />} />
      <AdminListToolbar>
          <div data-grow="true" style={{ position: "relative" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={e => update({ q: e.target.value, page: null })}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuarios"
            style={{
              width: "100%", padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.8125rem",
              border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)",
            }}
          />
          </div>
          <select value={role} onChange={(event) => update({ role: event.target.value, page: null })} aria-label="Filtrar por rol" className="admin-select"><option value="todos">Todos los roles</option><option value="student">Usuarios</option><option value="admin">Administradores</option></select>
          <select value={`${sort}:${direction}`} onChange={(event) => { const [nextSort, nextDirection] = event.target.value.split(":"); update({ sort: nextSort, direction: nextDirection, page: null }); }} aria-label="Ordenar usuarios" className="admin-select"><option value="created_at:desc">Más recientes</option><option value="created_at:asc">Más antiguos</option><option value="full_name:asc">Nombre A–Z</option><option value="full_name:desc">Nombre Z–A</option></select>
      </AdminListToolbar>

      {error ? <p role="alert" className="admin-page-sub">{error}</p> : null}
      {loading ? (
        <TableSkeleton rows={5} widths={["9rem", "12rem", "5rem", "6rem", "6rem"]} />
      ) : (
        <AdminTable
          rows={users}
          rowKey={(u) => u.id}
          minWidth="36rem"
          columns={[
            {
              key: "name", header: "Nombre", primary: true,
              cell: (u) => (
                <button type="button" onClick={() => setSelected(u)} className="admin-user-row-btn" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
                  <Avatar size="sm"><AvatarImage src={u.avatarUrl} alt="" /><AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>{u.name}
                </button>
              ),
            },
            {
              key: "email", header: "Email",
              cell: (u) => <span className="admin-cell-truncate admin-cell-muted" title={u.email}>{u.email}</span>,
            },
            {
              key: "role", header: "Rol",
              cell: (u) => (
                <select value={u.role} disabled={roleSaving} onChange={(event) => setRoleTarget({ user: u, role: event.target.value as "admin" | "user" })} aria-label={`Cambiar rol de ${u.name}`} className="admin-select"><option value="user">Usuario</option><option value="admin">Admin</option></select>
              ),
            },
            { key: "courses", header: "Cursos inscritos", align: "right", cell: (u) => u.enrolledCourses },
            {
              key: "created", header: "Registro",
              cell: (u) => <span className="admin-cell-muted" style={{ whiteSpace: "nowrap" }}>{formatAdminDate(u.createdAt)}</span>,
            },
          ]}
          empty={
            <EmptyState
              icon={<SearchX size={20} aria-hidden="true" />}
              title="Sin coincidencias"
              hint={`Ningún usuario coincide con “${query}”. Prueba con otro nombre o correo.`}
            />
          }
        />
      )}
      <AdminPagination pagination={pagination} onPageChange={(nextPage) => update({ page: nextPage })} />

      <UserDetailDialog user={selected} onClose={() => setSelected(null)} />
      <ConfirmDialog open={roleTarget !== null} title="¿Cambiar rol?" description={roleTarget ? `${roleTarget.user.name} tendrá rol de ${roleTarget.role === "admin" ? "administrador" : "usuario"}. Tu propio acceso y el último administrador están protegidos.` : ""} confirmLabel={roleSaving ? "Guardando…" : "Confirmar cambio"} onClose={() => { if (!roleSaving) setRoleTarget(null); }} onConfirm={() => void changeRole()} />
    </div>
  );
}

export default function AdminUsers() {
  return <Suspense fallback={<TableSkeleton rows={5} widths={["9rem", "12rem", "5rem", "6rem", "6rem"]} />}><UsersWorkspace /></Suspense>;
}
