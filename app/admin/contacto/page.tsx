"use client";

import { Suspense, useMemo, useState } from "react";
import { Search, SearchX, Inbox, CheckCircle2, Mail, Phone } from "lucide-react";
import { useAdminCollection, type Lead, type LeadStatus } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminExportButton } from "@/components/admin/export-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatAdminDate } from "@/lib/admin-format";
import { AdminListToolbar, AdminPageHeader } from "@/components/admin/page-header";
import { adminPageParam, useAdminUrlState } from "@/lib/admin-url-state";
import type { AdminUser } from "@/lib/admin-data";

type PersistedLead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  source: string | null;
  status: "new" | "contacted" | "closed";
  assigned_to?: string | null;
  resolved_at?: string | null;
  admin_notes?: string | null;
  course_title?: string | null;
  created_at: string;
};

function leadFromRow(row: PersistedLead): Lead {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    company: row.company ?? undefined,
    message: row.message,
    courseSlug: row.source?.startsWith("course:") ? row.source.slice(7) : undefined,
    assignedTo: row.assigned_to ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    createdAt: row.created_at.slice(0, 10),
    status: row.status === "new" ? "nuevo" : row.status === "closed" ? "cerrado" : "en-seguimiento",
  };
}

const filterControlStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" };

function StatusBadge({ status }: { status: LeadStatus }) {
  if (status === "nuevo") return <Badge variant="default">Nuevo</Badge>;
  if (status === "en-seguimiento") return <Badge variant="outline">En seguimiento</Badge>;
  return <Badge variant="secondary">Cerrado</Badge>;
}

function ContactWorkspace() {
  const { toast } = useToast();
  const { searchParams, update } = useAdminUrlState();
  const query = searchParams.get("q") ?? "";
  const rawStatus = searchParams.get("status");
  const page = adminPageParam(searchParams.get("page"));
  const sort = searchParams.get("sort") ?? "created_at";
  const direction = searchParams.get("direction") === "asc" ? "asc" : "desc";
  const [openLead, setOpenLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25", sort, direction });
    if (query.trim()) params.set("q", query.trim());
    if (rawStatus && ["new", "contacted", "closed"].includes(rawStatus)) params.set("status", rawStatus);
    return `/api/admin/leads?${params}`;
  }, [direction, page, query, rawStatus, sort]);
  const { items, pagination, loading, error, setItems } = useAdminCollection<PersistedLead>(url, "leads");
  const admins = useAdminCollection<AdminUser>("/api/admin/users?pageSize=100&sort=full_name&direction=asc&role=admin", "users");
  const displayedLeads = useMemo(() => items.map(leadFromRow), [items]);
  const courseTitles = useMemo(() => new Map(items.map((lead) => [lead.id, lead.course_title ?? null])), [items]);
  const adminNames = useMemo(() => new Map(admins.items.map((admin) => [admin.id, admin.name])), [admins.items]);
  const newCount = displayedLeads.filter((lead) => lead.status === "nuevo").length;
  const courseTitle = (lead: Lead) => courseTitles.get(lead.id) ?? (lead.courseSlug ? lead.courseSlug.replaceAll("-", " ") : null);

  const saveLead = async (lead: Lead, patch: Partial<Lead> = {}) => {
    const next = { ...lead, ...patch };
    setSaving(true);
    const status = next.status === "nuevo" ? "new" : next.status === "cerrado" ? "closed" : "contacted";
    const persisted = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, assignedTo: next.assignedTo || null, adminNotes: next.adminNotes ?? "" }) });
    setSaving(false);
    if (!persisted.ok) {
      toast({ title: "No fue posible actualizar el mensaje.", variant: "error" });
      return;
    }
    setItems((previous) => previous.map((item) => item.id === lead.id ? { ...item, status, assigned_to: next.assignedTo ?? null, admin_notes: next.adminNotes ?? null, resolved_at: status === "closed" ? new Date().toISOString() : null } : item));
    setOpenLead(null);
    toast({ title: "Seguimiento actualizado.", variant: "success" });
  };

  return (
    <div>
      <AdminPageHeader title="Contacto" description={<>{pagination.total} mensajes · {newCount} nuevos en esta página</>} actions={<AdminExportButton endpoint="/api/admin/leads" filename="elsi-contacto.csv" params={url.split("?")[1]} />} />

      <AdminListToolbar>
        <div data-grow="true" style={{ position: "relative" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => update({ q: e.target.value, page: null })}
            placeholder="Buscar por nombre, correo o mensaje"
            aria-label="Buscar mensajes de contacto"
            style={{ ...filterControlStyle, width: "100%", paddingLeft: "2rem" }}
          />
        </div>
        <select value={rawStatus ?? "todos"} onChange={(e) => update({ status: e.target.value, page: null })} aria-label="Filtrar por estado" className="admin-select">
          <option value="todos">Todos los estados</option>
          <option value="new">Nuevos</option><option value="contacted">En seguimiento</option><option value="closed">Cerrados</option>
        </select>
        <select value={`${sort}:${direction}`} onChange={(event) => { const [nextSort, nextDirection] = event.target.value.split(":"); update({ sort: nextSort, direction: nextDirection, page: null }); }} aria-label="Ordenar mensajes" className="admin-select"><option value="created_at:desc">Más recientes</option><option value="created_at:asc">Más antiguos</option><option value="full_name:asc">Nombre A–Z</option></select>
      </AdminListToolbar>

      {error ? <p role="alert" className="admin-page-sub">{error}</p> : null}
      {loading ? (
        <TableSkeleton rows={5} widths={["9rem", "14rem", "9rem", "6rem", "6rem", "9rem"]} />
      ) : (
        <AdminTable
          rows={displayedLeads}
          rowKey={(l) => l.id}
          minWidth="46rem"
          actionsHeader=""
          columns={[
            { key: "name", header: "Nombre", primary: true, cell: (l) => <span style={{ fontWeight: 500 }}>{l.name}</span> },
            {
              key: "contact", header: "Contacto",
              cell: (l) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem", alignItems: "flex-end", textAlign: "right" }}>
                  <a href={`mailto:${l.email}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text)" }}><Mail size={12} aria-hidden="true" />{l.email}</a>
                  <a href={`tel:${l.phone.replace(/[^0-9+]/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}><Phone size={12} aria-hidden="true" />{l.phone}</a>
                </div>
              ),
            },
            { key: "course", header: "Curso", cell: (l) => <span className="admin-cell-truncate admin-cell-muted" title={courseTitle(l) ?? undefined}>{courseTitle(l) ?? "—"}</span> },
            { key: "owner", header: "Responsable", cell: (l) => <span className="admin-cell-muted">{l.assignedTo ? adminNames.get(l.assignedTo) ?? "Asignado" : "Sin asignar"}</span> },
            { key: "date", header: "Fecha", cell: (l) => <span className="admin-cell-muted">{formatAdminDate(l.createdAt)}</span> },
            { key: "status", header: "Estado", cell: (l) => <StatusBadge status={l.status} /> },
          ]}
          actions={(l) => (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenLead(l)}>Ver mensaje</Button>
              {l.status === "nuevo" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => void saveLead(l, { status: "en-seguimiento" })} disabled={saving}>
                  <CheckCircle2 size={12} /> Iniciar seguimiento
                </Button>
              )}
            </>
          )}
          empty={
            displayedLeads.length === 0 ? (
              <EmptyState
                icon={<Inbox size={20} aria-hidden="true" />}
                title="Sin mensajes todavía"
                hint="Los mensajes enviados desde el formulario de contacto aparecerán aquí."
              />
            ) : (
              <EmptyState
                icon={<SearchX size={20} aria-hidden="true" />}
                title="Sin coincidencias"
                hint="Ningún mensaje coincide con los filtros actuales. Ajusta la búsqueda o el estado."
              />
            )
          }
        />
      )}
      <AdminPagination pagination={pagination} onPageChange={(nextPage) => update({ page: nextPage })} />

      <Dialog open={!!openLead} onOpenChange={(open) => { if (!open) setOpenLead(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensaje de {openLead?.name}</DialogTitle>
            <DialogDescription>
              {openLead?.email} · {openLead?.phone}{openLead?.courseSlug && openLead ? ` · ${courseTitle(openLead)}` : ""} · {formatAdminDate(openLead?.createdAt ?? "")}
            </DialogDescription>
          </DialogHeader>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap", margin: "0 0 1rem" }}>
            {openLead?.message}
          </p>
          {openLead ? <div style={{ display: "grid", gap: ".75rem", marginBottom: "1rem" }}>
            <label className="admin-label">Estado<select value={openLead.status} onChange={(event) => setOpenLead({ ...openLead, status: event.target.value as LeadStatus })} className="admin-select" style={{ width: "100%" }}><option value="nuevo">Nuevo</option><option value="en-seguimiento">En seguimiento</option><option value="cerrado">Cerrado</option></select></label>
            <label className="admin-label">Responsable<select value={openLead.assignedTo ?? ""} onChange={(event) => setOpenLead({ ...openLead, assignedTo: event.target.value || undefined })} className="admin-select" style={{ width: "100%" }}><option value="">Sin asignar</option>{admins.items.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}</select></label>
            <label className="admin-label">Notas internas<textarea value={openLead.adminNotes ?? ""} onChange={(event) => setOpenLead({ ...openLead, adminNotes: event.target.value })} rows={4} maxLength={5000} className="admin-input" /></label>
          </div> : null}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" variant="ghost" onClick={() => setOpenLead(null)}>Cerrar</Button>
            <Button type="button" variant="primary" disabled={saving} onClick={() => { if (openLead) void saveLead(openLead); }}>{saving ? "Guardando…" : "Guardar seguimiento"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminContacto() {
  return <Suspense fallback={<TableSkeleton rows={5} widths={["9rem", "14rem", "9rem", "6rem"]} />}><ContactWorkspace /></Suspense>;
}
